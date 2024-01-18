declare global {
  interface Window {
    feather: {
      loadFeatherFile: (filePath: string) => Promise<void>
      queryGlobalTable: (query?: { select?: string[] }) => Table | null
    }
    parquet: {
      queryParquetFile: (filePath: string, query: string[] = []) => Promise<any[]>
    }
  }
}

export {}
