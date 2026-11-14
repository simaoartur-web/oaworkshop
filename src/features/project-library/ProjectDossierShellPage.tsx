import { ArrowLeft, Box } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import {
  resolveProjectModelState,
  subscribeModelEngineChanges,
} from '../../data/modelAssetRepository';
import { canonicalToStudioDeskProject } from '../../data/projectLibraryAdapter';
import { listAllDemoCollaborators } from '../../data/projectLibraryRepository';
import { MODEL_ENGINE_I18N } from '../model-engine/i18n';
import { ProjectDossierView, type DossierSectionId } from '../project-experience';
import { PROJECT_LIBRARY_I18N } from './i18n';
import {
  canonicalFilesToExperienceDocuments,
  canonicalRevisionsToExperienceRevisions,
  experienceDocumentToCanonicalInput,
  experienceMetadataPatchToCanonical,
} from './projectExperienceContract';
import { useProjectLibrary } from './useProjectLibrary';

const VALID_DOSSIER_SECTIONS = new Set<DossierSectionId>([
  'identity',
  'team',
  'development',
  'documentation',
  'history',
  'visibility',
]);

export function ProjectDossierShellPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, language } = useWorkspaceSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    getProject,
    updateMetadata,
    archive,
    restore,
    addRevision,
    addFileReference,
  } = useProjectLibrary();

  const dict = PROJECT_LIBRARY_I18N[language];
  const modelDict = MODEL_ENGINE_I18N[language];
  const record = getProject(id);
  const collaborators = useMemo(() => listAllDemoCollaborators(), []);
  const [modelEngineTick, setModelEngineTick] = useState(0);

  useEffect(() => {
    return subscribeModelEngineChanges(() => {
      setModelEngineTick((prev) => prev + 1);
    });
  }, []);

  const modelResolution = useMemo(() => {
    void modelEngineTick;
    if (!record) {
      return null;
    }
    return resolveProjectModelState(record);
  }, [record, modelEngineTick]);

  useEffect(() => {
    if (record) {
      document.title = `${record.identity.code} · ${record.editorial.title[language]} — O+A Workspace`;
    } else {
      document.title = dict.dossier.notFoundTitle;
    }
  }, [record, language, dict.dossier.notFoundTitle]);

  const rawSection = searchParams.get('section') as DossierSectionId | null;
  const initialSection: DossierSectionId =
    rawSection && VALID_DOSSIER_SECTIONS.has(rawSection)
      ? rawSection
      : 'identity';

  if (!currentUser) {
    return null;
  }

  if (!record) {
    return (
      <div className="w-full max-w-[920px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
          404 · {dict.dossier.eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-light text-white">
          {dict.dossier.notFoundTitle}
        </h1>
        <p className="text-sm text-[#CCCCCC]">{dict.dossier.notFoundBody}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/workspace/projects"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.dossier.backToCatalog}</span>
          </Link>
          <Link
            to="/workspace/projects/new"
            className="min-h-[44px] px-4 py-2.5 border border-[#A65D4A] bg-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-[#050505] inline-flex items-center transition-colors"
          >
            {dict.dossier.createProjectLink}
          </Link>
        </div>
      </div>
    );
  }

  const deskProject = canonicalToStudioDeskProject(record);
  const documents = canonicalFilesToExperienceDocuments(record);
  const revisions = canonicalRevisionsToExperienceRevisions(record);
  const isArchived =
    record.metadata.isArchived ||
    record.lifecycle.projectStatus === 'archived';

  return (
    <div className="space-y-6">
      <ProjectDossierView
        project={deskProject}
        language={language}
        collaborators={collaborators}
        departments={DEPARTMENTS}
        documents={documents}
        revisions={revisions}
        initialSection={initialSection}
        isArchived={isArchived}
        onBackToProjects={() => navigate('/workspace/projects')}
        onRegisterDocumentMetadata={(projectId, metadata) => {
          const result = addFileReference(
            projectId,
            experienceDocumentToCanonicalInput(metadata),
          );
          if (!result) {
            throw new Error(dict.dossier.notFoundTitle);
          }
        }}
        onUpdateMetadata={(patch) => {
          const result = updateMetadata(
            record.identity.id,
            experienceMetadataPatchToCanonical(patch),
          );
          if (!result) {
            throw new Error(dict.dossier.notFoundTitle);
          }
        }}
        onArchiveProject={() => {
          archive(record.identity.id);
        }}
        onRestoreProject={(nextStatus) => {
          restore(record.identity.id, nextStatus);
        }}
        onAddRevision={(revInput) => {
          const result = addRevision(record.identity.id, {
            versionLabel: revInput.versionLabel,
            summaryPt: revInput.summaryPt,
            summaryEn: revInput.summaryEn,
            reviewState: revInput.reviewState,
          });
          if (!result) {
            throw new Error(dict.dossier.notFoundTitle);
          }
        }}
        onOpenPhase04Model={() =>
          navigate(`/workspace/projects/${record.identity.id}/model`)
        }
        onOpen3DPlaceholderNote={() =>
          navigate(`/workspace/projects/${record.identity.id}/model`)
        }
        onOpenInStudioDesk={
          record.metadata.origin === 'seed-fixture'
            ? () => navigate(`/workspace?project=${record.identity.id}`)
            : undefined
        }
      />

      {modelResolution && (
        <aside
          aria-label={modelDict.dossierStrip.title}
          data-testid="dossier-model-engine-strip"
          className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pb-8"
        >
          <div className="border border-white/14 bg-[#101010] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#CE826D]">
                <Box size={14} strokeWidth={1.5} aria-hidden="true" />
                <span>{modelDict.dossierStrip.eyebrow}</span>
                <span aria-hidden="true" className="text-white/30">
                  ·
                </span>
                <span className="text-white">
                  {modelDict.dossierStrip.title}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#D8D8D8]">
                {modelResolution.origin === 'session-file'
                  ? modelDict.dossierStrip.sessionActiveSummary
                  : modelResolution.origin === 'demo-asset'
                    ? modelDict.dossierStrip.demoAvailableSummary
                    : modelDict.dossierStrip.noLoadableModelSummary}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#BDBDBD]">
                <span>
                  {modelDict.dossierStrip.skpCountLabel(
                    modelResolution.skpReferences.length,
                  )}
                </span>
                <span aria-hidden="true" className="text-white/25">
                  ·
                </span>
                <span>
                  {modelDict.dossierStrip.meta3DCountLabel(
                    modelResolution.metadataOnly3DReferences.length,
                  )}
                </span>
              </div>
            </div>

            <Link
              to={`/workspace/projects/${record.identity.id}/model`}
              data-testid="dossier-open-model-chamber-link"
              className="min-h-[44px] px-4 py-2.5 border border-[#A65D4A] bg-[#161110] hover:bg-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Box size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{modelDict.dossierStrip.openModelRouteCta}</span>
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}
