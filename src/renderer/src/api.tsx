export const exportCSV = (selectedData, selectedGenes, resourcesDir, currentResource) => {
    window.export.exportCSV(selectedData,
        selectedGenes,
        resourcesDir + currentResource?.parquet_file)
}