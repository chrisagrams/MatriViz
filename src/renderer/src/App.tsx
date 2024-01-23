import { useState, useEffect } from 'react'
import { ColorRing } from 'react-loader-spinner';

/* Components */
import Plot from './components/plot'
import Badge from './components/badge'
import Row from './components/row'

/* Styles */
import styles from './assets/app.module.css'

/* Types */
import { DataPoint } from './types'
import { ResourceFile } from '../../types/types';

const App = (): JSX.Element => {
  const [resourcesDir, setResourcesDir] = useState<string>("./resources/"); // TODO: Make this configurable
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [currentResource, setCurrentResource] = useState<ResourceFile>();
  const [categories, setCategories] = useState({} as any);
  const [allGenes, setAllGenes] = useState([] as string[]); // Columns from parquet file

  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true)
  const [minorLoading, setMinorLoading] = useState(false) // Use only for non-blocking loading
  const [selectedGenes, setSelectedGenes] = useState(['SAMD11', 'HES4', 'CD44'])
  const [selectedBadges, setSelectedBadges] = useState(['SAMD11', 'HES4', 'CD44']);
  const [singleToggle, setSingleToggle] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllGenes, setShowAllGenes] = useState(false);
  const [selectedData, setSelectedData] = useState<DataPoint[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);


  const populateResources = () => {
    window.resources.getResourceList(resourcesDir).then((files) => {
      setResources(files as ResourceFile[]);
      if (currentResource === undefined && files.length > 0) // If no resource is selected, select the first one
        setCurrentResource(files[0]);
      console.log(resources);
    });
  }

  useEffect(() => {
    populateResources();
  }, [resourcesDir]);

  useEffect(() => {
    if (!currentResource) return;
    window.resources.getResourceCategories(resourcesDir + currentResource.category_file)
      .then((categories) => {
      setCategories(categories);
      console.log(categories);
    });
  }, [currentResource]);


  useEffect(() => {
    if (!currentResource) return;
    window.parquet.getParquetColumns(resourcesDir + currentResource.parquet_file)
      .then((columns) => {
        setAllGenes(columns);
        console.log(columns);
      });
  }, [currentResource]);

  const handleResourceChange = (event) => {
    const selectedResource = event.target.value;
    setCurrentResource(resources.find((resource) => resource.category_name === selectedResource));
    console.log("currentResource:" + currentResource);
  }

  const handleCategoryChange = (event) => {
    setMinorLoading(true);
    const selectedCategory = event.target.value;
    setSelectedData([]);
    setSelectedGenes(categories[selectedCategory]);
    setSelectedBadges(categories[selectedCategory]);
    setSelectedCategory(selectedCategory);
  };

  const handleBadgeClick = (badge) => {
    setMinorLoading(true);
    const badgeElements = document.querySelectorAll(`.${styles.geneBadge}`);

    if (!singleToggle) {
      setSelectedBadges([badge]);
      badgeElements.forEach((element) => {
        if (element.dataset.key === badge) {
          element.classList.add(styles.selectedBadge);
        } else {
          element.classList.remove(styles.selectedBadge);
        }
      })
    }
    else {
      setSelectedBadges(selectedGenes);
      badgeElements.forEach((element) => {
        element.classList.remove(styles.selectedBadge);
      });
    }
    
    setSingleToggle(!singleToggle);
  };


  const handleSearchInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchInput(inputValue);

    const results = allGenes.filter((gene) =>
      gene.toLowerCase().includes(inputValue.toLowerCase())
    );
    setSearchResults(results);
  };

  const addSelectedGene = (gene) => {
    setMinorLoading(true);
    setSelectedGenes([...selectedGenes, gene]);
    setSelectedBadges([...selectedGenes, gene]);
    setSearchInput('');
    setSearchResults([]);
  };


  // Fetch and process the data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!currentResource) return;
  
      try {
        // Fetch Parquet file data
        const fetchedData = await window.parquet.queryParquetFile(
          resourcesDir + currentResource.parquet_file,
          [...selectedBadges, 'umap_1', 'umap_2', 'index']
        );
        console.log('Data fetched:', fetchedData);
  
        let processedData = fetchedData.map((d) => ({
          x: parseFloat(d.umap_1),
          y: parseFloat(d.umap_2),
          index: d.index,
          score: selectedBadges.reduce((acc, gene) => acc + parseFloat(d[gene]), 0),
          color: null, // Will be set later
        }));
  
        // Sort the data by score to show the highest scoring points on top
        processedData.sort((a, b) => a.score - b.score);
  
        setData(processedData);
        setLoading(false);
        setMinorLoading(false);
  
        // Fetch the centroid data
        const centroidData = await window.parquet.queryParquetFile(
          resourcesDir + currentResource.centroid_file,
          ['cen_x', 'cen_y', 'Type']
        );
        console.log("Centroid data fetched:", centroidData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedBadges, currentResource]);

  const handleSelectedData = (selectedData) => {
    setSelectedData(selectedData);
  }

  const removeGene = (geneToRemove) => {
    setMinorLoading(true);
    setSelectedGenes(selectedGenes.filter((gene) => gene !== geneToRemove));
    setSelectedBadges(selectedGenes.filter((gene) => gene !== geneToRemove));
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
      <h1>MatriViz</h1>
      <h2>Category</h2>
      <div className={styles.categoryContainer} >
        <select onClick={populateResources} onChange={handleResourceChange}>
          {resources.map((resource) => (
            <option key={resource.category_name} value={resource.category_name}>
              {resource.category_description} 
            </option>
          ))}
       </select>
        <select onChange={handleCategoryChange} value={selectedCategory}>
            <option value="">Category</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </select>
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
        {showAllGenes
          ? selectedGenes.map((gene) => (
              <Badge key={gene} gene={gene} handleBadgeClick={handleBadgeClick} removeGene={removeGene} />
            ))
          : <>
            {selectedGenes.slice(0, 10).map((gene) => (
              <Badge key={gene} gene={gene} handleBadgeClick={handleBadgeClick} removeGene={removeGene} />
            ))}
            <span className={styles.ellipsis}>...</span>
          </>
        }
      </div>
      {selectedGenes.length > 10 && (
        <button onClick={() => setShowAllGenes(!showAllGenes)}>
          {showAllGenes ? 'Hide' : 'See All'}
        </button>
      )}
      
      <h2>Selected Points</h2>
      {selectedData.length > 0 && (
        <Row index={<b>Index</b>} score={<b>Score</b>} color={"white"}></Row> // Header
      )}
      <div className={styles.selectedContainer}>
        {selectedData.map((point, i) => (
          <Row key={`selected-point-${i}`}
               index={point.index}
               score={point.score.toFixed(3)}
               color={point.color}  
          />
        ))}
      </div>
      </div>
      <div className={styles.plotArea}>
          {minorLoading && 
            <div className={styles.minorLoading}>
              <ColorRing
                height="40"
                width="40"
                colors={['#5bb9e1', '#5bb9e1', '#5bb9e1', '#5bb9e1', '#5bb9e1']}
              />
            </div>
          }
          {loading ? 
            <div className={styles.loading}>
              <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="blocks-loading"
              wrapperStyle={{}}
              wrapperClass="blocks-wrapper"
              colors={['#5bb9e1', '#5bb9e1', '#5bb9e1', '#5bb9e1', '#5bb9e1']}
              />
              <p>Loading...</p>
            </div>
          : <Plot data={data} onSelectedData={handleSelectedData}/>}
        </div>
    </div>
  )
}

export default App
