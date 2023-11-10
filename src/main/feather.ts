import { readFileSync } from 'fs';
import { tableFromIPC } from 'apache-arrow';

const readFeather = (filePath: string): Promise<{}> => {
    return new Promise((resolve, reject) => {
        try {
            const arrowBuffer = readFileSync(filePath);
            const table = tableFromIPC(arrowBuffer);
            const array = table.toArray();
            resolve({});
        } catch (error) {
            console.error('Error reading Feather file:', error);
            reject(error);
        }
    });
};

export default readFeather;