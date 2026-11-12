import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import { listAllDemoCollaborators } from '../../data/projectLibraryRepository';
import { ProjectCreationWizard } from '../project-experience';
import { PROJECT_LIBRARY_I18N } from './i18n';
import { wizardPayloadToCreateInput } from './projectExperienceContract';
import { useProjectLibrary } from './useProjectLibrary';

export function ProjectCreateEnginePage() {
  const { currentUser, language } = useWorkspaceSession();
  const { projects, create } = useProjectLibrary();
  const navigate = useNavigate();
  const dict = PROJECT_LIBRARY_I18N[language];

  useEffect(() => {
    document.title = dict.create.pageTitle;
  }, [dict.create.pageTitle]);

  const collaborators = useMemo(() => listAllDemoCollaborators(), []);
  const existingProjectCodes = useMemo(
    () => projects.map((item) => item.identity.code),
    [projects],
  );

  if (!currentUser) {
    return null;
  }

  return (
    <ProjectCreationWizard
      language={language}
      collaborators={collaborators}
      departments={DEPARTMENTS}
      existingProjectCodes={existingProjectCodes}
      initialDraft={{
        departmentId: currentUser.departmentId,
        leadUserId: currentUser.id,
        studioBase: currentUser.studioBase,
        contributorUserIds: [currentUser.id],
      }}
      onSubmitProject={(payload) => {
        const created = create(wizardPayloadToCreateInput(payload));
        return {
          projectId: created.identity.id,
          savedCode: created.identity.code,
        };
      }}
      onOpenCreatedProject={(projectId) =>
        navigate(`/workspace/projects/${projectId}`)
      }
      onBackToCatalog={() => navigate('/workspace/projects')}
      onCancel={() => navigate('/workspace/projects')}
    />
  );
}
