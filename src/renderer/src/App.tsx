import { useState, useEffect } from 'react'
import Plot from './components/plot'
import Badge from './components/badge'
import Row from './components/row'
import styles from './assets/app.module.css'
import { ColorRing } from 'react-loader-spinner';
import categories from "../../../resources/enge_modified_category.json";
import all from "../../../resources/enge_modified_all.json";

import { DataPoint } from './types'

const App = (): JSX.Element => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [minorLoading, setMinorLoading] = useState(false) // Non-blocking loading
  const [selectedGenes, setSelectedGenes] = useState(['SAMD11', 'HES4', 'CD44'])
  const [selectedBadges, setSelectedBadges] = useState(['SAMD11', 'HES4', 'CD44']);
  const [singleToggle, setSingleToggle] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllGenes, setShowAllGenes] = useState(false);
  const [selectedData, setSelectedData] = useState<DataPoint[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

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

    const results = all.filter((gene) =>
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
    // setLoading(true)
    window.feather
      .loadFeatherFile('./resources/enge_modified_nocomp.feather')
      .then(() => {
        return window.feather.queryGlobalTable({ select: [...selectedBadges, 'umap_1', 'umap_2', 'index'] })
      })
      .then((fetchedData) => {
        console.log('Data fetched:', fetchedData)
        const processedData = fetchedData.map((d) => ({
          x: d.umap_1,
          y: d.umap_2,
          index: d.index,
          score: selectedBadges.reduce((acc, gene) => acc + d[gene], 0),
        }))

        // Sort the data by score to show the highest scoring points on top
        processedData.sort((a, b) => a.score - b.score);
        setData(processedData)
        setLoading(false)
        setMinorLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [selectedBadges])

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
      <div className={styles.categoryContainer}>
        <select>
          <option value="">Kidney</option>
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
