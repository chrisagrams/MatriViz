# Resource Format

A given organ data needs the following files inside the "resources" directory:

- .parquet file
    - This file contains the umap coordinates and gene scores for each row. "umap_1", "umap_2",and "index" are required columns. Gene scores are added as a column labeled by gene name.

- centroid .parquet file
    - This file containes the labels and coordinates for the centroid labels. Required columns are "cen_x", "cen_y", "Type".

- .json file
    - This file contains all of the metadata for a category. Ex: 
    ``` json
    {
    "fileType": "matriviz",
    "version": "0.0.1",
    "category_name": "kidney",
    "category_description": "Kidney",
    "parquet_file": "enge_modified_nocomp.parquet",
    "category_file": "enge_modified_category.json",
    "centroid_file": "kidney_centroid_v1.parquet"
    }
    ```
    Required fields are "fileType", "version", "category_name", "category_description", "parquet_file", "category_file", "centroid_file". All of the _file fields are relative to the directory the .json is located in.

> *Note:* Parquet files must be version 1. In Python, you can export the parquet with the following line: `
    pq.write_table(table, "test.parquet",  version='1.0', use_dictionary=True, compression='snappy', flavor='v1')
`


Example directory:

```
MatriSEQ-Electron
└───resources
   │   enge_modified_nocomp.parquet
   |   kidney_centroid_v1.parquet
   |   enge_modified_category.json

```