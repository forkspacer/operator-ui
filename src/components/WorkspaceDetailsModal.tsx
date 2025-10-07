import React from 'react';
import { FiX, FiPlay, FiPause, FiEdit, FiFileText, FiLink } from 'react-icons/fi';
import { Workspace } from '../types/workspace';

interface WorkspaceDetailsModalProps {
  workspace: Workspace | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceDetailsModal: React.FC<WorkspaceDetailsModalProps> = ({
  workspace,
  isOpen,
  onClose
}) => {
  if (!isOpen || !workspace) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Workspace Details</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>

        <div className="workspace-details">
          <div className="details-section">
            <h3>Basic Information</h3>
            <div className="details-list">
              <div className="detail-item">
                <strong>Name:</strong>
                <span>{workspace.name}</span>
              </div>
              <div className="detail-item">
                <strong>Namespace:</strong>
                <span>{workspace.namespace}</span>
              </div>
              <div className="detail-item">
                <strong>Type:</strong>
                <span className="workspace-type-badge">{workspace.type}</span>
              </div>
              <div className="detail-item">
                <strong>Phase:</strong>
                <span className={`workspace-status-badge status-${workspace.phase.toLowerCase()}`}>
                  {workspace.phase}
                </span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Status</h3>
            <div className="details-list">
              <div className="detail-item">
                <strong>Hibernated:</strong>
                <span className={`hibernation-status ${workspace.hibernated ? 'hibernated' : 'active'}`}>
                  {workspace.hibernated ? <><FiPause size={14} /> Yes</> : <><FiPlay size={14} /> No</>}
                </span>
              </div>
              <div className="detail-item">
                <strong>Message:</strong>
                <span className="workspace-message">
                  {workspace.message || 'No message'}
                </span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Actions</h3>
            <div className="workspace-actions-detailed">
              <button
                className={`btn ${workspace.hibernated ? 'btn-primary' : 'btn-warning'}`}
                title={workspace.hibernated ? 'Wake up workspace' : 'Hibernate workspace'}
              >
                {workspace.hibernated ? <><FiPlay size={14} /> Wake Up</> : <><FiPause size={14} /> Hibernate</>}
              </button>
              <button className="btn btn-secondary" title="Edit workspace">
                <FiEdit size={14} /> Edit
              </button>
              <button className="btn btn-info" title="View logs">
                <FiFileText size={14} /> Logs
              </button>
              <button className="btn btn-success" title="Connect">
                <FiLink size={14} /> Connect
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};