import { useEffect } from 'react';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { TechnicalCatalogView } from './TechnicalCatalogView';
import { PROJECT_LIBRARY_I18N } from './i18n';
import { useProjectLibrary } from './useProjectLibrary';

export function ProjectLibraryCatalogPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { projects } = useProjectLibrary();
  const dict = PROJECT_LIBRARY_I18N[language];

  useEffect(() => {
    document.title = dict.catalog.pageTitle;
  }, [dict.catalog.pageTitle]);

  if (!currentUser) {
    return null;
  }

  return (
    <TechnicalCatalogView
      projects={projects}
      language={language}
      currentUser={currentUser}
    />
  );
}
