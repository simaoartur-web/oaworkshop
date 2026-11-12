import { ArrowLeft, Box } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import { getProjectById } from '../../data/projectLibraryRepository';
import { pickLocalized } from '../../locales';
import { resolveActiveNavItem } from '../workspace-shell/shellNavigation';

const MODEL_ROUTE_PATTERN = /^\/workspace\/projects\/([^/]+)\/model\/?$/i;

export function PlannedModuleView() {
  const { language, t } = useWorkspaceSession();
  const location = useLocation();
  const modelMatch = location.pathname.match(MODEL_ROUTE_PATTERN);
  const modelProjectId = modelMatch ? decodeURIComponent(modelMatch[1]) : null;
  const modelProject = modelProjectId ? getProjectById(modelProjectId) : null;
  const activeItem = modelMatch ? null : resolveActiveNavItem(location.pathname);

  useEffect(() => {
    if (modelMatch) {
      const modelTitle = language === 'pt' ? 'Modelo Web 3D (Fase 04)' : 'Web 3D Model (Phase 04)';
      document.title = modelProject
        ? `${modelProject.identity.code} · ${modelTitle} — ${t.shell.planned.pageTitleSuffix}`
        : `${t.shell.planned.routeNotFoundTitle} — ${t.shell.planned.pageTitleSuffix}`;
      return;
    }

    const label = activeItem
      ? pickLocalized(activeItem.label, language)
      : t.shell.planned.routeNotFoundTitle;
    document.title = `${label} — ${t.shell.planned.pageTitleSuffix}`;
  }, [activeItem, language, modelMatch, modelProject, t.shell.planned]);

  if (modelMatch) {
    if (!modelProject) {
      return (
        <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#A65D4A]">
            404 · {t.common.axisLabel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-light text-white">
            {t.shell.planned.routeNotFoundTitle}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/workspace/projects"
              className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>
                {language === 'pt' ? 'Voltar ao Catálogo' : 'Back to Catalog'}
              </span>
            </Link>
            <Link
              to="/workspace"
              className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-white/40 text-xs font-medium uppercase tracking-[0.16em] text-[#E0E0E0] inline-flex items-center transition-colors"
            >
              {t.shell.planned.backToDesk}
            </Link>
          </div>
        </div>
      );
    }

    const modelHeading =
      language === 'pt'
        ? 'Visualizador Web 3D (.glb / .skp) previsto para a Fase 04.'
        : 'Web 3D Viewer (.glb / .skp) planned for Phase 04.';
    const modelBody =
      language === 'pt'
        ? 'O motor de visualização espacial Web 3D em navegador ainda não foi activado nesta fase. Os metadados de referência do projecto já estão preservados no dossier técnico.'
        : 'The in-browser Web 3D spatial viewer is not enabled yet at this phase. Project reference metadata is already preserved in the technical dossier.';
    const modelFiles = modelProject.files.filter(
      (file) => file.kind === 'model_3d' || file.kind === 'source_skp',
    );

    return (
      <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-6">
        <header className="pb-6 oa-hairline-b space-y-3">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em]">
            <span className="text-[#CE826D]">{modelProject.identity.code}</span>
            <span aria-hidden="true" className="text-white/30">
              ·
            </span>
            <span className="border border-dashed border-white/25 bg-[#181818] px-2 py-0.5 text-[#D4D4D4]">
              {language === 'pt' ? 'Fase 04 · Em breve' : 'Phase 04 · Coming soon'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-light text-white flex items-center gap-3">
            <Box
              size={22}
              strokeWidth={1.4}
              aria-hidden="true"
              className="text-[#CE826D] shrink-0"
            />
            <span>{pickLocalized(modelProject.editorial.title, language)}</span>
          </h1>
          <p className="text-sm text-[#CCCCCC]">{modelHeading}</p>
        </header>

        <section className="border border-white/16 bg-[#141414] p-5 sm:p-7 space-y-4">
          <p className="text-sm text-[#E6E6E6] leading-relaxed">{modelBody}</p>

          {modelFiles.length > 0 && (
            <div className="pt-3 oa-hairline-t space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8]">
                {language === 'pt'
                  ? 'Referências 3D / SKP registadas (metadados):'
                  : 'Registered 3D / SKP metadata references:'}
              </p>
              <ul className="space-y-1.5 text-xs font-mono text-[#E0E0E0]">
                {modelFiles.map((file) => (
                  <li key={file.id}>
                    {file.fileName} · {file.formatLabel} · {file.versionLabel}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              to={`/workspace/projects/${modelProject.identity.id}`}
              className="min-h-[44px] px-4 py-2.5 bg-[#A65D4A] hover:bg-[#B86A56] text-xs font-medium uppercase tracking-[0.14em] text-[#050505] inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>
                {language === 'pt' ? 'Voltar ao Dossier' : 'Back to Dossier'}
              </span>
            </Link>
            <Link
              to="/workspace/projects"
              className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#111111] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] inline-flex items-center transition-colors"
            >
              {language === 'pt' ? 'Catálogo de Projectos' : 'Project Catalog'}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!activeItem) {
    return (
      <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#A65D4A]">
          404 · {t.common.axisLabel}
        </p>
        <h1 className="text-2xl sm:text-3xl font-light text-white">
          {t.shell.planned.routeNotFoundTitle}
        </h1>
        <Link
          to="/workspace"
          className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>{t.shell.planned.backToDesk}</span>
        </Link>
      </div>
    );
  }

  const label = pickLocalized(activeItem.label, language);
  const description = pickLocalized(activeItem.description, language);
  const targetPhase = pickLocalized(activeItem.targetPhase, language);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8">
      <header className="pb-6 oa-hairline-b space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em]">
          <span className="text-[#CE826D]">
            {t.shell.activePlatePrefix} {activeItem.plateNumber}
          </span>
          <span aria-hidden="true" className="text-white/30">
            ·
          </span>
          <span className="border border-dashed border-white/25 bg-[#181818] px-2 py-0.5 text-[#D4D4D4]">
            {t.shell.planned.badgePrefix}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
          {label}
        </h1>
        <p className="text-sm sm:text-base text-[#CCCCCC] max-w-2xl">
          {description}
        </p>
      </header>

      {/* Honest Roadmap Status Sheet */}
      <section
        aria-labelledby="planned-status-heading"
        className="border border-white/16 bg-[#141414] p-5 sm:p-8 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 oa-hairline-b">
          <h2
            id="planned-status-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-white"
          >
            {t.shell.planned.honestNoticeTitle}
          </h2>
          <span className="border border-white/22 bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] text-[#E0E0E0]">
            {t.shell.planned.targetPhaseLabel}: {targetPhase}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-[#E6E6E6]">
          {t.shell.planned.honestNoticeBody}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            to="/workspace"
            className="min-h-[44px] px-5 py-2.5 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{t.shell.planned.backToDesk}</span>
          </Link>

          <Link
            to="/workspace/settings"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#111111] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            <span>{t.shell.planned.openSettingsAction}</span>
          </Link>
        </div>
      </section>

      {activeItem.id === 'departments' && (
        <section aria-labelledby="planned-ref-heading" className="space-y-4">
          <h2
            id="planned-ref-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-[#D4D4D4]"
          >
            {t.shell.planned.referenceDataLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(DEPARTMENTS).map((dept) => (
              <div
                key={dept.id}
                className="border border-white/14 bg-[#121212] p-4 space-y-1.5"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D]">
                  {dept.code}
                </p>
                <p className="text-sm font-medium text-white">
                  {pickLocalized(dept.name, language)}
                </p>
                <p className="text-xs leading-relaxed text-[#CCCCCC]">
                  {pickLocalized(dept.focus, language)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeItem.id === 'team' && (
        <section aria-labelledby="planned-ref-heading" className="space-y-4">
          <h2
            id="planned-ref-heading"
            className="text-xs font-medium uppercase tracking-[0.20em] text-[#D4D4D4]"
          >
            {t.shell.planned.referenceDataLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_USERS.map((member) => (
              <div
                key={member.id}
                className="border border-white/14 bg-[#121212] p-4 space-y-1.5"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D]">
                  {member.code} · {member.studioBase}
                </p>
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-[#CCCCCC]">
                  {pickLocalized(member.roleLabel, language)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
