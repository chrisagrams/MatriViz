import {writeFileSync} from 'fs';

export const writeToCSV = async (result: [], filePath:string): Promise<void> => {
    const csvData = result.map(({ index, score, x, y}) => ({ index, score, x, y}));

    const header = Object.keys(csvData[0]).join(',') + '\n';
    const rows = csvData.map(obj => Object.values(obj).join(',')).join('\n');

    const csvContent = header + rows;

    writeFileSync(filePath, csvContent);
}