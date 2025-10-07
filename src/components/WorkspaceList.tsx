import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiRefreshCw, FiPlus, FiTrash2, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { Workspace, CreateWorkspaceRequest } from '../types/workspace';
import { apiService } from '../services/api';
import { WorkspaceCard } from './WorkspaceCard';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { WorkspaceDetailsModal } from './WorkspaceDetailsModal';
import { SearchAndFilter } from './SearchAndFilter';
import { Toast, useToast } from './Toast';
import { CustomCheckbox } from './CustomCheckbox';
import { Module } from '../types/module';

export const WorkspaceList: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [modulesByWorkspace, setModulesByWorkspace] = useState<Map<string, Module[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const hasLoadedRef = React.useRef(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState('');

  // Batch selection
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(new Set());

  const { toasts, showToast, hideToast } = useToast();

  // Helper function to provide user-friendly error messages
  const getFriendlyErrorMessage = (error: Error, workspaceName?: string): string => {
    const message = error.message.toLowerCase();

    // Common error patterns and their friendly messages
    if (message.includes('namespaces') && message.includes('not found')) {
      return 'The specified namespace does not exist. Please create the namespace first or use an existing one.';
    }

    if (message.includes('namespace') && (message.includes('not found') || message.includes('does not exist'))) {
      return 'The specified namespace does not exist. Please create the namespace first or use an existing one.';
    }

    if (message.includes('already exists') || message.includes('conflict') || message.includes('duplicate')) {
      return `Workspace "${workspaceName}" already exists. Please choose a different name.`;
    }

    if (message.includes('workspaces.batch.forkspacer.com') && message.includes('already exists')) {
      return `Workspace "${workspaceName}" already exists. Please choose a different name.`;
    }

    if (message.includes('409') && workspaceName) {
      return `Workspace "${workspaceName}" already exists. Please choose a different name.`;
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return 'You do not have permission to perform this action. Please check your access rights.';
    }

    if (message.includes('invalid') && message.includes('name')) {
      return 'Invalid workspace name. Names must be lowercase and contain only letters, numbers, and hyphens.';
    }

    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }

    if (message.includes('500') || message.includes('internal server error')) {
      return 'Server error occurred. Please try again later.';
    }

    if (message.includes('400') || message.includes('bad request')) {
      return 'Invalid request. Please check your input and try again.';
    }

    if (message.includes('404') || message.includes('not found')) {
      return 'Resource not found. Please verify the workspace details.';
    }

    // Return original message if no pattern matches
    return error.message;
  };

  const loadWorkspaces = useCallback(async (silent = false) => {
    try {
      if (!silent) setError(null);
      const workspacesData = await apiService.listWorkspaces();
      setWorkspaces(workspacesData);

      // Load all modules once
      const allModules = await apiService.listModules();

      // Group workspaces by namespace and only show modules under the first workspace in each namespace
      const modulesMap = new Map<string, Module[]>();
      const namespacesProcessed = new Set<string>();

      workspacesData.forEach((workspace) => {
        const workspaceKey = `${workspace.namespace}-${workspace.name}`;

        if (!namespacesProcessed.has(workspace.namespace)) {
          // This is the first workspace in this namespace, assign all modules from this namespace
          const namespaceModules = allModules.filter(module => module.namespace === workspace.namespace);
          modulesMap.set(workspaceKey, namespaceModules);
          namespacesProcessed.add(workspace.namespace);
        } else {
          // Not the first workspace in this namespace, no modules
          modulesMap.set(workspaceKey, []);
        }
      });

      setModulesByWorkspace(modulesMap);

      if (!silent) showToast('Workspaces and modules loaded successfully', 'success');
    } catch (error) {
      const friendlyMessage = error instanceof Error
        ? getFriendlyErrorMessage(error)
        : 'Failed to load workspaces';
      setError(friendlyMessage);
      if (!silent) showToast(friendlyMessage, 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadWorkspaces(true); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadWorkspaces]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkspaces();
    setRefreshing(false);
  };

  const handleCreateWorkspace = async (workspaceData: CreateWorkspaceRequest) => {
    try {
      await apiService.createWorkspace(workspaceData);
      await loadWorkspaces(true);
      showToast(`Workspace "${workspaceData.name}" created successfully`, 'success');
    } catch (error) {
      const friendlyMessage = error instanceof Error
        ? getFriendlyErrorMessage(error, workspaceData.name)
        : 'Failed to create workspace';
      showToast(friendlyMessage, 'error');
      throw error;
    }
  };

  const handleDeleteWorkspace = async (name: string, namespace: string) => {
    try {
      await apiService.deleteWorkspace({ name, namespace });
      await loadWorkspaces(true);
      showToast(`Workspace "${name}" deleted successfully`, 'success');
    } catch (error) {
      const friendlyMessage = error instanceof Error
        ? getFriendlyErrorMessage(error, name)
        : 'Failed to delete workspace';
      setError(friendlyMessage);
      showToast(friendlyMessage, 'error');
    }
  };

  const handleToggleHibernation = async (name: string, namespace: string, hibernated: boolean) => {
    try {
      showToast(`${hibernated ? 'Hibernating' : 'Waking up'} workspace "${name}"...`, 'info');

      // Use the PATCH endpoint to update hibernation status
      await apiService.updateWorkspace({ name, namespace, hibernated });

      // Refresh workspaces after a short delay to allow state to update
      setTimeout(() => loadWorkspaces(true), 1500);
      showToast(`Workspace "${name}" ${hibernated ? 'hibernated' : 'woken up'} successfully`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for CORS error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
        showToast('Hibernation feature requires API server CORS configuration update', 'error');
      } else {
        const friendlyMessage = error instanceof Error
          ? getFriendlyErrorMessage(error, name)
          : 'Failed to toggle hibernation';
        showToast(friendlyMessage, 'error');
      }
    }
  };

  const handleViewDetails = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowDetailsModal(true);
  };

  const handleModuleToggle = async (name: string, namespace: string, hibernated: boolean) => {
    try {
      showToast(`${hibernated ? 'Hibernating' : 'Waking up'} module "${name}"...`, 'info');
      await apiService.updateModule({ name, namespace, hibernated });
      await loadWorkspaces(true);
      showToast(`Module "${name}" ${hibernated ? 'hibernated' : 'woken up'} successfully`, 'success');
    } catch (error) {
      const friendlyMessage = error instanceof Error
        ? getFriendlyErrorMessage(error, name)
        : 'Failed to toggle module hibernation';
      showToast(friendlyMessage, 'error');
    }
  };

  const handleDeleteModule = async (name: string, namespace: string) => {
    try {
      await apiService.deleteModule({ name, namespace });
      await loadWorkspaces(true);
      showToast(`Module "${name}" deleted successfully`, 'success');
    } catch (error) {
      const friendlyMessage = error instanceof Error
        ? getFriendlyErrorMessage(error, name)
        : 'Failed to delete module';
      showToast(friendlyMessage, 'error');
    }
  };

  const handleWorkspaceSelection = (workspace: Workspace, selected: boolean) => {
    const key = `${workspace.namespace}-${workspace.name}`;
    const newSelection = new Set(selectedWorkspaces);

    if (selected) {
      newSelection.add(key);
    } else {
      newSelection.delete(key);
    }

    setSelectedWorkspaces(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedWorkspaces.size === filteredWorkspaces.length) {
      setSelectedWorkspaces(new Set());
    } else {
      const allKeys = filteredWorkspaces.map(w => `${w.namespace}-${w.name}`);
      setSelectedWorkspaces(new Set(allKeys));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedWorkspaces.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedWorkspaces.size} workspace(s)?`)) {
      return;
    }

    for (const key of Array.from(selectedWorkspaces)) {
      const [namespace, name] = key.split('-');
      try {
        await apiService.deleteWorkspace({ name, namespace });
      } catch (error) {
        const friendlyMessage = error instanceof Error
          ? getFriendlyErrorMessage(error, name)
          : `Failed to delete ${name}`;
        showToast(friendlyMessage, 'error');
      }
    }

    setSelectedWorkspaces(new Set());
    await loadWorkspaces(true);
    showToast(`Deleted ${selectedWorkspaces.size} workspace(s)`, 'success');
  };

  // Filtered workspaces based on search and filters
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter(workspace => {
      const matchesSearch = workspace.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || workspace.phase.toLowerCase() === statusFilter.toLowerCase();
      const matchesNamespace = !namespaceFilter || workspace.namespace === namespaceFilter;

      return matchesSearch && matchesStatus && matchesNamespace;
    });
  }, [workspaces, searchTerm, statusFilter, namespaceFilter]);

  // Available namespaces for filter
  const availableNamespaces = useMemo(() => {
    const namespaces = Array.from(new Set(workspaces.map(w => w.namespace)));
    return namespaces.sort();
  }, [workspaces]);

  // Helper function to get modules for a specific workspace
  const getWorkspaceModules = (workspace: Workspace): Module[] => {
    const workspaceKey = `${workspace.namespace}-${workspace.name}`;
    const workspaceModules = modulesByWorkspace.get(workspaceKey) || [];
    console.log(`Workspace ${workspace.name} (${workspace.namespace}) has ${workspaceModules.length} modules:`, workspaceModules);
    return workspaceModules;
  };

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadWorkspaces();
    }
  }, [loadWorkspaces]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"><FiRefreshCw className="animate-spin" size={24} /></div>
        <p>Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-container">
            <img src="/favicon.svg" alt="Forkspacer" className="page-title-icon" />
            <h1 className="page-title">Forkspacer Workspaces</h1>
          </div>
          <p className="page-description">
            Manage your Kubernetes workspaces ({filteredWorkspaces.length} of {workspaces.length})
          </p>
        </div>
        <div className="header-actions">
          <div className="auto-refresh-toggle">
            <CustomCheckbox
              id="auto-refresh"
              checked={autoRefresh}
              onChange={setAutoRefresh}
              label="Auto-refresh"
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw size={16} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={16} />
            Create Workspace
          </button>
        </div>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        namespaceFilter={namespaceFilter}
        onNamespaceFilterChange={setNamespaceFilter}
        availableNamespaces={availableNamespaces}
      />

      {selectedWorkspaces.size > 0 && (
        <div className="batch-actions">
          <div className="batch-info">
            {selectedWorkspaces.size} workspace(s) selected
          </div>
          <div className="batch-buttons">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedWorkspaces(new Set())}
            >
              Clear Selection
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleBatchDelete}
            >
              <FiTrash2 size={14} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {filteredWorkspaces.length === 0 ? (
        <div className="empty-state">
          {workspaces.length === 0 ? (
            <>
              <h3>No workspaces found</h3>
              <p>Create your first workspace to get started</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
                style={{ marginTop: '16px' }}
              >
                <FiPlus size={16} />
            Create Workspace
              </button>
            </>
          ) : (
            <>
              <h3>No workspaces match your filters</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setNamespaceFilter('');
                }}
                style={{ marginTop: '16px' }}
              >
                <FiTrash2 size={14} /> Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="workspace-grid-header">
            <button
              className="btn btn-link btn-sm"
              onClick={handleSelectAll}
            >
              {selectedWorkspaces.size === filteredWorkspaces.length ? <FiCheckSquare size={16} /> : <FiSquare size={16} />} Select All
            </button>
          </div>
          <div className="workspace-list">
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={`${workspace.namespace}-${workspace.name}`}
                workspace={workspace}
                modules={getWorkspaceModules(workspace)}
                onDelete={handleDeleteWorkspace}
                onToggleHibernation={handleToggleHibernation}
                onViewDetails={handleViewDetails}
                onModuleToggle={handleModuleToggle}
                onModuleDelete={handleDeleteModule}
                isSelected={selectedWorkspaces.has(`${workspace.namespace}-${workspace.name}`)}
                onSelectionChange={handleWorkspaceSelection}
              />
            ))}
          </div>
        </>
      )}

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWorkspace}
        existingWorkspaces={workspaces}
      />

      <WorkspaceDetailsModal
        workspace={selectedWorkspace}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedWorkspace(null);
        }}
      />

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            duration={toast.type === 'error' ? 6000 : 3000}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};