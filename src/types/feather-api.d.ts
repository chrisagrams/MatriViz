declare global {
  interface Window {
    feather: {
      loadFeatherFile: (filePath: string) => void
      queryGlobalTable: (query?: { select?: string[] }) => Table | null
    }
  }
}

export {}
