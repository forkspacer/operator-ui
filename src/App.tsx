import React, { useState } from 'react';
import './App.css';
import { WorkspaceList } from './components/WorkspaceList';
import { ModuleCatalog } from './components/ModuleCatalog';

type Tab = 'workspaces' | 'catalog';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('workspaces');

  return (
    <div className="app-container">
      <div className="app-tabs">
        <button
          className={`app-tab ${activeTab === 'workspaces' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspaces')}
        >
          Workspaces
        </button>
        <button
          className={`app-tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          Module Catalog
        </button>
      </div>

      <div className="app-content">
        {activeTab === 'workspaces' && <WorkspaceList />}
        {activeTab === 'catalog' && <ModuleCatalog />}
      </div>
    </div>
  );
}

export default App;