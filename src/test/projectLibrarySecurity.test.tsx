import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import {
  addProjectFileReference,
  addProjectRevision,
  clearProjectLibraryLocalState,
  createProject,
  getProjectById,
  PROJECT_LIBRARY_LIMITS,
  PROJECT_LIBRARY_STORAGE_KEY,
  updateProjectMetadata,
} from '../data/projectLibraryRepository';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';

function seedArchitectSession(userIndex = 1) {
  const user = DEMO_USERS[userIndex];
  persistDemoSessionForUser(user);
  return user;
}

describe('Phase 04 Hardening · Agent A Project Library Integrity & Quotas (P1.6–P1.8)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('P1.6: rejects path traversal, URL schemes, control chars, unsafe extensions, and kind mismatches for documentary filenames', () => {
    const actor = DEMO_USERS[1];
    const targetId = 'sd-proj-oa-26-101';

    const invalidFilenames: Array<{
      fileName: string;
      kind: 'drawing' | 'model_3d' | 'source_skp' | 'specification' | 'photographic_log';
    }> = [
      { fileName: '../segredo/planta.pdf', kind: 'drawing' },
      { fileName: 'C:\\temp\\Corte-AA.pdf', kind: 'drawing' },
      { fileName: 'pasta/Corte-AA.pdf', kind: 'drawing' },
      { fileName: '.hidden.pdf', kind: 'drawing' },
      { fileName: 'javascript:alert(1).pdf', kind: 'drawing' },
      { fileName: 'https://evil.example/corte.pdf', kind: 'drawing' },
      { fileName: 'file:///etc/passwd.pdf', kind: 'drawing' },
      { fileName: 'corte\u0000.pdf', kind: 'drawing' },
      { fileName: 'sem-extensao', kind: 'drawing' },
      { fileName: 'payload.html', kind: 'specification' },
      { fileName: 'vector.svg', kind: 'photographic_log' },
      { fileName: 'script.js', kind: 'specification' },
      { fileName: 'runner.exe', kind: 'drawing' },
      // Kind <-> extension mismatches
      { fileName: 'planta.pdf', kind: 'model_3d' },
      { fileName: 'maquete.glb', kind: 'drawing' },
      { fileName: 'maquete.skp', kind: 'model_3d' },
      { fileName: 'foto.webp', kind: 'specification' },
      { fileName: 'orcamento.xlsx', kind: 'drawing' },
    ];

    for (const item of invalidFilenames) {
      expect(() =>
        addProjectFileReference(
          targetId,
          {
            fileName: item.fileName,
            kind: item.kind,
            versionLabel: 'v02',
          },
          actor,
        ),
      ).toThrow();
    }

    // Also validates initialFileName during createProject
    expect(() =>
      createProject(
        {
          titlePt: 'Projecto Teste Ficheiro',
          subtitlePt: 'Teste de validação na criação',
          departmentId: 'architecture',
          disciplinePt: 'Arquitectura',
          studioBase: 'Maputo',
          projectStatus: 'concept',
          phasePt: 'Estudo Prévio',
          nextMilestoneTitlePt: 'Entrega preliminar',
          nextMilestoneDateIso: '2026-12-01',
          leadUserId: actor.id,
          initialFileName: '../../evil.html',
          initialFileKind: 'drawing',
        },
        actor,
      ),
    ).toThrow();

    // Valid extension/kind combinations succeed
    const addedDrawing = addProjectFileReference(
      targetId,
      { fileName: 'Corte-AA_v03.pdf', kind: 'drawing', versionLabel: 'v03' },
      actor,
    );
    expect(addedDrawing?.files[0].fileName).toBe('Corte-AA_v03.pdf');

    const addedModel = addProjectFileReference(
      targetId,
      { fileName: 'Estudo-Volumetrico.glb', kind: 'model_3d', versionLabel: 'v04' },
      actor,
    );
    expect(addedModel?.files[0].fileName).toBe('Estudo-Volumetrico.glb');
  });

  it('P1.7: enforces field length limits and collection count caps in repository', () => {
    const actor = DEMO_USERS[1];
    const targetId = 'sd-proj-oa-26-101';

    // Character bounds
    expect(() =>
      createProject(
        {
          titlePt: 'T'.repeat(PROJECT_LIBRARY_LIMITS.MAX_TITLE_LENGTH + 1),
          subtitlePt: 'Resumo válido',
          departmentId: 'architecture',
          disciplinePt: 'Arquitectura',
          studioBase: 'Maputo',
          projectStatus: 'concept',
          phasePt: 'Estudo Prévio',
          nextMilestoneTitlePt: 'Marco válido',
          nextMilestoneDateIso: '2026-12-01',
          leadUserId: actor.id,
        },
        actor,
      ),
    ).toThrow();

    expect(() =>
      updateProjectMetadata(
        targetId,
        {
          dossierNotes: {
            pt: 'N'.repeat(PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH + 1),
            en: 'Valid note',
          },
        },
        actor,
      ),
    ).toThrow();

    expect(() =>
      addProjectRevision(
        targetId,
        {
          versionLabel: 'rev.99',
          summaryPt: 'R'.repeat(PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH + 1),
        },
        actor,
      ),
    ).toThrow();

    expect(() =>
      addProjectFileReference(
        targetId,
        {
          fileName: `${'F'.repeat(PROJECT_LIBRARY_LIMITS.MAX_FILENAME_LENGTH)}.pdf`,
          kind: 'drawing',
          versionLabel: 'v01',
        },
        actor,
      ),
    ).toThrow();

    // Cap: MAX_LOCAL_PROJECTS (50)
    const seededEnvelope = {
      version: 1,
      overridesById: {},
      createdRecords: Array.from(
        { length: PROJECT_LIBRARY_LIMITS.MAX_LOCAL_PROJECTS },
        (_, idx) => ({
          ...getProjectById(targetId)!,
          identity: {
            id: `proj-cap-${idx}`,
            code: `OA-CAP-${idx}`,
            slug: `oa-cap-${idx}`,
          },
          metadata: {
            ...getProjectById(targetId)!.metadata,
            origin: 'local-created',
          },
        }),
      ),
    };
    window.localStorage.setItem(
      PROJECT_LIBRARY_STORAGE_KEY,
      JSON.stringify(seededEnvelope),
    );

    expect(() =>
      createProject(
        {
          titlePt: 'Projecto 51',
          subtitlePt: 'Excede limite',
          departmentId: 'architecture',
          disciplinePt: 'Arquitectura',
          studioBase: 'Maputo',
          projectStatus: 'concept',
          phasePt: 'Estudo Prévio',
          nextMilestoneTitlePt: 'Marco',
          nextMilestoneDateIso: '2026-12-01',
          leadUserId: actor.id,
        },
        actor,
      ),
    ).toThrow(/50/);

    // Cap: MAX_FILES_PER_PROJECT & MAX_REVISIONS_PER_PROJECT
    clearProjectLibraryLocalState();
    const baseRecord = getProjectById(targetId)!;
    const filledOverride = {
      ...baseRecord,
      files: Array.from(
        { length: PROJECT_LIBRARY_LIMITS.MAX_FILES_PER_PROJECT },
        (_, idx) => ({
          ...baseRecord.files[0],
          id: `f-cap-${idx}`,
        }),
      ),
      revisions: Array.from(
        { length: PROJECT_LIBRARY_LIMITS.MAX_REVISIONS_PER_PROJECT },
        (_, idx) => ({
          ...baseRecord.revisions[0],
          id: `r-cap-${idx}`,
        }),
      ),
    };
    window.localStorage.setItem(
      PROJECT_LIBRARY_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        overridesById: { [targetId]: filledOverride },
        createdRecords: [],
      }),
    );

    expect(() =>
      addProjectFileReference(
        targetId,
        { fileName: 'extra.pdf', kind: 'drawing', versionLabel: 'v99' },
        actor,
      ),
    ).toThrow(/100/);

    expect(() =>
      addProjectRevision(
        targetId,
        { versionLabel: 'rev.101', summaryPt: 'Revisão extra' },
        actor,
      ),
    ).toThrow(/100/);
  });

  it('P1.8: preserves QuotaExceededError and renders error alerts honestly in Dossier UI forms', async () => {
    const actor = DEMO_USERS[1];

    // Repository preserves error.name === 'QuotaExceededError'
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    let caught: unknown = null;
    try {
      addProjectRevision(
        'sd-proj-oa-26-101',
        { versionLabel: 'rev.99', summaryPt: 'Teste quota exceeded' },
        actor,
      );
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).name).toBe('QuotaExceededError');
    setItemSpy.mockRestore();

    // Full UI Dossier test: invalid filename blocked, maxLength set, QuotaExceededError shown in alert banner
    seedArchitectSession(1);
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={['/workspace/projects/sd-proj-oa-26-101']}
      >
        <WorkspaceSessionProvider>
          <AppRoutes />
        </WorkspaceSessionProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('tab', { name: /4\. Documentação/i }));
    await user.click(
      screen.getAllByRole('button', { name: /Adicionar informação/i })[1],
    );

    const fileInput = screen.getByLabelText(/Nome do ficheiro/i);
    const relationInput = screen.getByLabelText(/Relação com o projecto/i);

    expect(fileInput).toHaveAttribute(
      'maxLength',
      String(PROJECT_LIBRARY_LIMITS.MAX_FILENAME_LENGTH),
    );
    expect(relationInput).toHaveAttribute(
      'maxLength',
      String(PROJECT_LIBRARY_LIMITS.MAX_TEXT_LENGTH),
    );

    // Invalid filename with mismatched extension against default .pdf
    await user.type(fileInput, 'maquete.html');
    await user.type(relationInput, 'Teste bloqueio HTML');
    await user.click(
      screen.getByRole('button', { name: /Guardar referência neste navegador/i }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/não é permitida|invalid/i);

    // Clear and provide valid filename, then trigger QuotaExceededError on storage write
    await user.clear(fileInput);
    await user.type(fileInput, 'Corte-Quota_v09.pdf');

    const uiQuotaSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    await user.click(
      screen.getByRole('button', { name: /Guardar referência neste navegador/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/QuotaExceededError/i);
    });
    expect(
      screen.queryByText(/Referência documental adicionada apenas/i),
    ).not.toBeInTheDocument();
    uiQuotaSpy.mockRestore();
  });
});
