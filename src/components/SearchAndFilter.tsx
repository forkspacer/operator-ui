import React from 'react';
import { FiSearch, FiX, FiTrash2 } from 'react-icons/fi';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  namespaceFilter: string;
  onNamespaceFilterChange: (value: string) => void;
  availableNamespaces: string[];
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  namespaceFilter,
  onNamespaceFilterChange,
  availableNamespaces
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-section">
        <div className="search-input-container">
          <span className="search-icon"><FiSearch size={16} /></span>
          <input
            type="text"
            className="search-input"
            placeholder="Search workspaces by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="hibernated">Hibernated</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Namespace:</label>
          <select
            className="filter-select"
            value={namespaceFilter}
            onChange={(e) => onNamespaceFilterChange(e.target.value)}
          >
            <option value="">All Namespaces</option>
            {availableNamespaces.map(namespace => (
              <option key={namespace} value={namespace}>
                {namespace}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            onSearchChange('');
            onStatusFilterChange('');
            onNamespaceFilterChange('');
          }}
          title="Clear all filters"
        >
          <FiTrash2 size={14} /> Clear Filters
        </button>
      </div>
    </div>
  );
};