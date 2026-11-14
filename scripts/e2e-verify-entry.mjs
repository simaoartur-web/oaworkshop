import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright-core';

const DEFAULT_SCREENSHOT_DIR = path.join('test-results', 'e2e-screenshots');
const ARTIFACT_DIR = path.resolve(
  process.cwd(),
  process.env.OA_SCREENSHOT_DIR || DEFAULT_SCREENSHOT_DIR,
);

const PORT = Number(process.env.OA_E2E_PORT || 4179);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function getPlatformBrowserCandidates() {
  if (process.platform === 'win32') {
    const roots = [
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
      process.env.LOCALAPPDATA,
    ].filter(Boolean);

    return roots.flatMap((root) => [
      path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(root, 'Chromium', 'Application', 'chrome.exe'),
      path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ]);
  }

  if (process.platform === 'darwin') {
    return [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
  }

  return [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/bin/microsoft-edge',
  ];
}

async function fileExists(targetPath) {
  if (!targetPath) return false;
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findBrowserExecutable() {
  const envPath =
    process.env.OA_E2E_BROWSER || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (envPath) {
    if (await fileExists(envPath)) {
      return envPath;
    }
    throw new Error(
      `Configured browser executable not found at OA_E2E_BROWSER / PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: "${envPath}".`,
    );
  }

  try {
    const bundledChromium = chromium.executablePath();
    if (await fileExists(bundledChromium)) {
      return bundledChromium;
    }
  } catch {
    // Fallback to OS candidates below
  }

  for (const candidate of getPlatformBrowserCandidates()) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    [
      'No Chromium/Chrome/Edge browser executable found for E2E verification.',
      'Fix options:',
      '  1) Install Playwright Chromium: npx playwright install chromium',
      '  2) Or set env var OA_E2E_BROWSER (or PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) to a local Chrome/Edge/Chromium binary.',
    ].join('\n'),
  );
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not respond at ${url} within ${timeoutMs}ms`);
}

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function checkNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assertCondition(
    metrics.scrollWidth <= metrics.innerWidth + 1,
    `${label}: horizontal overflow detected (scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth})`,
  );
}

async function checkHeaderNoClusterOverlap(page, label) {
  const layout = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header || header.children.length < 2) return { ok: true };
    const leftItems = Array.from(header.children[0].children)
      .filter((el) => el.getBoundingClientRect().width > 0);
    const leftInkRight = leftItems.reduce(
      (max, el) => Math.max(max, el.getBoundingClientRect().right),
      0,
    );
    const rightRect = header.children[1].getBoundingClientRect();
    return {
      ok: leftInkRight <= rightRect.left - 4,
      leftInkRight: Math.round(leftInkRight),
      rightLeft: Math.round(rightRect.left),
    };
  });
  assertCondition(
    layout.ok,
    `${label}: header visual overlap (leftInkRight=${layout.leftInkRight}, right.left=${layout.rightLeft})`,
  );
}

function attachRuntimeMonitors(page, unexpectedRequests, runtimeErrors, label) {
  page.on('request', (req) => {
    const url = req.url();
    const allowed =
      url.startsWith(BASE_URL) ||
      url.startsWith('data:') ||
      url.startsWith('https://fonts.googleapis.com') ||
      url.startsWith('https://fonts.gstatic.com');
    if (!allowed) {
      unexpectedRequests.push(`[${label}] ${url}`);
    }
  });

  page.on('pageerror', (err) => {
    runtimeErrors.push(`[${label} pageerror] ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      runtimeErrors.push(`[${label} console.error] ${msg.text()}`);
    }
  });
}

async function main() {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
  const executablePath = await findBrowserExecutable();

  const viteBin = path.resolve('node_modules', 'vite', 'bin', 'vite.js');
  const serverProc = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    { stdio: 'pipe' },
  );

  const unexpectedRequests = [];
  const runtimeErrors = [];

  try {
    await waitForServer(`${BASE_URL}/`);

    const browser = await chromium.launch({
      executablePath,
      headless: true,
    });

    try {
      // 1. DESKTOP 1440x900 — Entry + Hardening + Workspace Shell Flow
      const desktopContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });
      const page = await desktopContext.newPage();
      attachRuntimeMonitors(page, unexpectedRequests, runtimeErrors, 'Desktop-1440');

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      await checkNoHorizontalOverflow(page, 'Login Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_desktop_1440.png'),
        fullPage: false,
      });

      // Verify Forgot Password modal focus trap & focus restoration
      const forgotBtn = page.getByRole('button', {
        name: /Esqueceu-se da palavra-passe/i,
      });
      await forgotBtn.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_forgot_dialog_1440.png'),
        fullPage: false,
      });

      // Confirm Tab and Shift+Tab never leave [role="dialog"] and background is inert
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        const insideDialog = await page.evaluate(() => {
          const dlg = document.querySelector('[role="dialog"]');
          return Boolean(dlg && dlg.contains(document.activeElement));
        });
        assertCondition(insideDialog, `Focus escaped modal on Tab iteration ${i}`);
      }
      await page.keyboard.press('Shift+Tab');
      const insideShift = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        return Boolean(dlg && dlg.contains(document.activeElement));
      });
      assertCondition(insideShift, 'Focus escaped modal on Shift+Tab');

      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });

      const restoredToTrigger = await page.evaluate(() => {
        const el = document.activeElement;
        return Boolean(el && /Esqueceu-se da palavra-passe/i.test(el.textContent || ''));
      });
      assertCondition(restoredToTrigger, 'Focus must restore to Forgot Password button on Escape');

      // Test 1:100 Section SVG + English switch
      await page.getByRole('button', { name: /Mudar idioma para inglês/i }).click();
      await page.getByRole('button', { name: /1:100 Orthogonal Section/i }).click();
      await page.waitForTimeout(200);
      await checkNoHorizontalOverflow(page, 'Login Section EN Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_section_en_1440.png'),
        fullPage: false,
      });

      // Back to PT and log in to /welcome
      await page.getByRole('button', { name: /Switch language to Portuguese/i }).click();
      await page.getByRole('button', { name: /Entrar no Atelier/i }).click();
      await page.waitForURL(`${BASE_URL}/welcome`);
      await page.waitForLoadState('load');
      await page.waitForTimeout(300);
      await checkNoHorizontalOverflow(page, 'Welcome Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_desktop_1440.png'),
        fullPage: false,
      });

      // Enter /workspace (WorkspaceShell + Argon A Studio Desk placeholder)
      await page.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace`);
      await page.waitForLoadState('load');
      await page.waitForTimeout(300);
      await checkNoHorizontalOverflow(page, 'Workspace Shell Expanded 1440px');
      await checkHeaderNoClusterOverlap(page, 'Workspace Shell Expanded 1440px');
      const truncatedRailLabels = await page.evaluate(() =>
        Array.from(document.querySelectorAll('aside nav a span.truncate'))
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .map((el) => `${el.textContent?.trim() ?? ''}(${el.scrollWidth}>${el.clientWidth})`),
      );
      assertCondition(
        truncatedRailLabels.length === 0,
        `Expanded rail labels must not truncate at 264px: ${truncatedRailLabels.join(', ')}`,
      );
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_desktop_expanded_1440.png'),
        fullPage: false,
      });

      // Verify "O meu trabalho" is active by default and "Abrir próxima prioridade" opens task dialog without auto-completing
      const myWorkButton = page.getByRole('button', { name: /^O meu trabalho$/i });
      const myWorkPressed = await myWorkButton.getAttribute('aria-pressed');
      assertCondition(myWorkPressed === 'true', '"O meu trabalho" must be active by default on Studio Desk');
      const openPriorityBtn = page.getByRole('button', { name: /Abrir próxima prioridade/i });
      await openPriorityBtn.click();
      const taskDialog = page.getByRole('dialog');
      await taskDialog.waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await taskDialog.waitFor({ state: 'hidden' });
      const pendingText = await page.getByText(/1\s+por concluir/i).first().isVisible();
      assertCondition(pendingText, '"Abrir próxima prioridade" must keep task pending without auto-completion');
      await page.evaluate(() => {
        const scroller = document.getElementById('workspace-main-scroll');
        if (scroller) scroller.scrollTop = 0;
      });

      // Toggle Architectural Rail -> Compact (72px)
      await page.getByRole('button', { name: /Recolher prancha/i }).click();
      await page.waitForTimeout(250);
      await checkNoHorizontalOverflow(page, 'Workspace Shell Compact 1440px');
      await checkHeaderNoClusterOverlap(page, 'Workspace Shell Compact 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_desktop_compact_1440.png'),
        fullPage: false,
      });

      // Scroll Studio Desk with compact rail & trigger floating non-clipped tooltip on focus
      await page.evaluate(() => {
        const scroller = document.getElementById('workspace-main-scroll');
        if (scroller) scroller.scrollTop = 750;
      });
      await page.getByRole('link', { name: /Projectos/i }).first().focus();
      await page.waitForTimeout(150);
      const compactScrollDiag = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        const header = document.querySelector('header');
        const scroller = document.getElementById('workspace-main-scroll');
        const tooltip = Array.from(document.querySelectorAll('div'))
          .find((d) => d.getAttribute('aria-hidden') === 'true' && d.textContent?.includes('Projectos'));
        return {
          windowScrollY: window.scrollY,
          scrollerTop: scroller ? scroller.scrollTop : 0,
          asideTop: aside ? Math.round(aside.getBoundingClientRect().top) : -1,
          asideHeight: aside ? Math.round(aside.getBoundingClientRect().height) : -1,
          headerTop: header ? Math.round(header.getBoundingClientRect().top) : -1,
          tooltipVisible: Boolean(tooltip && tooltip.getBoundingClientRect().left >= 72),
        };
      });
      assertCondition(compactScrollDiag.scrollerTop >= 700, 'Compact desktop scroller must scroll independently');
      assertCondition(compactScrollDiag.windowScrollY === 0, 'Compact desktop outer window must stay pinned');
      assertCondition(compactScrollDiag.asideTop === 0 && compactScrollDiag.asideHeight === 900, 'Compact sidebar must fill 100% height at top=0');
      assertCondition(compactScrollDiag.headerTop === 0, 'Compact contextual header must stay at top=0');
      assertCondition(compactScrollDiag.tooltipVisible, 'Compact sidebar tooltip must appear outside nav without clipping');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_compact_scrolled_1440.png'),
        fullPage: false,
      });

      // Re-expand rail and verify full-scroll stability in Expanded mode (Before vs After proof)
      await page.getByRole('button', { name: /Expandir prancha/i }).click();
      await page.waitForTimeout(250);
      await checkNoHorizontalOverflow(page, 'Workspace Shell Re-expanded 1440px');

      await page.evaluate(() => {
        const scroller = document.getElementById('workspace-main-scroll');
        if (scroller) scroller.scrollTop = 750;
      });
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_scroll_mid_1440.png'),
        fullPage: false,
      });

      await page.evaluate(() => {
        const scroller = document.getElementById('workspace-main-scroll');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      });
      await page.waitForTimeout(150);
      const bottomScrollDiag = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        const header = document.querySelector('header');
        const scroller = document.getElementById('workspace-main-scroll');
        const collapseBtn = aside?.querySelector('button');
        return {
          windowScrollY: window.scrollY,
          scrollerTop: scroller ? scroller.scrollTop : 0,
          scrollerMax: scroller ? scroller.scrollHeight - scroller.clientHeight : 0,
          asideTop: aside ? Math.round(aside.getBoundingClientRect().top) : -1,
          asideBottom: aside ? Math.round(aside.getBoundingClientRect().bottom) : -1,
          headerTop: header ? Math.round(header.getBoundingClientRect().top) : -1,
          collapseBottom: collapseBtn ? Math.round(collapseBtn.getBoundingClientRect().bottom) : -1,
        };
      });
      assertCondition(bottomScrollDiag.scrollerTop >= 1000, 'Studio Desk must scroll deep inside #workspace-main-scroll');
      assertCondition(bottomScrollDiag.windowScrollY === 0, 'Outer window scrollY must stay 0 on desktop');
      assertCondition(
        bottomScrollDiag.asideTop === 0 && bottomScrollDiag.asideBottom === 900,
        `Expanded sidebar must span full 0..900px height at scroll bottom (got ${bottomScrollDiag.asideTop}..${bottomScrollDiag.asideBottom})`,
      );
      assertCondition(bottomScrollDiag.headerTop === 0, 'Contextual header must stay at top=0 at scroll bottom');
      assertCondition(bottomScrollDiag.collapseBottom <= 900, 'Rail collapse footer must stay inside viewport');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_scroll_bottom_1440.png'),
        fullPage: false,
      });

      // Verify modal opens cleanly over scrolled Studio Desk & header, then Escape closes it
      const dossierBtn = page
        .getByRole('button', {
          name: /Abrir dossier do projecto|Abrir dossier demonstrativo/i,
        })
        .first();
      await dossierBtn.scrollIntoViewIfNeeded();
      await dossierBtn.click();
      const dossierDialog = page.getByRole('dialog');
      await dossierDialog.waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await dossierDialog.waitFor({ state: 'hidden' });

      // Navigate forward from deep scroll -> /workspace/settings resets scrollTop=0, then Back restores position
      await page.evaluate(() => {
        const scroller = document.getElementById('workspace-main-scroll');
        if (scroller) scroller.scrollTop = 900;
      });
      await page.waitForTimeout(80);
      await page.getByRole('link', { name: /Definições/i }).first().click();
      await page.waitForURL(`${BASE_URL}/workspace/settings`);
      const afterRouteScroll = await page.evaluate(
        () => document.getElementById('workspace-main-scroll')?.scrollTop ?? -1,
      );
      assertCondition(afterRouteScroll === 0, `Route switch must reset main scroll to 0 (got ${afterRouteScroll})`);
      await page.goBack();
      await page.waitForURL(`${BASE_URL}/workspace`);
      await page.waitForTimeout(100);
      const backScroll = await page.evaluate(
        () => document.getElementById('workspace-main-scroll')?.scrollTop ?? 0,
      );
      assertCondition(backScroll >= 800, `Browser Back must restore Studio Desk scroll position (got ${backScroll})`);
      await page.goForward();
      await page.waitForURL(`${BASE_URL}/workspace/settings`);
      const forwardScroll = await page.evaluate(
        () => document.getElementById('workspace-main-scroll')?.scrollTop ?? -1,
      );
      assertCondition(forwardScroll === 0, `Browser Forward to settings must stay at scroll=0 (got ${forwardScroll})`);
      await page.goBack();
      await page.waitForURL(`${BASE_URL}/workspace`);

      // Verify Short Desktop Viewport (1440x680 -> simulated 125%+ vertical constraint & independent rail scroll)
      await page.setViewportSize({ width: 1440, height: 680 });
      await page.waitForTimeout(150);
      const shortDesktopDiag = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        const railNav = aside?.querySelector('nav');
        const collapseBtn = aside?.querySelector('button');
        const canScrollNav = railNav ? railNav.scrollHeight > railNav.clientHeight : false;
        if (railNav) railNav.scrollTop = 80;
        return {
          asideHeight: aside ? Math.round(aside.getBoundingClientRect().height) : -1,
          collapseBottom: collapseBtn ? Math.round(collapseBtn.getBoundingClientRect().bottom) : -1,
          canScrollNav,
          railScrollTop: railNav ? railNav.scrollTop : 0,
        };
      });
      assertCondition(shortDesktopDiag.asideHeight === 680, 'Sidebar must match 680px short desktop height');
      assertCondition(
        shortDesktopDiag.collapseBottom <= 680,
        `Collapse control must stay visible on 680px short height (bottom=${shortDesktopDiag.collapseBottom})`,
      );
      assertCondition(
        !shortDesktopDiag.canScrollNav || shortDesktopDiag.railScrollTop > 0,
        'Sidebar nav must scroll independently when viewport height is tight',
      );
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_short_desktop_680.png'),
        fullPage: false,
      });

      // Reset rail nav scroll & restore 1440x900 for remaining checks
      await page.evaluate(() => {
        const nav = document.querySelector('aside nav');
        if (nav) nav.scrollTop = 0;
      });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(150);

      // Open Global Search via keyboard Ctrl+K, verify project ?project= highlight + Back/Forward + planned route
      await page.keyboard.press('Control+k');
      const searchDialog = page.getByRole('dialog');
      await searchDialog.waitFor({ state: 'visible' });
      const searchInput = page.getByRole('combobox');
      await searchInput.fill('OA-26-108');
      await page.waitForTimeout(150);
      await page.keyboard.press('Enter');
      await page.waitForURL(/\/workspace\?project=sd-proj-oa-26-108/);
      await page.getByText(/PROJECTO EM DESTAQUE · PESQUISA \/ URL/i).waitFor({ state: 'visible' });

      await page.keyboard.press('Control+k');
      await searchDialog.waitFor({ state: 'visible' });
      await searchInput.fill('Projectos');
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_search_1440.png'),
        fullPage: false,
      });
      await page.keyboard.press('Enter');
      await page.waitForURL(`${BASE_URL}/workspace/projects`);
      await checkNoHorizontalOverflow(page, 'Workspace Projects Planned View 1440px');
      await page.goBack();
      await page.waitForURL(/\/workspace\?project=sd-proj-oa-26-108/);
      await page.getByText(/PROJECTO EM DESTAQUE · PESQUISA \/ URL/i).waitFor({ state: 'visible' });
      await page.goForward();
      await page.waitForURL(`${BASE_URL}/workspace/projects`);
      await page.waitForTimeout(200);
      await checkNoHorizontalOverflow(page, 'Workspace Projects Catalog 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_projects_catalog_1440.png'),
        fullPage: false,
      });

      // Toggle Galeria <-> Lista técnica & check PT <-> EN language switching
      await page.getByRole('button', { name: /Lista técnica/i }).click();
      await page.locator('table').waitFor({ state: 'visible' });
      await checkNoHorizontalOverflow(page, 'Workspace Projects Technical List 1440px');
      await page.getByRole('button', { name: /^Galeria$/i }).click();

      await page.getByRole('button', { name: /Mudar idioma para inglês/i }).click();
      await page.getByRole('heading', { name: /Studio Projects/i }).waitFor({ state: 'visible' });
      await page.getByRole('button', { name: /Switch language to Portuguese/i }).click();
      await page.getByRole('heading', { name: /Projectos do Atelier/i }).waitFor({ state: 'visible' });

      // Phase 03 Integrated E2E: Gallery -> 4-Step Wizard -> Confirmation -> Dossier -> Edit/Revision/Doc -> Reload -> Model Phase 04 -> Archive/Restore -> Search/Back/Forward -> 404
      await page.getByRole('button', { name: /Novo projecto/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/projects/new`);
      await page.waitForTimeout(150);
      await checkNoHorizontalOverflow(page, 'Workspace Projects Create 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_projects_create_1440.png'),
        fullPage: false,
      });

      await page.getByLabel(/Nome em Português/i).fill('Pavilhão E2E Maputo');
      await page.getByLabel(/Nome em Inglês/i).fill('Maputo E2E Pavilion');
      await page.getByLabel(/Breve descrição/i).fill('Estudo local persistente para validação integrada da Fase 03.');
      await page.getByLabel(/^Disciplina/i).selectOption('Arquitectura Pública');
      await page.getByRole('button', { name: /Seguinte/i }).click();
      await page.getByRole('button', { name: /Seguinte/i }).click();
      await page.getByLabel(/Marco seguinte/i).fill('Entrega inicial E2E');
      await page.getByRole('button', { name: /Seguinte/i }).click();
      await page.getByRole('button', { name: /Guardar neste navegador/i }).click();

      await page.getByRole('heading', { name: /Novo dossier preparado em modo privado/i }).waitFor({ state: 'visible' });
      await page.getByRole('button', { name: /Abrir dossier do projecto/i }).click();
      await page.waitForURL(/\/workspace\/projects\/proj-/);
      await page.getByRole('heading', { name: 'Pavilhão E2E Maputo' }).waitFor({ state: 'visible' });
      await checkNoHorizontalOverflow(page, 'Workspace Projects Dossier 1440px');

      // Edit metadata inline, add revision in History, add file reference in Documentation
      await page.getByRole('button', { name: /Editar ficha técnica/i }).click();
      const phaseInput = page.getByLabel(/Fase actual/i);
      await phaseInput.fill('Projecto de Execução');
      await page.getByRole('button', { name: /Guardar alterações/i }).click();
      await page.getByText(/Alterações guardadas neste navegador/i).waitFor({ state: 'visible' });

      await page.getByRole('tab', { name: /Histórico/i }).click();
      await page.getByRole('button', { name: /Registar revisão/i }).click();
      await page.getByLabel(/Resumo técnico da revisão/i).fill('Revisão E2E persistente v02.');
      await page.getByRole('button', { name: /Guardar revisão neste navegador/i }).click();
      await page.getByText('Revisão E2E persistente v02.').waitFor({ state: 'visible' });

      await page.getByRole('tab', { name: /Documentação/i }).click();
      await page.locator('[role="tabpanel"]').getByRole('button', { name: /Adicionar informação/i }).click();
      await page.getByLabel(/Nome do ficheiro/i).fill('e2e-planta-terreo.pdf');
      await page.getByLabel(/Relação com o projecto/i).fill('Prancha geral de validação E2E.');
      await page.getByRole('button', { name: /Guardar referência neste navegador/i }).click();
      await page.getByText('e2e-planta-terreo.pdf').waitFor({ state: 'visible' });

      // Reload persistence verification across Metadata, Revision, and Document Reference
      await page.reload({ waitUntil: 'load' });
      await page.getByRole('heading', { name: 'Pavilhão E2E Maputo' }).waitFor({ state: 'visible' });
      await page.getByText(/Privado por omissão/i).first().waitFor({ state: 'visible' });
      await page.getByRole('tab', { name: /Desenvolvimento/i }).click();
      await page.getByText(/Projecto de Execução/i).first().waitFor({ state: 'visible' });
      await page.getByRole('tab', { name: /Histórico/i }).click();
      await page.getByText('Revisão E2E persistente v02.').waitFor({ state: 'visible' });
      await page.getByRole('tab', { name: /Documentação/i }).click();
      await page.getByText('e2e-planta-terreo.pdf').waitFor({ state: 'visible' });
      await page.getByRole('tab', { name: /Identidade/i }).click();
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_projects_dossier_1440.png'),
        fullPage: false,
      });

      // Visit Phase 04A 3D Model Engine route & return
      const createdUrl = page.url();
      await page.getByRole('button', { name: /Abrir vista 3D \(Fase 04\)/i }).click();
      await page.waitForURL(`${createdUrl}/model`);
      await page.getByText(/FASE 04 · MOTOR DE MODELOS 3D & CONTRATO DE FICHEIROS/i).waitFor({ state: 'visible' });
      await checkNoHorizontalOverflow(page, 'Workspace Projects Model Engine 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_projects_model_engine_1440.png'),
        fullPage: false,
      });
      await page.getByRole('link', { name: /Voltar ao Dossier/i }).click();
      await page.waitForURL(createdUrl);
      await page.getByRole('heading', { name: 'Pavilhão E2E Maputo' }).waitFor({ state: 'visible' });

      // Archive locally -> disappears from 'Todos' chip, visible under 'Arquivado' -> reopen & restore
      await page.getByRole('button', { name: /Arquivar projecto/i }).click();
      await page.getByText(/Este projecto está arquivado/i).waitFor({ state: 'visible' });
      await page.getByRole('button', { name: /Voltar aos projectos/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/projects`);
      await page.getByRole('heading', { name: /Projectos do Atelier/i }).waitFor({ state: 'visible' });
      const hiddenActiveCount = await page.getByText('Pavilhão E2E Maputo').count();
      assertCondition(hiddenActiveCount === 0, 'Archived project must be hidden under Todos filter');
      await page.getByRole('button', { name: /^Arquivado$/i }).click();
      await page.getByText('Pavilhão E2E Maputo').first().waitFor({ state: 'visible' });

      // Reopen archived project & restore it back to Em curso
      await page.getByRole('button', { name: /Abrir projecto/i }).first().click();
      await page.waitForURL(createdUrl);
      await page.getByRole('button', { name: /Restaurar para Em curso/i }).click();
      await page.getByRole('button', { name: /Voltar aos projectos/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/projects`);
      await page.getByRole('heading', { name: /Projectos do Atelier/i }).waitFor({ state: 'visible' });
      await page.getByText('Pavilhão E2E Maputo').first().waitFor({ state: 'visible' });

      // Global Search for newly created local project -> routes directly to dossier + Back/Forward
      await page.keyboard.press('Control+k');
      await searchDialog.waitFor({ state: 'visible' });
      await searchInput.fill('Pavilhão E2E Maputo');
      await page.waitForTimeout(150);
      await page.keyboard.press('Enter');
      await page.waitForURL(createdUrl);
      await page.getByRole('heading', { name: 'Pavilhão E2E Maputo' }).waitFor({ state: 'visible' });
      await page.goBack();
      await page.waitForURL(`${BASE_URL}/workspace/projects`);
      await page.goForward();
      await page.waitForURL(createdUrl);
      await page.getByRole('button', { name: /Voltar aos projectos/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/projects`);

      // Verify invalid ID renders honest 404 fallback cleanly
      await page.goto(`${BASE_URL}/workspace/projects/id-invalido-404`, { waitUntil: 'load' });
      await page.getByRole('heading', { name: /Projecto não encontrado no arquivo local/i }).waitFor({ state: 'visible' });
      await page.getByRole('link', { name: /Voltar ao Catálogo/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/projects`);

      // Open Notifications Popover, mark 1 notification read, verify unread count changes & capture
      const bellButton = page.getByRole('button', {
        name: /Notificações demonstrativas do atelier/i,
      });
      await bellButton.click();
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_notifications_1440.png'),
        fullPage: false,
      });
      const markOneButtons = page.getByRole('button', { name: /Marcar como lida/i });
      const initialUnreadButtons = await markOneButtons.count();
      assertCondition(initialUnreadButtons >= 1, 'Expected at least 1 unread demo notification');
      await markOneButtons.first().click();
      await page.keyboard.press('Escape');

      // Navigate via rail to Definições (/workspace/settings) & verify reload persistence
      await page.locator('aside').getByRole('link', { name: /Definições/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/settings`);
      await page.waitForTimeout(200);
      await checkNoHorizontalOverflow(page, 'Workspace Settings 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_settings_1440.png'),
        fullPage: false,
      });

      await page.reload({ waitUntil: 'load' });
      assertCondition(
        page.url().endsWith('/workspace/settings'),
        'Session must persist across reload on /workspace/settings',
      );

      // Audit zero passwords in localStorage
      const storageAudit = await page.evaluate(() => {
        const dump = JSON.stringify(window.localStorage);
        return {
          hasSession: Boolean(window.localStorage.getItem('oa_workspace_demo_session_v1')),
          containsPasswordValue: dump.includes('oa-demo'),
          containsPasswordKey: dump.includes('password') || dump.includes('demoAccessKey'),
        };
      });
      assertCondition(storageAudit.hasSession, 'Demo session should exist');
      assertCondition(!storageAudit.containsPasswordValue, 'localStorage must NEVER contain password value');
      assertCondition(!storageAudit.containsPasswordKey, 'localStorage must NEVER contain password keys');

      // Sign out -> returns to /login and clears session key
      await page.getByRole('button', { name: /Terminar sessão demo/i }).click();
      await page.waitForURL(`${BASE_URL}/login`);
      const sessionCleared = await page.evaluate(
        () => window.localStorage.getItem('oa_workspace_demo_session_v1') === null,
      );
      assertCondition(sessionCleared, 'Demo session key must be removed on sign out');
      await desktopContext.close();

      // 2. TABLET 768x1024 — Login, Welcome & Workspace Shell
      const tabletContext = await browser.newContext({
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
      });
      const tabletPage = await tabletContext.newPage();
      attachRuntimeMonitors(tabletPage, unexpectedRequests, runtimeErrors, 'Tablet-768');

      await tabletPage.goto(`${BASE_URL}/login`, { waitUntil: 'load' });
      await tabletPage.waitForTimeout(250);
      await checkNoHorizontalOverflow(tabletPage, 'Login Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_tablet_768.png'),
        fullPage: true,
      });

      await tabletPage.getByRole('button', { name: /Entrar como Mateo Conti/i }).click();
      await tabletPage.waitForURL(`${BASE_URL}/welcome`);
      await tabletPage.waitForLoadState('load');
      await tabletPage.waitForTimeout(250);
      await checkNoHorizontalOverflow(tabletPage, 'Welcome Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_tablet_768.png'),
        fullPage: true,
      });

      await tabletPage.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await tabletPage.waitForURL(`${BASE_URL}/workspace`);
      await tabletPage.waitForLoadState('load');
      await tabletPage.waitForTimeout(250);
      await checkNoHorizontalOverflow(tabletPage, 'Workspace Shell Tablet 768px');
      await checkHeaderNoClusterOverlap(tabletPage, 'Workspace Shell Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_tablet_768.png'),
        fullPage: false,
      });
      await tabletPage.goto(`${BASE_URL}/workspace/projects`, { waitUntil: 'load' });
      await tabletPage.waitForTimeout(200);
      await checkNoHorizontalOverflow(tabletPage, 'Workspace Projects Catalog Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_projects_catalog_tablet_768.png'),
        fullPage: false,
      });
      await tabletContext.close();

      // 3. MOBILE 375x812 + Reduced Motion — Entry + Shell + Drawer + Popovers
      const mobileContext = await browser.newContext({
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        reducedMotion: 'reduce',
      });
      const mobilePage = await mobileContext.newPage();
      attachRuntimeMonitors(mobilePage, unexpectedRequests, runtimeErrors, 'Mobile-375');

      await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'load' });
      await mobilePage.waitForTimeout(200);
      await checkNoHorizontalOverflow(mobilePage, 'Login Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_mobile_375.png'),
        fullPage: false,
      });

      await mobilePage.getByRole('button', { name: /Entrar no Atelier/i }).click();
      await mobilePage.waitForURL(`${BASE_URL}/welcome`);
      await mobilePage.waitForLoadState('load');
      await mobilePage.waitForTimeout(200);
      await checkNoHorizontalOverflow(mobilePage, 'Welcome Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_mobile_375.png'),
        fullPage: false,
      });

      await mobilePage.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await mobilePage.waitForURL(`${BASE_URL}/workspace`);
      await mobilePage.waitForLoadState('load');
      await mobilePage.waitForTimeout(200);
      await checkNoHorizontalOverflow(mobilePage, 'Workspace Shell Mobile 375px');
      await checkHeaderNoClusterOverlap(mobilePage, 'Workspace Shell Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_mobile_375.png'),
        fullPage: false,
      });

      // Open accessible mobile drawer, capture, escape & check focus return
      await mobilePage.getByRole('button', { name: /Abrir menu de navegação/i }).click();
      await mobilePage.getByRole('dialog').waitFor({ state: 'visible' });
      await checkNoHorizontalOverflow(mobilePage, 'Workspace Mobile Drawer 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_mobile_drawer_375.png'),
        fullPage: false,
      });
      await mobilePage.keyboard.press('Escape');
      await mobilePage.getByRole('dialog').waitFor({ state: 'hidden' });

      const drawerFocusRestored = await mobilePage.evaluate(() =>
        /Abrir menu de navegação/i.test(
          document.activeElement?.getAttribute('aria-label') || '',
        ),
      );
      assertCondition(
        drawerFocusRestored,
        'Focus must return to mobile menu trigger when drawer closes via Escape',
      );

      // Verify notifications panel at 375px causes zero overflow
      await mobilePage
        .getByRole('button', { name: /Notificações demonstrativas do atelier/i })
        .click();
      await checkNoHorizontalOverflow(mobilePage, 'Notifications Mobile 375px');
      await mobilePage.keyboard.press('Escape');

      // Also verify 200%-zoom desktop CSS equivalent (720px viewport width): document scroll unobstructed & zero overflow
      await mobilePage.setViewportSize({ width: 720, height: 450 });
      await mobilePage.waitForTimeout(150);
      await checkNoHorizontalOverflow(mobilePage, 'Workspace 200% Zoom Reflow 720px');
      await mobilePage.evaluate(() => window.scrollTo(0, 420));
      await mobilePage.waitForTimeout(150);
      const zoomDiag = await mobilePage.evaluate(() => {
        const header = document.querySelector('header');
        return {
          scrollY: window.scrollY,
          headerTop: header ? Math.round(header.getBoundingClientRect().top) : -1,
        };
      });
      assertCondition(zoomDiag.scrollY >= 350, 'Reflow 200% zoom width (720px) must allow unrestricted document scrolling');
      assertCondition(zoomDiag.headerTop === 0, 'Sticky header must stay accessible when scrolling at 720px zoom reflow');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_zoom_200_720.png'),
        fullPage: false,
      });

      await mobilePage.setViewportSize({ width: 375, height: 812 });
      await mobilePage.goto(`${BASE_URL}/workspace/projects`, { waitUntil: 'load' });
      await mobilePage.waitForTimeout(200);
      await checkNoHorizontalOverflow(mobilePage, 'Workspace Projects Catalog Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_projects_catalog_mobile_375.png'),
        fullPage: false,
      });
      await mobileContext.close();

      assertCondition(
        unexpectedRequests.length === 0,
        `Unexpected external requests detected: ${unexpectedRequests.join(', ')}`,
      );
      assertCondition(
        runtimeErrors.length === 0,
        `Browser runtime errors detected:\n${runtimeErrors.join('\n')}`,
      );

      console.log(
        `E2E Verification PASSED cleanly -> screenshots written to ${ARTIFACT_DIR}`,
      );
    } finally {
      await browser.close();
    }
  } finally {
    serverProc.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
