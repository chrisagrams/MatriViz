import parquet from 'parquetjs-lite'

export const queryParquetFile = (filePath: string, query: string[] = [], limit: number = 20000): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const reader = await parquet.ParquetReader.openFile(filePath)
      const cursor = reader.getCursor(query)
      const json = []
      let record = null
      let count = 0

      while ((record = await cursor.next())) {
        json.push(record)
        count++
        if (count >= limit) break; // Break the loop once the limit is reached
      }

      resolve(json)
    } catch (error) {
      reject(error)
    }
  })
}

export const queryParquetFileByIndex = async (filePath: string, query: string[] = [], indices: string[]): Promise<any[]> => {
  try {
      const reader = await parquet.ParquetReader.openFile(filePath);
      const cursor = reader.getCursor(query);

      const json = [];
      let record = null;

      while ((record = await cursor.next())) {
          if (indices.includes(record.index.toString())) {
              json.push(record);
          }
      }

      return json;
  } catch (error) {
      throw new Error(`Error querying Parquet file: ${error}`);
  }
}

export const getAllColumns = (filePath: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const reader = await parquet.ParquetReader.openFile(filePath)
      const schema = reader.getSchema()
      const columns = schema.fieldList.map((field) => field.name)
      resolve(columns)
    } catch (error) {
      reject(error)
    }
  })
}
