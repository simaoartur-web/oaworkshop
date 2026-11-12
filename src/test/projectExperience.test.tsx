import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEMO_USERS, DEPARTMENTS } from '../data/fixtures';
import {
  STUDIO_DESK_ACTIVITIES,
  STUDIO_DESK_PROJECTS,
} from '../data/studioDeskFixtures';
import {
  ProjectCreationWizard,
  ProjectDossierView,
  ProjectGalleryView,
  getProjectExperienceDictionary,
  suggestNextProjectCode,
  type ProjectCreationDraftPayload,
} from '../features/project-experience';

function collectLeafKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return [prefix];
  }
  return Object.entries(obj).flatMap(([key, value]) =>
    collectLeafKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

function collectLeafStrings(obj: unknown): string[] {
  if (typeof obj === 'string') {
    return [obj];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap(collectLeafStrings);
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).flatMap(collectLeafStrings);
  }
  return [];
}

describe('O+A Workspace — Phase 03B Architectural Project Experience', () => {
  afterEach(() => {
    cleanup();
  });

  it('maintains strict PT/EN key parity and avoids developer jargon in UI copy', () => {
    const pt = getProjectExperienceDictionary('pt');
    const en = getProjectExperienceDictionary('en');

    expect(collectLeafKeys(pt).sort()).toEqual(collectLeafKeys(en).sort());

    const allUiStrings = [...collectLeafStrings(pt), ...collectLeafStrings(en)].join(
      ' | ',
    );
    expect(allUiStrings).not.toMatch(/\b(F03|mocks?|fixtures?|contratos?)\b/i);
  });

  it('renders ProjectGalleryView with studio projects, filters, technical list toggle, and clear callbacks', async () => {
    const user = userEvent.setup();
    const onOpenProject = vi.fn();
    const onOpenRevision = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectGalleryView
        projects={STUDIO_DESK_PROJECTS}
        departments={DEPARTMENTS}
        selectedProjectId="sd-proj-oa-26-101"
        onOpenProject={onOpenProject}
        onOpenRevision={onOpenRevision}
        onCreateProject={onCreateProject}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /Projectos do Atelier/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/OA-26-101/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Galeria Cívica & Pátio da Ponta Vermelha/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Privado/i).length).toBeGreaterThan(0);

    // Search without accents matches Ponta / Pátio / Corredor
    const searchInput = screen.getByLabelText(/Procurar projecto/i);
    await user.type(searchInput, 'Corredor');
    expect(
      screen.getByText(/Corredor Pedonal & Terrários da Costa/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Galeria Cívica & Pátio da Ponta Vermelha/i),
    ).not.toBeInTheDocument();

    // No-match shows honest empty state & Limpar filtros restores list
    await user.clear(searchInput);
    await user.type(searchInput, 'Inexistente-XYZ');
    expect(
      screen.getByText(/Nenhum projecto corresponde a esta pesquisa/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Limpar filtros/i }));
    expect(
      screen.getByText(/Galeria Cívica & Pátio da Ponta Vermelha/i),
    ).toBeInTheDocument();

    // Switch to Lista técnica and trigger Open & View Revision callbacks
    await user.click(screen.getByRole('button', { name: /Lista técnica/i }));
    expect(screen.getByRole('table')).toBeInTheDocument();

    const openButtons = screen.getAllByRole('button', {
      name: /Abrir projecto/i,
    });
    await user.click(openButtons[0]);
    expect(onOpenProject).toHaveBeenCalledWith(STUDIO_DESK_PROJECTS[0]);

    const reviewButtons = screen.getAllByRole('button', {
      name: /Ver revisão/i,
    });
    await user.click(reviewButtons[0]);
    expect(onOpenRevision).toHaveBeenCalledWith(STUDIO_DESK_PROJECTS[0]);

    await user.click(screen.getByRole('button', { name: /Novo projecto/i }));
    expect(onCreateProject).toHaveBeenCalledTimes(1);
  });

  it('switches ProjectGalleryView completely to English when language="en"', () => {
    render(
      <ProjectGalleryView
        projects={STUDIO_DESK_PROJECTS}
        departments={DEPARTMENTS}
        language="en"
        onOpenProject={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /Studio Projects/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ponta Vermelha Civic Gallery/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Technical list/i }),
    ).toBeInTheDocument();
  });

  it('organizes ProjectDossierView into 6 comprehensible sections, keyboard tab nav, and honest file cycle (.skp vs .glb)', async () => {
    const user = userEvent.setup();
    const onBackToProjects = vi.fn();
    const onRegisterDocumentMetadata = vi.fn();
    const onOpen3DPlaceholderNote = vi.fn();

    render(
      <ProjectDossierView
        project={STUDIO_DESK_PROJECTS[0]}
        collaborators={DEMO_USERS}
        departments={DEPARTMENTS}
        activityEntries={STUDIO_DESK_ACTIVITIES}
        onBackToProjects={onBackToProjects}
        onRegisterDocumentMetadata={onRegisterDocumentMetadata}
        onOpen3DPlaceholderNote={onOpen3DPlaceholderNote}
      />,
    );

    // 1. Identity loaded initially + pending status summary visible above tabs
    expect(
      screen.getByText(/Ponto de situação e próximo passo/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Identidade e enquadramento/i)).toBeInTheDocument();

    // Keyboard ArrowRight on tablist moves to Team (Equipa)
    const identityTab = screen.getByRole('tab', { name: /1\. Identidade/i });
    identityTab.focus();
    await user.keyboard('{ArrowRight}');
    const teamTab = screen.getByRole('tab', { name: /2\. Equipa/i });
    expect(teamTab).toHaveFocus();
    expect(teamTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText(/Responsável e equipa envolvida/i),
    ).toBeInTheDocument();

    // Next section -> 3. Desenvolvimento
    await user.click(
      screen.getByRole('button', { name: /Secção seguinte: Desenvolvimento/i }),
    );
    expect(
      screen.getByText(/Desenvolvimento, marcos e entregas/i),
    ).toBeInTheDocument();

    // 4. Documentação: check .skp source honesty + .glb Phase 04 reservation + metadata registration without real upload
    await user.click(screen.getByRole('tab', { name: /4\. Documentação/i }));
    expect(
      screen.getByText(/Registo visual de referências — sem envio de ficheiros reais/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Formato de origem SketchUp \(\.skp\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Modelo Web 3D \(\.glb \/ \.gltf\)/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Ver nota sobre vista 3D/i }),
    );
    expect(onOpen3DPlaceholderNote).toHaveBeenCalledWith(
      STUDIO_DESK_PROJECTS[0],
    );
    expect(
      screen.getByText(/A abertura interactiva de modelos 3D/i),
    ).toBeInTheDocument();

    // Open metadata entry form and test field validation + submit
    const addButtons = screen.getAllByRole('button', {
      name: /Adicionar informação/i,
    });
    await user.click(addButtons[0]);

    await user.click(
      screen.getByRole('button', { name: /Guardar referência neste navegador/i }),
    );
    const fileInput = screen.getByLabelText(/Nome do ficheiro/i);
    expect(fileInput).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.getByText(/Indique o nome do ficheiro de referência/i),
    ).toBeInTheDocument();

    await user.type(fileInput, 'Corte-BB_v02.pdf');
    await user.type(
      screen.getByLabelText(/Relação com o projecto/i),
      'Corte transversal para validação interna',
    );
    await user.click(
      screen.getByRole('button', { name: /Guardar referência neste navegador/i }),
    );

    expect(onRegisterDocumentMetadata).toHaveBeenCalledTimes(1);
    expect(onRegisterDocumentMetadata.mock.calls[0][1]).toMatchObject({
      fileName: 'Corte-BB_v02.pdf',
      extension: 'pdf',
    });
    expect(screen.getByText('Corte-BB_v02.pdf')).toBeInTheDocument();

    // 5. Histórico & 6. Visibilidade
    await user.click(screen.getByRole('tab', { name: /5\. Histórico/i }));
    expect(
      screen.getByText(/Histórico de revisões e acontecimentos/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /6\. Visibilidade/i }));
    expect(
      screen.getByText(/Este projecto está privado por omissão\./i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Voltar aos projectos/i }),
    );
    expect(onBackToProjects).toHaveBeenCalledTimes(1);
  });

  it('validates ProjectCreationWizard steps, preserves field state across steps, enforces private default, and emits payload', async () => {
    const user = userEvent.setup();
    const submitted: ProjectCreationDraftPayload[] = [];
    const onCancel = vi.fn();
    const onBackToCatalog = vi.fn();

    render(
      <ProjectCreationWizard
        collaborators={DEMO_USERS}
        departments={DEPARTMENTS}
        existingProjectCodes={['OA-26-125', 'OA-26-126']}
        onSubmitProject={(payload) => {
          submitted.push(payload);
        }}
        onCancel={onCancel}
        onBackToCatalog={onBackToCatalog}
      />,
    );

    expect(suggestNextProjectCode(['OA-26-125', 'OA-26-126'])).toBe(
      'OA-26-127',
    );

    // Try advancing Step 1 empty -> expect clear field-associated validation
    await user.click(screen.getByRole('button', { name: /Seguinte/i }));
    const titlePtInput = screen.getByLabelText(/Nome em Português/i);
    expect(titlePtInput).toHaveAttribute('aria-invalid', 'true');
    expect(titlePtInput).toHaveFocus();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fill Step 1 validly
    await user.type(titlePtInput, 'Pavilhão Fluvial da Matola');
    await user.type(
      screen.getByLabelText(/Nome em Inglês/i),
      'Matola Riverfront Pavilion',
    );
    await user.type(
      screen.getByLabelText(/Breve descrição/i),
      'Estrutura cultural sombreada em betão aparente junto à frente ribeirinha.',
    );
    await user.selectOptions(
      screen.getByLabelText(/^Disciplina/i),
      'Arquitectura Pública',
    );

    await user.click(screen.getByRole('button', { name: /Seguinte/i }));

    // Step 2: Organization -> select lead & extra contributor, then go Back to Step 1 and verify preservation
    expect(
      screen.getByRole('heading', { name: /2 · Equipa e departamento/i }),
    ).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText(/Departamento/i),
      'urbanism',
    );
    await user.click(screen.getByLabelText(/Clara Ferraz/i));

    await user.click(screen.getByRole('button', { name: /Anterior/i }));
    expect(screen.getByLabelText(/Nome em Português/i)).toHaveValue(
      'Pavilhão Fluvial da Matola',
    );
    await user.click(screen.getByRole('button', { name: /Seguinte/i }));
    expect(screen.getByLabelText(/Departamento/i)).toHaveValue('urbanism');
    await user.click(screen.getByRole('button', { name: /Seguinte/i }));

    // Step 3: Planning validation then fill
    expect(
      screen.getByRole('heading', { name: /3 · Fase inicial e primeiro marco/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Seguinte/i }));
    expect(screen.getByLabelText(/Marco seguinte/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    );

    await user.click(screen.getByLabelText(/Anteprojecto/i));
    await user.type(
      screen.getByLabelText(/Marco seguinte/i),
      'Entrega de plantas de implantação 1:500',
    );
    await user.click(screen.getByRole('button', { name: /Seguinte/i }));

    // Step 4: Review & mandatory privacy guarantee
    expect(
      screen.getByRole('heading', { name: /4 · Revisão final e privacidade/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Visibilidade inicial garantida: Privado/i),
    ).toBeInTheDocument();
    expect(screen.getByText('OA-26-127')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Guardar neste navegador/i }),
    );

    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({
      code: 'OA-26-127',
      publicationStatus: 'private',
      departmentId: 'urbanism',
      projectStatus: 'design',
      title: {
        pt: 'Pavilhão Fluvial da Matola',
        en: 'Matola Riverfront Pavilion',
      },
    });
    expect(submitted[0].contributorUserIds).toContain('usr-com-05');

    // Honest confirmation screen & return to catalog
    expect(
      screen.getByRole('heading', {
        name: /Novo dossier preparado em modo privado/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Voltar aos projectos/i }),
    );
    expect(onBackToCatalog).toHaveBeenCalledTimes(1);
  });

  it('confirms unsaved changes with Escape / dialog trap before cancelling ProjectCreationWizard', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ProjectCreationWizard
        collaborators={DEMO_USERS}
        departments={DEPARTMENTS}
        onSubmitProject={vi.fn()}
        onCancel={onCancel}
      />,
    );

    // Cancel when clean exits immediately without confirmation modal
    await user.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    // Dirty state triggers accessible leave confirmation dialog
    await user.type(screen.getByLabelText(/Nome em Português/i), 'Obra X');
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelBtn);

    const dialog = screen.getByRole('dialog', {
      name: /Sair sem guardar este projecto\?/i,
    });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /Continuar a editar/i }),
    ).toHaveFocus();

    // Escape closes dialog cleanly and keeps draft intact
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: /Sair sem guardar/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Nome em Português/i)).toHaveValue('Obra X');

    // Re-open leave confirmation and explicitly discard
    await user.click(screen.getByRole('button', { name: /Cancelar/i }));
    await user.click(
      screen.getByRole('button', { name: /Descartar e voltar aos projectos/i }),
    );
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
