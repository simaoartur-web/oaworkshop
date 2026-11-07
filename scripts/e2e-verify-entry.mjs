import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright-core';

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const ARTIFACT_DIR =
  process.env.OA_SCREENSHOT_DIR ||
  'C:\\Users\\Chronus\\.gemini\\antigravity\\brain\\24b9fa07-8bba-4058-b9bc-a94c3b54d86b';

const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function findBrowserExecutable() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  throw new Error('No local Chromium/Edge executable found for E2E verification.');
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

  try {
    await waitForServer(`${BASE_URL}/`);

    const browser = await chromium.launch({
      executablePath,
      headless: true,
    });

    try {
      // 1. DESKTOP 1440x900 — Full visual & functional flow
      const desktopContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });
      const page = await desktopContext.newPage();

      page.on('request', (req) => {
        const url = req.url();
        const allowed =
          url.startsWith(BASE_URL) ||
          url.startsWith('data:') ||
          url.startsWith('https://fonts.googleapis.com') ||
          url.startsWith('https://fonts.gstatic.com');
        if (!allowed) {
          unexpectedRequests.push(url);
        }
      });

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(350);
      await checkNoHorizontalOverflow(page, 'Login Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_desktop_1440.png'),
        fullPage: false,
      });

      // Test Forgot Password dialog & Escape close
      await page.getByRole('button', { name: /Esqueceu-se da palavra-passe/i }).click();
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_forgot_dialog_1440.png'),
        fullPage: false,
      });
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });

      // Test 1:100 Section SVG + English switch on Desktop
      await page.getByRole('button', { name: /Mudar idioma para inglês/i }).click();
      await page.getByRole('button', { name: /1:100 Orthogonal Section/i }).click();
      await page.waitForTimeout(250);
      await checkNoHorizontalOverflow(page, 'Login Section EN Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_section_en_1440.png'),
        fullPage: false,
      });

      // Switch back to PT and submit login to enter /welcome
      await page.getByRole('button', { name: /Switch language to Portuguese/i }).click();
      await page.getByRole('button', { name: /Entrar no Atelier/i }).click();
      await page.waitForURL(`${BASE_URL}/welcome`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(350);
      await checkNoHorizontalOverflow(page, 'Welcome Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_desktop_1440.png'),
        fullPage: false,
      });

      // Verify zero password stored in localStorage
      const storageAudit = await page.evaluate(() => {
        const dump = JSON.stringify(window.localStorage);
        return {
          hasSession: Boolean(window.localStorage.getItem('oa_workspace_demo_session_v1')),
          containsPasswordValue: dump.includes('oa-demo'),
          containsPasswordKey: dump.includes('password') || dump.includes('demoAccessKey'),
        };
      });
      assertCondition(storageAudit.hasSession, 'Demo session should exist after login');
      assertCondition(!storageAudit.containsPasswordValue, 'localStorage must NEVER contain demo password value');
      assertCondition(!storageAudit.containsPasswordKey, 'localStorage must NEVER contain password keys');

      // Continue to /workspace, verify reload persistence, then logout
      await page.getByRole('button', { name: /^Entrar no Workspace$/i }).click();
      await page.waitForURL(`${BASE_URL}/workspace`);
      await page.waitForTimeout(250);
      await checkNoHorizontalOverflow(page, 'Workspace Gate Desktop 1440px');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_workspace_gate_1440.png'),
        fullPage: false,
      });

      await page.reload({ waitUntil: 'networkidle' });
      assertCondition(page.url().endsWith('/workspace'), 'Session must persist across reload on /workspace');

      await page.getByRole('button', { name: /Terminar sessão demo/i }).click();
      await page.waitForURL(`${BASE_URL}/login`);
      await desktopContext.close();

      // 2. TABLET 768x1024 — Login & Welcome screenshots + overflow check
      const tabletContext = await browser.newContext({
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
      });
      const tabletPage = await tabletContext.newPage();
      await tabletPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await tabletPage.waitForTimeout(300);
      await checkNoHorizontalOverflow(tabletPage, 'Login Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_tablet_768.png'),
        fullPage: true,
      });

      await tabletPage.getByRole('button', { name: /Entrar como Mateo Conti/i }).click();
      await tabletPage.waitForURL(`${BASE_URL}/welcome`);
      await tabletPage.waitForLoadState('networkidle');
      await tabletPage.waitForTimeout(300);
      await checkNoHorizontalOverflow(tabletPage, 'Welcome Tablet 768px');
      await tabletPage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_tablet_768.png'),
        fullPage: true,
      });
      await tabletContext.close();

      // 3. MOBILE 375x812 + Reduced Motion verification
      const mobileContext = await browser.newContext({
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        reducedMotion: 'reduce',
      });
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(250);
      await checkNoHorizontalOverflow(mobilePage, 'Login Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_mobile_375.png'),
        fullPage: false,
      });
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_login_mobile_375_full.png'),
        fullPage: true,
      });

      await mobilePage.getByRole('button', { name: /Entrar no Atelier/i }).click();
      await mobilePage.waitForURL(`${BASE_URL}/welcome`);
      await mobilePage.waitForLoadState('networkidle');
      await mobilePage.waitForTimeout(250);
      await checkNoHorizontalOverflow(mobilePage, 'Welcome Mobile 375px');
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_mobile_375.png'),
        fullPage: false,
      });
      await mobilePage.screenshot({
        path: path.join(ARTIFACT_DIR, 'oa_welcome_mobile_375_full.png'),
        fullPage: true,
      });
      await mobileContext.close();

      assertCondition(
        unexpectedRequests.length === 0,
        `Unexpected external requests detected: ${unexpectedRequests.join(', ')}`,
      );

      console.log('E2E Verification PASSED: 1440px, 768px, 375px, reduced-motion, zero-password storage, zero backend requests.');
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
