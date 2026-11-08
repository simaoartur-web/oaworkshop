import { createContext, useContext } from 'react';

export interface WorkspaceShellUiContextValue {
  railCompact: boolean;
  setRailCompact: (compact: boolean) => void;
  openSearch: () => void;
}

export const WorkspaceShellUiContext =
  createContext<WorkspaceShellUiContextValue | null>(null);

export function useOptionalWorkspaceShellUi(): WorkspaceShellUiContextValue | null {
  return useContext(WorkspaceShellUiContext);
}
