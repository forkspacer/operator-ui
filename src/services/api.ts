import {
  Workspace,
  CreateWorkspaceRequest,
  DeleteWorkspaceRequest,
  ListWorkspacesRequest,
  UpdateWorkspaceRequest,
  WorkspaceListResponse,
  ApiResponse
} from '../types/workspace';
import {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  DeleteModuleRequest,
  ListModulesRequest,
  ModuleListResponse
} from '../types/module';

const API_BASE_URL = 'http://localhost:8421/api/v1';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Handle empty responses (like 204 No Content)
      const text = await response.text();

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        // Try to parse error response for better error messages
        if (text) {
          try {
            const errorData = JSON.parse(text);
            if (errorData.error?.data) {
              errorMessage = errorData.error.data;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If JSON parsing fails, use the text content or fallback
            errorMessage = text || errorMessage;
          }
        }

        throw new Error(errorMessage);
      }
      if (!text) {
        // Return a mock successful response for empty bodies
        return {
          success: { code: 'ok', data: null as T }
        };
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async listWorkspaces(params: ListWorkspacesRequest = {}): Promise<Workspace[]> {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.continueToken) queryParams.append('continueToken', params.continueToken);

    const queryString = queryParams.toString();
    const url = queryString ? `/workspace/list?${queryString}` : '/workspace/list';

    const response = await this.request<WorkspaceListResponse>(url, {
      method: 'GET',
    });

    if (response.error) {
      throw new Error(response.error.data);
    }

    return response.success?.data.workspaces || [];
  }

  async createWorkspace(workspace: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await this.request<Workspace>('/workspace/', {
      method: 'POST',
      body: JSON.stringify(workspace),
    });

    if (response.error) {
      throw new Error(response.error.data);
    }

    return response.success!.data;
  }

  async deleteWorkspace(params: DeleteWorkspaceRequest): Promise<void> {
    const response = await this.request<void>('/workspace/', {
      method: 'DELETE',
      body: JSON.stringify(params),
    });

    if (response.error) {
      throw new Error(response.error.data);
    }
  }

  async updateWorkspace(params: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await this.request<Workspace>('/workspace/', {
      method: 'PATCH',
      body: JSON.stringify(params),
    });

    if (response.error) {
      throw new Error(response.error.data);
    }

    return response.success!.data;
  }

  async hibernateWorkspace(name: string, namespace: string): Promise<void> {
    const response = await this.request<null>(
      `/workspace/hibernate?name=${encodeURIComponent(name)}&namespace=${encodeURIComponent(namespace)}`,
      {
        method: 'POST',
      }
    );

    if (response.error) {
      throw new Error(response.error.data);
    }
  }

  async wakeWorkspace(name: string, namespace: string): Promise<void> {
    const response = await this.request<null>(
      `/workspace/wake?name=${encodeURIComponent(name)}&namespace=${encodeURIComponent(namespace)}`,
      {
        method: 'POST',
      }
    );

    if (response.error) {
      throw new Error(response.error.data);
    }
  }

  // Module API methods
  async listModules(params: ListModulesRequest = {}): Promise<Module[]> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.continueToken) queryParams.append('continueToken', params.continueToken);
    if (params.workspace) queryParams.append('workspace', params.workspace);
    if (params.namespace) queryParams.append('namespace', params.namespace);

    const queryString = queryParams.toString();
    const url = queryString ? `/module/list?${queryString}` : '/module/list';

    const response = await this.request<ModuleListResponse>(url, {
      method: 'GET',
    });

    if (response.error) {
      throw new Error(response.error.data);
    }

    return response.success?.data.modules || [];
  }

  async createModule(module: CreateModuleRequest): Promise<Module> {
    const response = await this.request<Module>('/module/', {
      method: 'POST',
      body: JSON.stringify(module),
    });

    if (response.error) {
      throw new Error(response.error.data);
    }

    return response.success!.data;
  }

  async updateModule(params: UpdateModuleRequest): Promise<Module> {
    const response = await this.request<Module>('/module/', {
      method: 'PATCH',
      body: JSON.stringify(params),
    });

    if (response.error) {
      throw new Error(response.error.data);
    }

    return response.success!.data;
  }

  async deleteModule(params: DeleteModuleRequest): Promise<void> {
    const response = await this.request<void>('/module/', {
      method: 'DELETE',
      body: JSON.stringify(params),
    });

    if (response.error) {
      throw new Error(response.error.data);
    }
  }
}

export const apiService = new ApiService();