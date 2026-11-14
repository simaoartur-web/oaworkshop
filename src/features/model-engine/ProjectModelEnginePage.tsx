import {
  Archive,
  ArrowLeft,
  Box,
  FileCode2,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { pickLocalized } from '../../locales';
import { MODEL_ENGINE_I18N } from './i18n';
import { ModelEngineStageSlot } from './ModelEngineStageSlot';
import { useProjectModelEngine } from './useProjectModelEngine';

export function ProjectModelEnginePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, language } = useWorkspaceSession();
  const navigate = useNavigate();

  const {
    project,
    resolution,
    source,
    context,
    loadState,
    activeErrorMessage,
    loadedMetrics,
    ignoreDemoAsset,
    handleSelectLocalFile,
    handleClearLocalFile,
    handleSelectDemoAsset,
    handleToggleIgnoreDemoAsset,
    handleModelLoaded,
    handleModelError,
  } = useProjectModelEngine(id);

  const dict = MODEL_ENGINE_I18N[language];

  useEffect(() => {
    if (project) {
      document.title = `${project.identity.code} · ${project.editorial.title[language]} · ${dict.pageTitleSuffix}`;
    } else {
      document.title = dict.notFoundTitle;
    }
  }, [project, language, dict.pageTitleSuffix, dict.notFoundTitle]);

  if (!currentUser) {
    return null;
  }

  if (!project || !resolution || !context) {
    return (
      <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
          404 · {dict.eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-light text-white">
          {dict.notFoundTitle}
        </h1>
        <p className="text-sm text-[#CCCCCC] leading-relaxed">
          {dict.notFoundBody}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/workspace/projects"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.backToCatalog}</span>
          </Link>
          <Link
            to="/workspace"
            className="min-h-[44px] px-4 py-2.5 border border-[#A65D4A] bg-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center transition-colors"
          >
            {dict.backToDesk}
          </Link>
        </div>
      </div>
    );
  }

  const sheetReferences = resolution.classifiedFiles.filter(
    (item) => !item.isNativeSkp && !item.isWeb3DFormat,
  );

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-8">
      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
            {dict.eyebrow}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/workspace/projects/${project.identity.id}`}
              className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>{dict.backToDossier}</span>
            </Link>

            <Link
              to="/workspace/projects"
              className="min-h-[44px] px-3.5 py-2 border border-white/14 bg-[#101010] hover:border-white/35 text-xs uppercase tracking-[0.13em] text-[#D8D8D8] hover:text-white inline-flex items-center transition-colors"
            >
              {dict.backToCatalog}
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-mono font-semibold uppercase tracking-[0.16em] text-[#CE826D]">
                {project.identity.code}
              </span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="text-[#D8D8D8]">
                {pickLocalized(project.classification.discipline, language)}
              </span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="text-[#BDBDBD]">
                {project.location.studioBase}
              </span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="font-mono text-[#BDBDBD]">
                {project.classification.scale} ·{' '}
                {project.classification.elevationDatum}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight">
              {pickLocalized(project.editorial.title, language)}
            </h1>
            <p className="text-sm text-[#CCCCCC] max-w-3xl">
              {pickLocalized(project.editorial.subtitle, language)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span
              data-testid="model-engine-privacy-badge"
              className="px-3 py-1.5 border border-white/16 bg-[#141414] text-[11px] uppercase tracking-[0.13em] text-[#E6E6E6] inline-flex items-center gap-1.5"
            >
              <Lock size={12} strokeWidth={1.6} className="text-[#CE826D]" />
              <span>
                {project.publication.publicationStatus === 'private'
                  ? dict.privateBadge
                  : project.publication.publicationStatus}
              </span>
            </span>

            {loadedMetrics && (
              <span
                data-testid="model-engine-loaded-metrics"
                className="px-3 py-1.5 border border-[#A65D4A]/60 bg-[#1B1412] text-[11px] font-mono text-white"
              >
                {loadedMetrics.meshCount ?? 1} meshes ·{' '}
                {loadedMetrics.triangleCount ?? 0} tris
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Archived Project Banner (Preserves all references without deletion) */}
      {resolution.isProjectArchived && (
        <div
          role="status"
          data-testid="model-engine-archived-banner"
          className="border-l-2 border-[#A65D4A] border border-white/16 bg-[#161312] p-4 flex items-start gap-3 text-xs sm:text-sm"
        >
          <Archive
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className="text-[#CE826D] shrink-0 mt-0.5"
          />
          <div className="space-y-1">
            <p className="font-medium text-white">
              {dict.archivedBannerTitle}
            </p>
            <p className="text-[#CCCCCC] leading-relaxed">
              {dict.archivedBannerBody}
            </p>
          </div>
        </div>
      )}

      {/* Agent B Integration Stage Slot */}
      <ModelEngineStageSlot
        source={source}
        context={context}
        loadState={loadState}
        errorMessage={activeErrorMessage}
        availableDemoAssets={resolution.availableDemoAssets}
        resolution={resolution}
        callbacks={{
          onModelLoaded: handleModelLoaded,
          onModelError: handleModelError,
          onBackToDossier: () =>
            navigate(`/workspace/projects/${project.identity.id}`),
          onSelectLocalFile: handleSelectLocalFile,
          onClearLocalFile: handleClearLocalFile,
          onSelectDemoAsset: handleSelectDemoAsset,
        }}
      />

      {/* Three-Category Canonical Breakdown: B (Demo Asset), C (Session File), A (Document References) */}
      <section
        aria-labelledby="model-categories-heading"
        className="space-y-5"
      >
        <div className="space-y-1">
          <h2
            id="model-categories-heading"
            className="text-lg sm:text-xl font-light text-white"
          >
            {dict.categories.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD]">
            {dict.categories.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* B. DEMO ASSET */}
          <div
            data-testid="model-category-demo-assets"
            className="border border-white/14 bg-[#111111] p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3 pb-3 oa-hairline-b">
              <div className="space-y-1">
                <h3 className="text-sm font-medium uppercase tracking-[0.13em] text-white flex items-center gap-2">
                  <Sparkles
                    size={15}
                    strokeWidth={1.5}
                    className="text-[#CE826D]"
                  />
                  <span>{dict.categories.demoTitle}</span>
                </h3>
                <p className="text-xs text-[#BDBDBD]">
                  {dict.categories.demoSubtitle}
                </p>
              </div>

              {resolution.availableDemoAssets.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleToggleIgnoreDemoAsset(!ignoreDemoAsset)}
                  className="min-h-[38px] px-3 py-1 border border-white/16 bg-[#171717] hover:border-[#A65D4A] text-[11px] uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white cursor-pointer shrink-0"
                >
                  {ignoreDemoAsset
                    ? dict.controls.restoreDemoStudyCta
                    : dict.controls.inspectEmptyStateCta}
                </button>
              )}
            </div>

            {resolution.availableDemoAssets.length === 0 ? (
              <p className="text-xs sm:text-sm text-[#9E9E9E]">
                {dict.categories.demoEmpty}
              </p>
            ) : (
              <div className="space-y-3">
                {resolution.availableDemoAssets.map((demoItem) => {
                  const isSelected =
                    !ignoreDemoAsset &&
                    !resolution.sessionModel &&
                    resolution.activeDemoAsset?.id === demoItem.id;
                  return (
                    <div
                      key={demoItem.id}
                      className={`p-4 border transition-colors ${
                        isSelected
                          ? 'border-[#A65D4A] bg-[#181311]'
                          : 'border-white/12 bg-[#141414]'
                      } space-y-2`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#CE826D]">
                          {demoItem.fileName}
                        </span>
                        <span className="px-2 py-0.5 border border-[#A65D4A]/50 bg-[#A65D4A]/15 text-[10px] uppercase tracking-[0.12em] text-white">
                          .{demoItem.format} · {dict.fictiveStudyBadge}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {pickLocalized(demoItem.title, language)}
                      </p>
                      <p className="text-xs text-[#CCCCCC]">
                        {pickLocalized(demoItem.studySummary, language)}
                      </p>
                      <p className="text-[11px] text-[#CE826D]">
                        {pickLocalized(demoItem.fictiveNotice, language)}
                      </p>
                      {!isSelected && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectDemoAsset(demoItem.id)}
                            className="min-h-[38px] px-3 py-1 border border-white/18 bg-[#101010] hover:border-[#A65D4A] text-[11px] uppercase tracking-[0.12em] text-white cursor-pointer"
                          >
                            {dict.controls.switchDemoStudyLabel}: .
                            {demoItem.format.toUpperCase()}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. SESSION FILE */}
          <div
            data-testid="model-category-session-file"
            className="border border-white/14 bg-[#111111] p-5 space-y-4"
          >
            <div className="space-y-1 pb-3 oa-hairline-b">
              <h3 className="text-sm font-medium uppercase tracking-[0.13em] text-white flex items-center gap-2">
                <Box size={15} strokeWidth={1.5} className="text-[#CE826D]" />
                <span>{dict.categories.sessionTitle}</span>
              </h3>
              <p className="text-xs text-[#BDBDBD]">
                {dict.categories.sessionSubtitle}
              </p>
            </div>

            {resolution.sessionModel ? (
              <div className="p-4 border border-[#A65D4A] bg-[#141816] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white break-all">
                    {resolution.sessionModel.fileName}
                  </span>
                  <span className="px-2 py-0.5 border border-[#A65D4A] bg-[#A65D4A]/20 text-[10px] uppercase tracking-[0.12em] text-white">
                    .{resolution.sessionModel.format} ·{' '}
                    {resolution.sessionModel.sizeLabel}
                  </span>
                </div>
                <p className="text-xs text-[#D8D8D8]">
                  {pickLocalized(resolution.statusMessage, language)}
                </p>
                <p className="font-mono text-[11px] text-[#9E9E9E] break-all">
                  {resolution.sessionModel.objectUrl}
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#9E9E9E]">
                {dict.categories.sessionEmpty}
              </p>
            )}
          </div>
        </div>

        {/* A. DOSSIER DOCUMENTARY REFERENCES */}
        <div
          data-testid="model-category-document-references"
          className="border border-white/14 bg-[#111111] p-5 space-y-5"
        >
          <div className="space-y-1 pb-3 oa-hairline-b">
            <h3 className="text-sm font-medium uppercase tracking-[0.13em] text-white">
              {dict.categories.docRefTitle} ({resolution.classifiedFiles.length})
            </h3>
            <p className="text-xs text-[#BDBDBD]">
              {dict.categories.docRefSubtitle}
            </p>
          </div>

          {resolution.classifiedFiles.length === 0 ? (
            <p className="text-xs sm:text-sm text-[#9E9E9E]">
              {dict.categories.docRefEmpty}
            </p>
          ) : (
            <div className="space-y-5">
              {/* Native SketchUp (.skp) references */}
              {resolution.skpReferences.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#CE826D]">
                    {dict.categories.skpGroupTitle} (
                    {resolution.skpReferences.length})
                  </h4>
                  <div className="divide-y divide-white/10 border border-white/12 bg-[#141414]">
                    {resolution.skpReferences.map((item) => (
                      <div
                        key={item.reference.id}
                        data-testid={`doc-ref-skp-${item.reference.id}`}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <FileCode2
                              size={15}
                              className="text-[#CE826D] shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-mono font-semibold text-white">
                              {item.reference.fileName}
                            </span>
                            <span className="px-2 py-0.5 bg-[#1E1917] border border-[#A65D4A]/50 text-[10px] uppercase tracking-[0.12em] text-[#F2D5CC]">
                              {dict.skpReferenceBadge}
                            </span>
                          </div>
                          <p className="text-xs text-[#D8D8D8]">
                            {pickLocalized(item.honestExplanation, language)}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-[#9E9E9E] shrink-0">
                          {item.reference.code} · {item.reference.versionLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata-only .glb / .gltf references in dossier */}
              {resolution.metadataOnly3DReferences.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#CE826D]">
                    {dict.categories.metadata3DGroupTitle} (
                    {resolution.metadataOnly3DReferences.length})
                  </h4>
                  <div className="divide-y divide-white/10 border border-white/12 bg-[#141414]">
                    {resolution.metadataOnly3DReferences.map((item) => (
                      <div
                        key={item.reference.id}
                        data-testid={`doc-ref-meta3d-${item.reference.id}`}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Box
                              size={15}
                              className="text-[#BDBDBD] shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-mono font-semibold text-white">
                              {item.reference.fileName}
                            </span>
                            <span className="px-2 py-0.5 bg-[#1B1B1B] border border-white/18 text-[10px] uppercase tracking-[0.12em] text-[#D8D8D8]">
                              {dict.metadataOnlyBadge}
                            </span>
                          </div>
                          <p className="text-xs text-[#D8D8D8]">
                            {pickLocalized(item.honestExplanation, language)}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-[#9E9E9E] shrink-0">
                          {item.reference.code} · {item.reference.versionLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other drawing/specification sheets */}
              {sheetReferences.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#9E9E9E]">
                    {dict.categories.sheetsGroupTitle} ({sheetReferences.length})
                  </h4>
                  <div className="divide-y divide-white/10 border border-white/12 bg-[#141414]">
                    {sheetReferences.map((item) => (
                      <div
                        key={item.reference.id}
                        className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText
                            size={14}
                            className="text-[#9E9E9E] shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-mono text-[#E0E0E0]">
                            {item.reference.fileName}
                          </span>
                          <span className="text-[#9E9E9E]">
                            — {pickLocalized(item.reference.note, language)}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#9E9E9E]">
                          {item.reference.code} · {item.reference.versionLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProjectModelEnginePage;
