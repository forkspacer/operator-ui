import { ModuleCatalog, CatalogModule } from '../types/catalog';

export interface ModuleRepository {
  name: string;
  url: string;
  enabled: boolean;
  lastSync?: string;
}

const STORAGE_KEY = 'forkspacer_module_repos';
const DEFAULT_REPO_URL = 'https://raw.githubusercontent.com/forkspacer/modules/main/index.json';

class RepositoryService {
  private repos: ModuleRepository[] = [];

  constructor() {
    this.loadRepositories();
  }

  /**
   * Load repositories from localStorage and environment variables
   */
  private loadRepositories() {
    // Start with empty array
    this.repos = [];

    // 1. Load from environment variable (for container deployments)
    const envRepos = process.env.MODULES_REPO;
    if (envRepos) {
      try {
        const parsed = JSON.parse(envRepos) as ModuleRepository[];
        this.repos.push(...parsed);
        console.log('Loaded repos from env variable:', parsed.length);
      } catch (error) {
        console.error('Failed to parse MODULES_REPO:', error);
      }
    }

    // 2. Load from localStorage (user-added repos)
    let hasStorageKey = false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        hasStorageKey = true;
        const parsed = JSON.parse(stored) as ModuleRepository[];
        // Merge with env repos, avoiding duplicates by URL
        const envUrls = new Set(this.repos.map(r => r.url));
        const newRepos = parsed.filter(r => !envUrls.has(r.url));
        this.repos.push(...newRepos);
        console.log('Loaded repos from localStorage:', newRepos.length);
      }
    } catch (error) {
      console.error('Failed to load repos from localStorage:', error);
    }

    // 3. If no repos found, add default repo (only on first load, not after user removes all)
    const hasLoadedBefore = hasStorageKey || envRepos !== null;
    if (this.repos.length === 0 && !hasLoadedBefore) {
      console.log('First load, adding default repository');
      this.repos.push({
        name: 'forkspacer-official',
        url: DEFAULT_REPO_URL,
        enabled: true,
      });
      this.saveToLocalStorage();
    }
  }

  /**
   * Save user-added repos to localStorage (not env repos)
   */
  private saveToLocalStorage() {
    try {
      // Only save repos that are not from env variable
      const envRepos = process.env.MODULES_REPO;
      let envUrls = new Set<string>();

      if (envRepos) {
        try {
          const parsed = JSON.parse(envRepos) as ModuleRepository[];
          envUrls = new Set(parsed.map(r => r.url));
        } catch (error) {
          // Ignore parse errors
        }
      }

      const toSave = this.repos.filter(r => !envUrls.has(r.url));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save repos to localStorage:', error);
    }
  }

  /**
   * Get all repositories
   */
  getRepositories(): ModuleRepository[] {
    return [...this.repos];
  }

  /**
   * Add a new repository
   */
  addRepository(name: string, url: string): void {
    // Check if URL already exists
    if (this.repos.some(r => r.url === url)) {
      throw new Error('Repository URL already exists');
    }

    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Repository URL must start with http:// or https://');
    }

    this.repos.push({
      name,
      url,
      enabled: true,
      lastSync: new Date().toISOString(),
    });

    this.saveToLocalStorage();
  }

  /**
   * Remove a repository
   */
  removeRepository(url: string): void {
    this.repos = this.repos.filter(r => r.url !== url);
    this.saveToLocalStorage();
  }

  /**
   * Enable/disable a repository
   */
  toggleRepository(url: string, enabled: boolean): void {
    const repo = this.repos.find(r => r.url === url);
    if (repo) {
      repo.enabled = enabled;
      this.saveToLocalStorage();
    }
  }

  /**
   * Fetch and merge catalogs from all enabled repositories
   */
  async fetchCombinedCatalog(): Promise<ModuleCatalog> {
    const enabledRepos = this.repos.filter(r => r.enabled);

    if (enabledRepos.length === 0) {
      // Return empty catalog instead of throwing error
      console.log('No enabled repositories, returning empty catalog');
      return {
        apiVersion: 'v1',
        generated: new Date().toISOString(),
        modules: [],
        categories: [],
      };
    }

    console.log('Fetching catalogs from', enabledRepos.length, 'repositories');

    // Fetch all catalogs in parallel
    const results = await Promise.allSettled(
      enabledRepos.map(async (repo) => {
        try {
          const response = await fetch(repo.url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const catalog = await response.json() as ModuleCatalog;

          // Add repository info to each module
          catalog.modules = catalog.modules.map(module => ({
            ...module,
            source: repo.url,
          }));

          return { repo, catalog };
        } catch (error) {
          console.error(`Failed to fetch catalog from ${repo.name}:`, error);
          throw error;
        }
      })
    );

    // Collect successful catalogs
    const successfulCatalogs: { repo: ModuleRepository; catalog: ModuleCatalog }[] = [];
    const failedRepos: { repo: ModuleRepository; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulCatalogs.push(result.value);
      } else {
        failedRepos.push({
          repo: enabledRepos[index],
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    if (successfulCatalogs.length === 0) {
      throw new Error('Failed to fetch any catalogs. Check repository URLs.');
    }

    // Log failed repos
    if (failedRepos.length > 0) {
      console.warn('Failed to fetch catalogs from:', failedRepos);
    }

    // Merge all catalogs
    const mergedModules: CatalogModule[] = [];
    const mergedCategories = new Map<string, any>();

    successfulCatalogs.forEach(({ catalog }) => {
      // Merge modules (avoid duplicates by name)
      catalog.modules.forEach(module => {
        const existing = mergedModules.find(m => m.name === module.name);
        if (!existing) {
          mergedModules.push(module);
        } else {
          console.warn(`Duplicate module "${module.name}" found, keeping first occurrence`);
        }
      });

      // Merge categories
      catalog.categories?.forEach(category => {
        if (!mergedCategories.has(category.name)) {
          mergedCategories.set(category.name, category);
        }
      });
    });

    // Update lastSync for successful repos
    successfulCatalogs.forEach(({ repo }) => {
      const r = this.repos.find(r => r.url === repo.url);
      if (r) {
        r.lastSync = new Date().toISOString();
      }
    });
    this.saveToLocalStorage();

    return {
      apiVersion: 'v1',
      generated: new Date().toISOString(),
      modules: mergedModules,
      categories: Array.from(mergedCategories.values()),
    };
  }
}

export const repositoryService = new RepositoryService();
