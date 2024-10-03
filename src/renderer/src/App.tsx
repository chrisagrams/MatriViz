import { useState, useEffect } from 'react'
import { useToast } from '@renderer/components/ui/use-toast'

/* Components */
import Plot from './components/plot'
import GeneBadge from './components/badge'
import Row from './components/row'
import Loading from './components/loading'
import { ExportTasks } from './components/ExportTasks'

/* Styles */
import styles from './assets/app.module.css'

/* Types */
import { DataPoint, LabelPoint, PlotState } from './types'
import { ResourceFile } from '../../types/types'

/* shadcn/ui */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select"

const App = (): JSX.Element => {
  const defaultMinColor = '#ffff00'
  const defaultMaxColor = '#ff0000'

  const [resourcesDir, setResourcesDir] = useState<string>('./')
  const [resources, setResources] = useState<ResourceFile[]>([])
  const [currentResource, setCurrentResource] = useState<ResourceFile>()
  const [categories, setCategories] = useState({} as any)
  const [allGenes, setAllGenes] = useState([] as string[]) // Columns from parquet file

  const [data, setData] = useState<DataPoint[]>([])
  const [labels, setLabels] = useState<LabelPoint[]>([])

  const [loading, setLoading] = useState(true)
  const [minorLoading, setMinorLoading] = useState(false) // Use only for non-blocking loading

  const [selectedGenes, setSelectedGenes] = useState(["COL1A1"]);
  const [highlightedGene, setHighlightedGene] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAllGenes, setShowAllGenes] = useState(false)
  const [selectedData, setSelectedData] = useState<DataPoint[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  const [plotState, setPlotState] = useState<PlotState>({
    minScore: 0,
    maxScore: 10,
    autoMinScore: false,
    autoMaxScore: true,
    minColor: defaultMinColor,
    maxColor: defaultMaxColor,
    pointSize: 2,
    transformX: 0,
    transformY: 0,
    toggleLabels: true,
    toggleGridlines: true
  })

  const handleResourceDirectorySelection = () => {
    window.resources.setResourceDir().then(result => {
      setResourcesDir(result);
    });
  }

  const populateResources = () => {
    window.resources.getResourceList(resourcesDir).then((files) => {
      if(files.length == 0) // No files found.
      {
        setLoading(false);
        console.error("No files found!");
        populateResources(); // Note, this is recursive
      }
      setResources(files as ResourceFile[])
      if (currentResource === undefined && files.length > 0)
        // If no resource is selected, select the first one
        setCurrentResource(files[0])
    })
  }

  useEffect(() => {
    window.resources.getResourceDir()
    .then(dir => {
      setResourcesDir(dir)
    })
  }, []);

  useEffect(() => {
    populateResources()
  }, [resourcesDir])

  useEffect(() => {
    if (!currentResource) return
    window.resources
      .getResourceCategories(resourcesDir + currentResource.category_file)
      .then((categories) => {
        setCategories(categories)
        console.log(categories)
      })
  }, [currentResource])

  useEffect(() => {
    if (!currentResource) return
    window.parquet
      .getParquetColumns(resourcesDir + currentResource.parquet_file)
      .then((columns) => {
        setAllGenes(columns)
        console.log(columns)
      })
  }, [currentResource])

  const handleResourceChange = (value) => {
    setLoading(true);
    setSelectedData([]);
    setCurrentResource(resources.find((resource) => resource.category_name === value))
    setSelectedCategory("default");
    setSelectedGenes([]);
    console.log('currentResource:' + currentResource)
  }

  const handleCategoryChange = (value) => {
    setMinorLoading(true);
    setSelectedData([])
    if (value === "default" || value === undefined)
      setSelectedGenes([]);
    else
      setSelectedGenes(categories[value]);
    setSelectedCategory(value);
    
  }

  const handleBadgeClick = (badge) => {
    setMinorLoading(true)

    if (highlightedGene == '') {
      setHighlightedGene(badge)
      setPlotState({ ...plotState, minColor: 'grey', maxColor: 'yellow', autoMinScore: true})
    } else {
      setHighlightedGene('')
      setPlotState({ ...plotState, minColor: defaultMinColor, maxColor: defaultMaxColor, autoMinScore: false })
    }
  }

  const handleSearchInputChange = (event) => {
    const inputValue = event.target.value
    setSearchInput(inputValue)

    const results = allGenes.filter((gene) => gene.toLowerCase().includes(inputValue.toLowerCase()))
    setSearchResults(results)
  }

  const addSelectedGene = (gene) => {
    setMinorLoading(true)
    setSelectedGenes([...selectedGenes, gene])
    setSearchInput('')
    setSearchResults([])
  }

  // Fetch and process the data
  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      if (!currentResource) return

      try {
        // Fetch Parquet file data
        const fetchedData = await window.parquet.queryParquetFile(
          resourcesDir + currentResource.parquet_file,
          [...selectedGenes, 'umap_1', 'umap_2', 'index']
        )
        console.log('Data fetched:', fetchedData)

        let selection: string[] = []

        if (highlightedGene != '') selection = [highlightedGene]
        else selection = selectedGenes

        const processedData = fetchedData.map((d) => ({
          x: parseFloat(d.umap_1),
          y: parseFloat(d.umap_2),
          index: d.index,
          score: selection.reduce((acc, gene) => acc + parseFloat(d[gene]), 0),
          color: null // Will be set later
        }))

        // Sort the data by score to show the highest scoring points on top
        processedData.sort((a, b) => a.score - b.score)

        const temp = processedData.slice(processedData.length - 5000);

        setData(temp)
        setLoading(false)
        setMinorLoading(false)

        // Fetch the centroid data
        const centroidData = await window.parquet.queryParquetFile(
          resourcesDir + currentResource.centroid_file,
          ['cen_x', 'cen_y', 'Type']
        )

        const processedCentroidData = centroidData.map((d) => ({
          x: parseFloat(d.cen_x),
          y: parseFloat(d.cen_y),
          label: d.Type,
          color: null // Not currently implemented
        }))
        setLabels(processedCentroidData)
        console.log('Centroid data fetched:', processedCentroidData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [selectedGenes, currentResource, highlightedGene])

  const handleSelectedData = (selectedData) => {
    setSelectedData(selectedData)
  }

  const removeGene = (geneToRemove) => {
    setMinorLoading(true)
    setSelectedGenes(selectedGenes.filter((gene) => gene !== geneToRemove))
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.panel}>
          <h1 className="font-bold text-4xl">MatriViz</h1>
          <h2 className='font-bold text-2xl'>Category</h2>
          <div className={styles.categoryContainer}>
            {resources.length === 0 ? (
              <div>
                <p>No resources found in directory {resourcesDir} <br></br>Please select a resource directory:</p>
                <button onClick={() => handleResourceDirectorySelection()}>Select Resource Directory</button>
              </div>
            ) : (
              <>
                <Select 
                  onValueChange={handleResourceChange}>
                  <SelectTrigger  className="w-full">
                    <SelectValue placeholder={resources[0].category_description} />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.category_name} value={resource.category_name}>
                        {resource.category_description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  onValueChange={handleCategoryChange}>
                  <SelectTrigger  className="w-full">
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </>
            )}
        </div>

          <h2>Selected Genes</h2>
          <div className={styles.geneSearch}>
            <input
              type="text"
              placeholder="Search for a gene..."
              value={searchInput}
              onChange={handleSearchInputChange}
            />
            <div className={styles.searchResults}>
              {searchResults.map((gene) => (
                <div
                  key={gene}
                  className={styles.searchResultItem}
                  onClick={() => addSelectedGene(gene)}
                >
                  {gene}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.badgeContainer}>
            {selectedGenes.map((gene) => (
              <GeneBadge
                key={gene}
                gene={gene}
                handleBadgeClick={handleBadgeClick}
                removeGene={removeGene}
                isHighlighted={highlightedGene === gene}
              />
            ))}
          </div>
        
          <div className={styles.selectedHeader}>
            <h2>Selected Points</h2>
            {/* <button onClick={() => window.export.exportCSV(selectedData,
                                                           selectedGenes,
                                                           resourcesDir + currentResource?.parquet_file)
                                                           }>Export...</button> */}
            <ExportTasks
              selectedData={selectedData}
              selectedGenes={selectedGenes}
              resourcesDir={resourcesDir}
              currentResource={currentResource}
            ></ExportTasks>
          </div>
          
          {selectedData.length > 0 ? (
            <>
              <Row index={<b>Index</b>} score={<b>Score</b>} color={'white'}></Row> {/* Header */}
              <div className={styles.selectedContainer}>
                {selectedData.map((point, i) => (
                  <Row
                    key={`selected-point-${i}`}
                    index={point.index}
                    score={point.score.toFixed(3)}
                    color={point.color}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className={styles.selectedMessage}>Drag mouse over plot to select points.</p>
          )}
        </div>
        <div className={styles.plotArea}>
          {minorLoading && (
            <Loading className={styles.minorLoading} height={40} width={40} text={false} />
          )}
          {loading ? (
            <Loading className={styles.loading} height={80} width={80} text={true} />
          ) : (
            <Plot
              data={data}
              labels={labels}
              plotState={plotState}
              onSelectedData={handleSelectedData}
              setPlotState={(state) => setPlotState(state)}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default App
