export interface Module {
  name: string;
  namespace: string;
  phase: ModulePhase;
  message?: string;
  hibernated: boolean;
  workspace?: ModuleWorkspaceReference;
}

export type ModulePhase =
  | 'ready'
  | 'installing'
  | 'uninstalling'
  | 'sleeping'
  | 'sleeped'
  | 'resuming'
  | 'failed';

export interface ModuleWorkspaceReference {
  name: string;
  namespace: string;
}

export interface ModuleSource {
  raw?: string;
  httpURL?: string;
}

export interface CreateModuleRequest {
  name: string;
  namespace?: string;
  workspace: ModuleWorkspaceReference;
  source: ModuleSource;
  config: Record<string, any>;
  hibernated: boolean;
}

export interface UpdateModuleRequest {
  name: string;
  namespace: string;
  hibernated?: boolean;
}

export interface DeleteModuleRequest {
  name: string;
  namespace: string;
}

export interface ListModulesRequest {
  limit?: number;
  continueToken?: string;
  workspace?: string;
  namespace?: string;
}

export interface ModuleListResponse {
  modules: Module[];
  continueToken: string;
}