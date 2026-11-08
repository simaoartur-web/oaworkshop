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

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
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
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await checkNoHorizontalOverflow(page, 'Welcome Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_desktop_1440.png'),
        fullPage: false,
      });

      // Enter /workspace (WorkspaceShell + Argon A Studio Desk placeholder)
      await page.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await checkNoHorizontalOverflow(page, 'Workspace Shell Expanded 1440px');
      await checkHeaderNoClusterOverlap(page, 'Workspace Shell Expanded 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_desktop_expanded_1440.png'),
        fullPage: false,
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
      // Re-expand rail before subsequent captures
      await page.getByRole('button', { name: /Expandir prancha/i }).click();
      await page.waitForTimeout(200);

      // Open Global Search via keyboard Ctrl+K, verify keyboard navigation & capture
      await page.keyboard.press('Control+k');
      const searchDialog = page.getByRole('dialog');
      await searchDialog.waitFor({ state: 'visible' });
      const searchInput = page.getByRole('combobox');
      await searchInput.fill('Projectos');
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_search_1440.png'),
        fullPage: false,
      });
      await page.keyboard.press('Enter');
      await page.waitForURL(`${BASE_URL}/workspace/projects`);
      await checkNoHorizontalOverflow(page, 'Workspace Projects Planned View 1440px');

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
      await page.getByRole('link', { name: /Definições/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace/settings`);
      await page.waitForTimeout(200);
      await checkNoHorizontalOverflow(page, 'Workspace Settings 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_settings_1440.png'),
        fullPage: false,
      });

      await page.reload({ waitUntil: 'networkidle' });
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

      await tabletPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await tabletPage.waitForTimeout(250);
      await checkNoHorizontalOverflow(tabletPage, 'Login Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_tablet_768.png'),
        fullPage: true,
      });

      await tabletPage.getByRole('button', { name: /Entrar como Mateo Conti/i }).click();
      await tabletPage.waitForURL(`${BASE_URL}/welcome`);
      await tabletPage.waitForLoadState('networkidle');
      await tabletPage.waitForTimeout(250);
      await checkNoHorizontalOverflow(tabletPage, 'Welcome Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_tablet_768.png'),
        fullPage: true,
      });

      await tabletPage.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await tabletPage.waitForURL(`${BASE_URL}/workspace`);
      await tabletPage.waitForLoadState('networkidle');
      await tabletPage.waitForTimeout(250);
      await checkNoHorizontalOverflow(tabletPage, 'Workspace Shell Tablet 768px');
      await checkHeaderNoClusterOverlap(tabletPage, 'Workspace Shell Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_shell_tablet_768.png'),
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

      await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(200);
      await checkNoHorizontalOverflow(mobilePage, 'Login Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_mobile_375.png'),
        fullPage: false,
      });

      await mobilePage.getByRole('button', { name: /Entrar no Atelier/i }).click();
      await mobilePage.waitForURL(`${BASE_URL}/welcome`);
      await mobilePage.waitForLoadState('networkidle');
      await mobilePage.waitForTimeout(200);
      await checkNoHorizontalOverflow(mobilePage, 'Welcome Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_mobile_375.png'),
        fullPage: false,
      });

      await mobilePage.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await mobilePage.waitForURL(`${BASE_URL}/workspace`);
      await mobilePage.waitForLoadState('networkidle');
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
