import React, { useState, useEffect } from 'react';
import { CatalogModule, ModuleCatalog as ModuleCatalogType } from '../types/catalog';
import { ModuleCatalogCard } from './ModuleCatalogCard';
import { repositoryService } from '../services/repositoryService';
import { RepositoryManager } from './RepositoryManager';
import { Toast } from './Toast';
import { FiSettings, FiRefreshCw } from 'react-icons/fi';
import './ModuleCatalog.css';

export const ModuleCatalog: React.FC = () => {
  const [catalog, setCatalog] = useState<ModuleCatalogType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showRepoManager, setShowRepoManager] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repositoryService.fetchCombinedCatalog();
      setCatalog(data);

      // Show a friendly message if no repos are configured
      if (data.modules.length === 0 && repositoryService.getRepositories().length === 0) {
        console.log('No repositories configured');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load module catalog';
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = (module: CatalogModule) => {
    // TODO: Implement module installation flow
    setToast({
      message: `Installing ${module.displayName}... (functionality coming soon)`,
      type: 'success'
    });
  };

  const filteredModules = catalog?.modules.filter((module) => {
    const matchesSearch =
      searchTerm === '' ||
      module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="module-catalog-container">
        <div className="module-catalog-loading">Loading module catalog...</div>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="module-catalog-container">
        <RepositoryManager
          isOpen={showRepoManager}
          onClose={() => setShowRepoManager(false)}
          onUpdate={loadCatalog}
        />

        <div className="module-catalog-error">
          <h3>Failed to load module catalog</h3>
          <p>{error || 'Unknown error'}</p>
          <div className="module-catalog-error-actions">
            <button onClick={loadCatalog} className="btn btn-primary">
              <FiRefreshCw size={16} />
              Retry
            </button>
            <button onClick={() => setShowRepoManager(true)} className="btn btn-secondary">
              <FiSettings size={16} />
              Manage Repositories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-catalog-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}

      <RepositoryManager
        isOpen={showRepoManager}
        onClose={() => setShowRepoManager(false)}
        onUpdate={loadCatalog}
      />

      <div className="module-catalog-header">
        <div className="module-catalog-title-section">
          <h1>Module Catalog</h1>
          <p className="module-catalog-subtitle">
            Browse and install modules from configured repositories
          </p>
        </div>
        <div className="module-catalog-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadCatalog}
            disabled={loading}
            title="Refresh catalog"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRepoManager(true)}
            title="Manage repositories"
          >
            <FiSettings size={16} />
            Repositories
          </button>
        </div>
      </div>

      <div className="module-catalog-filters">
        <input
          type="text"
          placeholder="Search modules..."
          className="module-catalog-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="module-catalog-categories">
          <button
            className={`module-catalog-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {catalog.categories.map((category) => (
            <button
              key={category.name}
              className={`module-catalog-category-btn ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.displayName}
            </button>
          ))}
        </div>
      </div>

      {catalog.modules.length > 0 && (
        <div className="module-catalog-stats">
          Showing {filteredModules.length} of {catalog.modules.length} modules
        </div>
      )}

      {catalog.modules.length === 0 ? (
        <div className="module-catalog-empty">
          <h3>No repositories configured</h3>
          <p>Click the "Repositories" button above to add a module repository</p>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="module-catalog-empty">
          <h3>No modules found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="module-catalog-grid">
          {filteredModules.map((module) => (
            <ModuleCatalogCard
              key={module.name}
              module={module}
              onInstall={handleInstall}
            />
          ))}
        </div>
      )}
    </div>
  );
};
