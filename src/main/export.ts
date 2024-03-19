import {writeFileSync} from 'fs';
import { queryParquetFileByIndex } from './parquet';

export const writeToCSV = async (result: any[], selectedGenes: string[], parquetFile: string, filePath:string): Promise<void> => {
    try {
        const indices = result.map(item => item.index);
        
        const queryResult = await queryParquetFileByIndex(parquetFile, [...selectedGenes, 'umap_1', 'umap_2', 'index'], indices);
        
       for (const item of queryResult) {
        let totalScore = 0;
        for (const gene of selectedGenes) {
            totalScore += parseFloat(item[gene]) || 0; // Ensure gene value exists, add 0 if it doesn't
        }
        item.total_score = totalScore;
        }

        queryResult.sort((a, b) => b.total_score - a.total_score); 

        // Define the desired order of columns
        const columnsOrder = ['index', 'total_score', 'umap_1', 'umap_2', ...selectedGenes];

        // Convert queryResult to CSV format with desired column order
        const header = columnsOrder.join(',') + '\n';
        const rows = queryResult.map(obj => columnsOrder.map(key => obj[key]).join(',')).join('\n');
        const csvContent = header + rows;

        // Write CSV content to file
        writeFileSync(filePath, csvContent);

        console.log(`CSV file written successfully at ${filePath}.`);
        
    } catch (error) {
        console.error('Error writing to CSV:', error);
    }
}