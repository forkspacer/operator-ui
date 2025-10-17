import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { repositoryService, ModuleRepository } from '../services/repositoryService';
import './RepositoryManager.css';

interface RepositoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const RepositoryManager: React.FC<RepositoryManagerProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [repos, setRepos] = useState<ModuleRepository[]>([]);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRepositories();
    }
  }, [isOpen]);

  const loadRepositories = () => {
    setRepos(repositoryService.getRepositories());
  };

  const handleAddRepo = () => {
    setError(null);
    setSuccess(null);

    if (!newRepoName.trim()) {
      setError('Repository name is required');
      return;
    }

    if (!newRepoUrl.trim()) {
      setError('Repository URL is required');
      return;
    }

    try {
      repositoryService.addRepository(newRepoName.trim(), newRepoUrl.trim());
      setNewRepoName('');
      setNewRepoUrl('');
      setSuccess(`Repository "${newRepoName}" added successfully`);
      loadRepositories();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add repository');
    }
  };

  const handleRemoveRepo = (url: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove repository "${name}"?`)) {
      repositoryService.removeRepository(url);
      setSuccess(`Repository "${name}" removed`);
      loadRepositories();
      onUpdate();
    }
  };

  const handleToggleRepo = (url: string, enabled: boolean) => {
    repositoryService.toggleRepository(url, enabled);
    loadRepositories();
    onUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal repo-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Module Repositories</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {error && (
          <div className="repo-message repo-error">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="repo-message repo-success">
            <FiCheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="repo-add-section">
          <h3>Add Repository</h3>
          <p className="repo-help-text">
            Add a remote git repository containing a module catalog (index.json)
          </p>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., my-custom-modules"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://raw.githubusercontent.com/user/repo/main/index.json"
              value={newRepoUrl}
              onChange={(e) => setNewRepoUrl(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleAddRepo}>
            <FiPlus size={16} />
            Add Repository
          </button>
        </div>

        <div className="repo-list-section">
          <h3>Repositories ({repos.length})</h3>

          {repos.length === 0 ? (
            <div className="repo-empty">No repositories configured</div>
          ) : (
            <div className="repo-list">
              {repos.map((repo) => (
                <div key={repo.url} className="repo-item">
                  <div className="repo-item-header">
                    <div className="repo-item-info">
                      <input
                        type="checkbox"
                        checked={repo.enabled}
                        onChange={(e) => handleToggleRepo(repo.url, e.target.checked)}
                        className="repo-checkbox"
                      />
                      <div className="repo-item-details">
                        <h4 className="repo-item-name">{repo.name}</h4>
                        <p className="repo-item-url">{repo.url}</p>
                        {repo.lastSync && (
                          <p className="repo-item-sync">
                            Last synced: {new Date(repo.lastSync).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="repo-remove-btn"
                      onClick={() => handleRemoveRepo(repo.url, repo.name)}
                      title="Remove repository"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
