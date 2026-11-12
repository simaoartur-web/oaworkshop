import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import { ProjectGalleryView } from '../project-experience';
import { PROJECT_LIBRARY_I18N } from './i18n';
import { useProjectLibrary } from './useProjectLibrary';

export function ProjectLibraryCatalogPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { studioDeskProjects } = useProjectLibrary();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dict = PROJECT_LIBRARY_I18N[language];

  useEffect(() => {
    document.title = dict.catalog.pageTitle;
  }, [dict.catalog.pageTitle]);

  if (!currentUser) {
    return null;
  }

  return (
    <ProjectGalleryView
      projects={studioDeskProjects}
      language={language}
      departments={DEPARTMENTS}
      activeUser={currentUser}
      selectedProjectId={searchParams.get('project')}
      onOpenProject={(project) => navigate(`/workspace/projects/${project.id}`)}
      onOpenRevision={(project) =>
        navigate(`/workspace/projects/${project.id}?section=development`)
      }
      onCreateProject={() => navigate('/workspace/projects/new')}
    />
  );
}
