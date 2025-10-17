import React from 'react';
import { CatalogModule } from '../types/catalog';
import './ModuleCatalogCard.css';

interface ModuleCatalogCardProps {
  module: CatalogModule;
  onInstall: (module: CatalogModule) => void;
}

export const ModuleCatalogCard: React.FC<ModuleCatalogCardProps> = ({ module, onInstall }) => {
  const latestVersion = module.versions[0]; // Assuming sorted, first is latest

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      cache: '#FF6B6B',
      database: '#4ECDC4',
      messaging: '#95E1D3',
      storage: '#F38181',
      monitoring: '#AA96DA'
    };
    return colors[category] || '#6C757D';
  };

  return (
    <div className="module-catalog-card">
      <div className="module-catalog-card-header">
        {module.icon ? (
          <img
            src={module.icon}
            alt={module.displayName}
            className="module-catalog-icon"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="module-catalog-icon-placeholder">
            {module.displayName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="module-catalog-header-info">
          <h3 className="module-catalog-title">{module.displayName}</h3>
          <span
            className="module-catalog-category"
            style={{ backgroundColor: getCategoryColor(module.category) }}
          >
            {module.category}
          </span>
        </div>
      </div>

      <p className="module-catalog-description">{module.description}</p>

      <div className="module-catalog-tags">
        {module.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="module-catalog-tag">
            {tag}
          </span>
        ))}
        {module.tags.length > 3 && (
          <span className="module-catalog-tag-more">+{module.tags.length - 3}</span>
        )}
      </div>

      <div className="module-catalog-footer">
        <div className="module-catalog-version">
          <span className="module-catalog-version-label">Latest:</span>
          <span className="module-catalog-version-value">
            v{latestVersion.version} ({latestVersion.appVersion})
          </span>
        </div>
        <button
          className="module-catalog-install-btn"
          onClick={() => onInstall(module)}
        >
          Install
        </button>
      </div>
    </div>
  );
};
