import { readdir, readFile } from 'fs/promises';
import { ResourceFile } from '../types/types';

export const getResourceList = async (dirPath: string) => {
    const files = await readdir(dirPath);
    const res: Array<ResourceFile> = [];
    for (const file of files) {
        if (file.endsWith(".json")) {
            try {
                const data = await readFile(dirPath + '/' + file, "utf8");
                const json = JSON.parse(data);
                if (json['fileType'] === "matriviz") {
                    console.log(json as ResourceFile);
                    res.push(json as ResourceFile);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
    return res;
}

export const getCategories = async (path: string) => {
    const file = await readFile(path, "utf8");
    const json = JSON.parse(file);
    return json;
}