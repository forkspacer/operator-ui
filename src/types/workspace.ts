// API-aligned workspace interface based on localhost:8421/api/v1/docs
export interface Workspace {
  name: string;
  namespace: string;
  phase: string;
  message: string;
  type: string;
  hibernated: boolean;
}

export interface CreateWorkspaceRequest {
  name: string;
  namespace?: string;
  connection: {
    type: 'in-cluster' | 'kubeconfig';
    secret?: {
      name: string;
      namespace: string;
    };
  };
  hibernated: boolean;
  from?: {
    name: string;
    namespace: string;
  };
  autoHibernation?: {
    enabled: boolean;
    schedule: string;
    wakeSchedule?: string;
  };
}

export interface DeleteWorkspaceRequest {
  name: string;
  namespace?: string;
}

export interface ListWorkspacesRequest {
  limit?: number;
  continueToken?: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
  namespace?: string;
  hibernated?: boolean;
  autoHibernation?: {
    enabled: boolean;
    schedule: string;
    wakeSchedule?: string;
  };
}

export interface ApiResponse<T> {
  success?: {
    code: string;
    data: T;
  };
  error?: {
    code: string;
    data: string;
  };
}

export interface WorkspaceListResponse {
  continueToken: string;
  workspaces: Workspace[];
}