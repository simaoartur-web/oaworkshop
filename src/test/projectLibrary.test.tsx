import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/App';
import { WorkspaceSessionProvider } from '../app/WorkspaceSessionContext';
import { DEMO_USERS } from '../data/fixtures';
import { canonicalToStudioDeskProject } from '../data/projectLibraryAdapter';
import {
  PROJECT_LIBRARY_STORAGE_KEY,
  addProjectFileReference,
  addProjectRevision,
  archiveProject,
  createProject,
  getProjectById,
  listProjects,
  restoreProjectFromArchive,
  updateProjectMetadata,
} from '../data/projectLibraryRepository';
import { resetDemoWorkspaceState, STORAGE_KEYS } from '../data/sessionRepository';
import { STUDIO_DESK_PROJECTS } from '../data/studioDeskFixtures';
import { searchWorkspaceDemo } from '../features/workspace-shell/globalSearchIndex';

function seedArchitectSession(userIndex = 1) {
  const user = DEMO_USERS[userIndex];
  window.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      authenticatedAt: '2026-11-12T10:00:00.000Z',
      mode: 'local-demo',
    }),
  );
  return user;
}

function renderWorkspaceApp(initialPath = '/workspace/projects') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WorkspaceSessionProvider>
        <AppRoutes />
      </WorkspaceSessionProvider>
    </MemoryRouter>,
  );
}

describe('Phase 03A · Canonical Project Library Domain & Engine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
  });

  it('hydrates cleanly from STUDIO_DESK_PROJECTS without mutating source fixtures and adapts bidirectionally', () => {
    const initialSnapshot = JSON.stringify(STUDIO_DESK_PROJECTS);
    const records = listProjects({ includeArchived: true });

    expect(records).toHaveLength(STUDIO_DESK_PROJECTS.length);
    for (const seed of STUDIO_DESK_PROJECTS) {
      const canonical = getProjectById(seed.id);
      expect(canonical).not.toBeNull();
      expect(canonical?.identity.code).toBe(seed.code);
      expect(canonical?.metadata.origin).toBe('seed-fixture');
      expect(canonical?.publication.publicationStatus).toBe(seed.publicationStatus);
      expect(canonical?.files.length).toBeGreaterThanOrEqual(1);
      expect(canonical?.revisions.length).toBeGreaterThanOrEqual(1);

      const roundTripped = canonicalToStudioDeskProject(canonical!);
      expect(roundTripped.id).toBe(seed.id);
      expect(roundTripped.code).toBe(seed.code);
      expect(roundTripped.publicationStatus).toBe(seed.publicationStatus);
      expect(roundTripped.deliverables.length).toBe(seed.deliverables.length);
    }

    expect(JSON.stringify(STUDIO_DESK_PROJECTS)).toBe(initialSnapshot);
  });

  it('creates new local projects strictly as private and recovers gracefully from corrupted localStorage', () => {
    const actor = DEMO_USERS[1]; // Sofia Mbanza
    const created = createProject(
      {
        titlePt: 'Pavilhão Fluvial da Catembe',
        subtitlePt: 'Equipamento cívico de madeira laminada na frente de mar.',
        departmentId: 'architecture',
        disciplinePt: 'Arquitectura Pública',
        studioBase: 'Maputo',
        phasePt: 'Estudo Prévio',
        projectStatus: 'completed',
        leadUserId: actor.id,
        nextMilestoneTitlePt: 'Entrega de maquete estrutural',
        nextMilestoneDateIso: '2026-07-02',
        initialFileName: 'catembe-estudo-v01.skp',
        initialFileKind: 'source_skp',
      },
      actor,
    );

    // Even when created as 'completed', publicationStatus MUST remain 'private'
    expect(created.lifecycle.projectStatus).toBe('completed');
    expect(created.publication.publicationStatus).toBe('private');
    expect(created.metadata.origin).toBe('local-created');
    expect(created.files.some((f) => f.fileName === 'catembe-estudo-v01.skp')).toBe(
      true,
    );

    // Inject corrupted JSON & verify safe recovery to seed defaults
    window.localStorage.setItem(PROJECT_LIBRARY_STORAGE_KEY, '{corrupted_json');
    const recovered = listProjects({ includeArchived: true });
    expect(recovered).toHaveLength(STUDIO_DESK_PROJECTS.length);

    // Inject valid JSON with malformed created item -> ignored cleanly without crashing
    window.localStorage.setItem(
      PROJECT_LIBRARY_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        overridesById: {},
        createdRecords: [{ broken: true }],
      }),
    );
    const cleaned = listProjects({ includeArchived: true });
    expect(cleaned).toHaveLength(STUDIO_DESK_PROJECTS.length);
  });

  it('supports metadata update, archive/restore independence from publicationStatus, revisions, and fictive files', () => {
    const actor = DEMO_USERS[0];
    const target = getProjectById('sd-proj-oa-26-101')!;
    const initialPubStatus = target.publication.publicationStatus;

    const updated = updateProjectMetadata(
      target.identity.id,
      {
        phase: { pt: 'Anteprojecto', en: 'Design Development' },
        studioBase: 'Milão',
      },
      actor,
    );
    expect(updated?.lifecycle.phase.pt).toBe('Anteprojecto');
    expect(updated?.location.studioBase).toBe('Milão');
    expect(updated?.publication.publicationStatus).toBe(initialPubStatus);

    const archived = archiveProject(target.identity.id, actor);
    expect(archived?.metadata.isArchived).toBe(true);
    expect(archived?.lifecycle.projectStatus).toBe('archived');
    expect(archived?.publication.publicationStatus).toBe(initialPubStatus);

    // Excluded when includeArchived is false
    expect(
      listProjects({ includeArchived: false }).some(
        (p) => p.identity.id === target.identity.id,
      ),
    ).toBe(false);

    const restored = restoreProjectFromArchive(
      target.identity.id,
      'review',
      actor,
    );
    expect(restored?.metadata.isArchived).toBe(false);
    expect(restored?.lifecycle.projectStatus).toBe('review');
    expect(restored?.publication.publicationStatus).toBe(initialPubStatus);

    const withRevision = addProjectRevision(
      target.identity.id,
      {
        versionLabel: 'v04 · Alçado Nascente',
        summaryPt: 'Ajuste de brises metálicos para redução térmica.',
        reviewState: 'approved_internal',
      },
      actor,
    );
    expect(withRevision?.revisions[0].versionLabel).toBe(
      'v04 · Alçado Nascente',
    );
    expect(withRevision?.review.reviewState).toBe('approved_internal');

    const withFile = addProjectFileReference(
      target.identity.id,
      {
        fileName: 'marina-brise-v04.glb',
        kind: 'model_3d',
        versionLabel: 'v04',
        notePt: 'Metadado preparatório para Fase 04.',
      },
      actor,
    );
    expect(withFile?.files[0].fileName).toBe('marina-brise-v04.glb');
    expect(withFile?.files[0].formatLabel).toBe('GLB · Fase 04');
  });

  it('indexes canonical local projects into globalSearchDemo while keeping ?project= for seed records', () => {
    const actor = DEMO_USERS[1];
    const created = createProject(
      {
        titlePt: 'Galeria Norte Navigli',
        subtitlePt: 'Reabilitação de pátio industrial.',
        departmentId: 'interiors',
        disciplinePt: 'Interiores',
        studioBase: 'Milão',
        phasePt: 'Conceito',
        projectStatus: 'concept',
        leadUserId: actor.id,
        nextMilestoneTitlePt: 'Aprovação de moodboard',
        nextMilestoneDateIso: '2026-08-01',
      },
      actor,
    );

    const seedResults = searchWorkspaceDemo('OA-26-108', 'pt');
    expect(seedResults[0].targetPath).toBe('/workspace?project=sd-proj-oa-26-108');

    const localResults = searchWorkspaceDemo('Galeria Norte Navigli', 'pt');
    expect(localResults).toHaveLength(1);
    expect(localResults[0].targetPath).toBe(
      `/workspace/projects/${created.identity.id}`,
    );
  });

  it('renders /workspace/projects catalog with filters, search, empty state, and creates/persists/edits/archives a project in UI', async () => {
    const user = userEvent.setup();
    seedArchitectSession(1); // Sofia Mbanza
    renderWorkspaceApp('/workspace/projects');

    expect(
      await screen.findByRole('heading', {
        name: /Catálogo técnico de projectos/i,
      }),
    ).toBeInTheDocument();

    // All 5 seed projects appear initially
    expect(screen.getAllByText('OA-26-101').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('OA-25-084').length).toBeGreaterThanOrEqual(1);

    // Filter to non-matching search query -> honest empty state + reset filters works
    const searchInput = screen.getByRole('searchbox', {
      name: /Pesquisar por código ou título/i,
    });
    await user.type(searchInput, 'INEXISTENTE-XYZ');
    expect(
      await screen.findByText(/Nenhum projecto corresponde aos filtros/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', { name: /Repor filtros/i })[0],
    );
    expect(screen.getAllByText('OA-26-101').length).toBeGreaterThanOrEqual(1);

    // Toggle "Associados ao meu papel"
    await user.click(
      screen.getByRole('button', { name: /Associados ao meu papel/i }),
    );
    expect(screen.getAllByText('OA-26-101').length).toBeGreaterThanOrEqual(1);

    // Navigate to /workspace/projects/new and create a new local project
    await user.click(screen.getByRole('link', { name: /Novo Projecto/i }));
    expect(
      await screen.findByRole('heading', {
        name: /Registar novo projecto demonstrativo/i,
      }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Título do projecto \(PT\)/i),
      'Torre Botânica de Maputo',
    );
    await user.type(
      screen.getByLabelText(/Resumo técnico \(PT\)/i),
      'Torre mista com varandas vegetadas e fachada ventilada.',
    );
    await user.type(
      screen.getByLabelText(/Próximo marco previsto/i),
      'Entrega do programa térmico',
    );
    await user.click(
      screen.getByRole('button', { name: /Criar projecto na Biblioteca/i }),
    );

    // Redirects to the created project's dossier with privacy badge intact
    expect(
      await screen.findByRole('heading', { name: 'Torre Botânica de Maputo' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Privado por omissão/i).length).toBeGreaterThanOrEqual(
      1,
    );

    // Edit metadata inline & save
    await user.click(screen.getByRole('button', { name: /Editar metadados/i }));
    const phaseInput = screen.getByLabelText(/Fase \(PT\)/i);
    await user.clear(phaseInput);
    await user.type(phaseInput, 'Projecto de Execução');
    await user.click(
      screen.getByRole('button', { name: /Guardar alterações locais/i }),
    );
    expect(
      await screen.findByText(/Metadados guardados localmente neste navegador/i),
    ).toBeInTheDocument();

    // Add technical revision & fictive file metadata
    await user.type(
      screen.getByLabelText(/Síntese da revisão técnica/i),
      'Compatibilização estrutural de lajes em consola.',
    );
    await user.click(
      screen.getByRole('button', { name: /Registar revisão/i }),
    );
    expect(
      await screen.findByText(/Compatibilização estrutural de lajes em consola/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Nome do ficheiro fictício/i),
      'botanica-modelo-v02.skp',
    );
    await user.click(
      screen.getByRole('button', { name: /Adicionar referência/i }),
    );
    expect(
      await screen.findByText('botanica-modelo-v02.skp'),
    ).toBeInTheDocument();

    // Navigate to Phase 04 future model route -> honest placeholder
    await user.click(
      screen.getByRole('link', { name: /Modelo 3D · Em breve \(Fase 04\)/i }),
    );
    expect(
      await screen.findByText(
        /Visualizador Web 3D \(\.glb \/ \.skp\) previsto para a Fase 04/i,
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Voltar ao Dossier/i }));

    // Archive project -> stays private and hides from default active catalog filter
    await user.click(
      await screen.findByRole('button', { name: /Arquivar projecto/i }),
    );
    expect(
      await screen.findByText(/Arquivado localmente/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Privado por omissão/i).length).toBeGreaterThanOrEqual(
      1,
    );

    // Go back to catalog: hidden under default active filter, visible when All (incl. archived) selected
    await user.click(screen.getByRole('link', { name: /Voltar ao Catálogo/i }));
    expect(
      screen.queryByText('Torre Botânica de Maputo'),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText(/Estado do projecto/i),
      'all',
    );
    expect(
      await screen.findAllByText('Torre Botânica de Maputo'),
    ).not.toHaveLength(0);
  });

  it('renders honest 404 recovery for invalid project id dossier route', async () => {
    seedArchitectSession(1);
    renderWorkspaceApp('/workspace/projects/nao-existe-999');

    expect(
      await screen.findByRole('heading', {
        name: /Projecto não encontrado no arquivo local/i,
      }),
    ).toBeInTheDocument();
  });

  it('restores default library and removes local creations on global demo reset in Settings', async () => {
    const user = userEvent.setup();
    const actor = seedArchitectSession(0);
    createProject(
      {
        titlePt: 'Estudo Temporário Reset',
        subtitlePt: 'Teste de limpeza global.',
        departmentId: 'urbanism',
        disciplinePt: 'Urbanismo',
        studioBase: 'Maputo',
        phasePt: 'Conceito',
        projectStatus: 'concept',
        leadUserId: actor.id,
        nextMilestoneTitlePt: 'Marco teste',
        nextMilestoneDateIso: '2026-09-01',
      },
      actor,
    );
    expect(listProjects({ includeArchived: true })).toHaveLength(
      STUDIO_DESK_PROJECTS.length + 1,
    );

    renderWorkspaceApp('/workspace/settings');
    const resetButton = await screen.findByRole('button', {
      name: /Repor dados demo/i,
    });
    const nav = screen.getByRole('navigation', {
      name: /Navegação principal do O\+A Workspace/i,
    });
    expect(
      within(nav).getByRole('link', { name: /Projectos/i }),
    ).toBeInTheDocument();

    await user.click(resetButton);
    expect(listProjects({ includeArchived: true })).toHaveLength(
      STUDIO_DESK_PROJECTS.length,
    );
  });
});
