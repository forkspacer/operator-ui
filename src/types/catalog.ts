// Module catalog types for browsing available modules
export interface CatalogModule {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
  tags: string[];
  maintainers: Maintainer[];
  source: string;
  versions: ModuleVersion[];
}

export interface Maintainer {
  name: string;
  email: string;
}

export interface ModuleVersion {
  version: string;
  url: string;
  created: string;
  appVersion: string;
  description: string;
  readme?: string;
  dependencies: string[];
  minOperatorVersion: string;
  maxOperatorVersion: string;
}

export interface Category {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
}

export interface ModuleCatalog {
  apiVersion: string;
  generated: string;
  modules: CatalogModule[];
  categories: Category[];
}
