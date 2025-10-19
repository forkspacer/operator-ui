export interface Module {
  name: string;
  namespace: string;
  phase: ModulePhase;
  message?: string;
  hibernated: boolean;
  type: string;
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

export interface ModuleSourceConfigMapRef {
  name: string;
  namespace: string;
  key?: string;
}

export interface ModuleSourceChartRepository {
  url: string;
  chart: string;
  version?: string;
}

export interface ModuleSourceChartGit {
  repo: string;
  path: string;
  revision: string;
}

export interface ModuleSourceChartRef {
  configMap?: ModuleSourceConfigMapRef;
  repository?: ModuleSourceChartRepository;
  git?: ModuleSourceChartGit;
}

export interface ModuleSourceExistingHelmReleaseRef {
  name: string;
  namespace: string;
  chartSource: ModuleSourceChartRef;
  values?: Record<string, any>;
}

export interface ModuleSource {
  raw?: string;
  httpURL?: string;
  configMap?: ModuleSourceConfigMapRef;
  existingHelmRelease?: ModuleSourceExistingHelmReleaseRef;
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