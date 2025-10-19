import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { CreateWorkspaceRequest, Workspace } from '../types/workspace';
import { CustomCheckbox } from './CustomCheckbox';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workspace: CreateWorkspaceRequest) => Promise<void>;
  existingWorkspaces: Workspace[];
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingWorkspaces,
}) => {
  const [formData, setFormData] = useState<CreateWorkspaceRequest>({
    name: '',
    namespace: '',
    type: 'kubernetes',
    connection: {
      type: 'in-cluster',
    },
    hibernated: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createFromExisting, setCreateFromExisting] = useState(false);
  const [selectedExistingWorkspace, setSelectedExistingWorkspace] = useState<string>('');

  const handleExistingWorkspaceSelect = (workspaceKey: string) => {
    setSelectedExistingWorkspace(workspaceKey);

    if (workspaceKey) {
      const [namespace, name] = workspaceKey.split('/');
      const selectedWorkspace = existingWorkspaces.find(w =>
        w.namespace === namespace && w.name === name
      );

      if (selectedWorkspace) {
        setFormData(prev => ({
          ...prev,
          namespace: selectedWorkspace.namespace,
          // Inherit connection type (assuming in-cluster for now since we don't have connection info in workspace list)
          connection: { type: 'in-cluster' },
        }));
      }
    }
  };

  const handleCreateFromExistingToggle = (enabled: boolean) => {
    setCreateFromExisting(enabled);
    if (!enabled) {
      setSelectedExistingWorkspace('');
      // Reset form to defaults when disabling
      setFormData({
        name: '',
        namespace: '',
        type: 'kubernetes',
        connection: { type: 'in-cluster' },
        hibernated: false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the final request object
      const requestData: CreateWorkspaceRequest = {
        name: formData.name,
        connection: formData.connection,
        hibernated: formData.hibernated,
      };

      // Only include namespace if it's not empty
      if (formData.namespace && formData.namespace.trim()) {
        requestData.namespace = formData.namespace.trim();
      }

      // Include workspace type
      if (formData.type) {
        requestData.type = formData.type;
      }

      // Include namespace prefix if provided
      if (formData.namespacePrefix && formData.namespacePrefix.trim()) {
        requestData.namespacePrefix = formData.namespacePrefix.trim();
        // Only include createNamespace if namespacePrefix is set
        if (formData.createNamespace !== undefined) {
          requestData.createNamespace = formData.createNamespace;
        }
      }

      // Add 'from' field if creating from existing workspace
      if (createFromExisting && selectedExistingWorkspace) {
        const [namespace, name] = selectedExistingWorkspace.split('/');
        requestData.from = {
          name,
          namespace,
        };
      }

      await onSubmit(requestData);

      // Reset form and close modal on success
      setFormData({
        name: '',
        namespace: '',
        type: 'kubernetes',
        connection: { type: 'in-cluster' },
        hibernated: false,
      });
      setCreateFromExisting(false);
      setSelectedExistingWorkspace('');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Workspace</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <CustomCheckbox
              id="createFromExisting"
              checked={createFromExisting}
              onChange={handleCreateFromExistingToggle}
              label="Create from existing workspace"
            />
          </div>

          {createFromExisting && (
            <div className="form-group">
              <label className="form-label">Select Existing Workspace *</label>
              <select
                className="form-select"
                value={selectedExistingWorkspace}
                onChange={(e) => handleExistingWorkspaceSelect(e.target.value)}
                required={createFromExisting}
              >
                <option value="">Choose a workspace...</option>
                {existingWorkspaces.map((workspace) => (
                  <option
                    key={`${workspace.namespace}/${workspace.name}`}
                    value={`${workspace.namespace}/${workspace.name}`}
                  >
                    {workspace.name} ({workspace.namespace})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Workspace Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., dev-workspace"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Namespace {createFromExisting && selectedExistingWorkspace && '(inherited)'}
            </label>
            <input
              type="text"
              className={`form-input ${createFromExisting && selectedExistingWorkspace ? 'form-input-disabled' : ''}`}
              placeholder="default (leave empty to use default)"
              value={formData.namespace}
              onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
              disabled={createFromExisting && !!selectedExistingWorkspace}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Workspace Type
            </label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData,
                type: e.target.value as 'kubernetes' | 'managed'
              })}
            >
              <option value="kubernetes">Kubernetes (Connect to existing cluster)</option>
              <option value="managed">Managed (vCluster - isolated virtual cluster)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Connection Type {createFromExisting && selectedExistingWorkspace && '(inherited)'}
            </label>
            <select
              className={`form-select ${createFromExisting && selectedExistingWorkspace ? 'form-input-disabled' : ''}`}
              value={formData.connection.type}
              onChange={(e) => setFormData({
                ...formData,
                connection: { type: e.target.value as 'in-cluster' | 'kubeconfig' }
              })}
              disabled={createFromExisting && !!selectedExistingWorkspace}
            >
              <option value="in-cluster">In-Cluster</option>
              <option value="kubeconfig">Kubeconfig</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Namespace Prefix</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., dev- (optional)"
              value={formData.namespacePrefix || ''}
              onChange={(e) => setFormData({ ...formData, namespacePrefix: e.target.value || undefined })}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Prefix for all module deployment namespaces. Example: "dev-" creates "dev-default", "dev-database"
            </small>
          </div>

          {formData.namespacePrefix && (
            <div className="form-group">
              <CustomCheckbox
                id="createNamespace"
                checked={formData.createNamespace || false}
                onChange={(checked) => setFormData({ ...formData, createNamespace: checked })}
                label="Auto-create prefixed namespaces"
              />
            </div>
          )}

          <div className="form-group">
            <CustomCheckbox
              id="hibernated"
              checked={formData.hibernated}
              onChange={(checked) => setFormData({ ...formData, hibernated: checked })}
              label="Start hibernated"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};