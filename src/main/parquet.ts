import parquet from 'parquetjs-lite';

export const queryParquetFile = (filePath: string, query: string[] = []): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const reader = await parquet.ParquetReader.openFile(filePath);
        const cursor = reader.getCursor(query);
        const json = [];
        let record = null;
        
        while (record = await cursor.next()) {
          json.push(record);
        }
        
        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  };

export const getAllColumns = (filePath: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const reader = await parquet.ParquetReader.openFile(filePath);
      const schema = reader.getSchema();
      const columns = schema.fieldList.map(field => field.name);
      resolve(columns);
    } catch (error) {
      reject(error);
    }
  });
}