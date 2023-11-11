import { readFileSync } from 'fs'
import { Table, tableFromIPC } from 'apache-arrow'

let globalTable: Table | null = null

export const loadFeatherFile = async (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const arrowBuffer = readFileSync(filePath)
      globalTable = tableFromIPC(arrowBuffer)
      resolve()
    } catch (error) {
      console.error('Error reading Feather file:', error)
      reject(error)
    }
  })
}

export const queryGlobalTable = (query?: { select?: string[] }): Table | null => {
  if (!globalTable) {
    console.error('No table loaded')
    return null
  }

  if (query?.select) {
    return Table.prototype.select.apply(globalTable, [query.select])
  }

  return globalTable
}

export const tableToJson = (table: Table): any[] => {
  const json = []
  for (let i = 0; i < table.numRows; i++) {
    const row = table.get(i)
    json.push(rowToObject(row))
  }
  return json
}

const rowToObject = (row: any): any => {
  const obj: any = {}
  for (const [key, value] of Object.entries(row)) {
    obj[key] = value
  }
  return obj
}
