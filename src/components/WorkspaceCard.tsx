import React, { useState } from 'react';
import { FiTrash2, FiBox, FiLayers, FiEye, FiPlay, FiPause } from 'react-icons/fi';
import { Workspace } from '../types/workspace';
import { Module } from '../types/module';
import { CustomCheckbox } from './CustomCheckbox';

interface WorkspaceCardProps {
  workspace: Workspace;
  modules?: Module[];
  onDelete: (name: string, namespace: string) => void;
  onToggleHibernation?: (name: string, namespace: string, hibernated: boolean) => void;
  onViewDetails?: (workspace: Workspace) => void;
  onModuleToggle?: (name: string, namespace: string, hibernated: boolean) => void;
  onModuleDelete?: (name: string, namespace: string) => void;
  isSelected?: boolean;
  onSelectionChange?: (workspace: Workspace, selected: boolean) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  modules = [],
  onDelete,
  onToggleHibernation,
  onViewDetails,
  onModuleToggle,
  onModuleDelete,
  isSelected = false,
  onSelectionChange
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete workspace "${workspace.name}"?`)) {
      onDelete(workspace.name, workspace.namespace);
    }
  };

  const handleToggleHibernation = async () => {
    if (!onToggleHibernation) return;
    setIsLoading(true);
    try {
      await onToggleHibernation(workspace.name, workspace.namespace, !workspace.hibernated);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`workspace-container ${isSelected ? 'selected' : ''}`}>
      <div className="workspace-header">
        <div className="workspace-title-section">
          {onSelectionChange && (
            <CustomCheckbox
              id={`workspace-${workspace.namespace}-${workspace.name}`}
              checked={isSelected}
              onChange={(checked) => onSelectionChange(workspace, checked)}
              label=""
            />
          )}
          <div className="workspace-title-content">
            <div className="workspace-info-row">
              <span className="workspace-name">{workspace.name}</span>
              <span className={`workspace-status-badge status-${workspace.phase}`}>
                {workspace.phase}
              </span>
              <span className="workspace-type-badge">{workspace.type}</span>
              <span className="workspace-namespace">namespace: <span className="namespace-value">{workspace.namespace}</span></span>
              {workspace.message && (
                <span className="workspace-detail">{workspace.message}</span>
              )}
            </div>
          </div>
        </div>
        <div className="workspace-actions">
          {onToggleHibernation && (
            <button
              className={`btn btn-sm ${workspace.hibernated ? 'btn-secondary' : 'btn-secondary'}`}
              onClick={handleToggleHibernation}
              disabled={isLoading}
              title={workspace.hibernated ? 'Wake up workspace' : 'Hibernate workspace'}
            >
              {isLoading ? 'Processing' : workspace.hibernated ? 'Wake' : 'Hibernate'}
            </button>
          )}
          {onViewDetails && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDetails(workspace)}
              title="Details"
            >
              Details
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            title="Delete workspace"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {modules.length > 0 && (
        <div className="workspace-modules">
          <div className="modules-header">
            <FiLayers className="modules-icon" />
            <span className="modules-title">Modules ({modules.length})</span>
          </div>
          <div className="modules-grid">
            {modules.map(module => (
              <div key={`${module.namespace}-${module.name}`} className="module-card">
                <div className="module-main">
                  <div className="module-icon-wrapper">
                    <FiBox size={24} />
                  </div>
                  <div className="module-details">
                    <div className="module-name">{module.name}</div>
                    <div className="module-type">{module.type}</div>
                  </div>
                </div>
                <div className="module-status-actions">
                  <span className={`module-status-dot status-${module.phase}`}></span>
                  <div className="module-actions">
                    {onViewDetails && (
                      <button
                        className="module-action-btn"
                        title="Open module"
                      >
                        <FiEye size={14} />
                      </button>
                    )}
                    {onModuleToggle && (
                      <button
                        className="module-action-btn"
                        onClick={() => onModuleToggle(module.name, module.namespace, !module.hibernated)}
                        title={module.hibernated ? 'Wake up module' : 'Hibernate module'}
                      >
                        {module.hibernated ? <FiPlay size={14} /> : <FiPause size={14} />}
                      </button>
                    )}
                    {onModuleDelete && (
                      <button
                        className="module-action-btn module-delete-btn"
                        onClick={() => onModuleDelete(module.name, module.namespace)}
                        title="Delete module"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};