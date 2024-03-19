/* Global definitions */

import { ResourceFile } from './types'

declare global {
  interface Window {
    feather: {
      loadFeatherFile: (filePath: string) => Promise<void>
      queryGlobalTable: (query?: { select?: string[] }) => Table | null
    }
    parquet: {
      queryParquetFile: (filePath: string, query: string[] = []) => Promise<any[]>
      getParquetColumns: (filePath: string) => Promise<string[]>
    }
    resources: {
      getResourceList: (dirPath: string) => Promise<ResourceFile[]>
      getResourceCategories: (path: string) => Promise<any>
      setResourceDir: () => Promise<string>
      getResourceDir: () => Promise<string>
    }
    export: {
      exportCSV: (result: {}, selectedGenes: string[], parquetFile: string) => Promise<void>;
    }
  }
}

export {}
