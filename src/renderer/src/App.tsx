import { useState, useEffect } from 'react'
import Plot from './components/plot'
import styles from './assets/app.module.css'
import { ColorRing } from 'react-loader-spinner';
import categories from "../../../resources/enge_modified_category.json";
import { DataPoint } from './types'

const App = (): JSX.Element => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGenes, setSelectedGenes] = useState(['SAMD11', 'HES4', 'CD44'])
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllGenes, setShowAllGenes] = useState(false);
  const [selectedData, setSelectedData] = useState<DataPoint[]>([]);

  const toggleGene = (gene) => {
    if (selectedGenes.includes(gene)) {
      setSelectedGenes(selectedGenes.filter((selectedGene) => selectedGene !== gene));
    } else {
      setSelectedGenes([...selectedGenes, gene]);
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setSelectedData([]);
    setSelectedGenes(categories[selectedCategory]);
    setSelectedCategory(selectedCategory);
  };

  // Fetch and process the data
  useEffect(() => {
    // setLoading(true)
    window.feather
      .loadFeatherFile('./resources/enge_modified_nocomp.feather')
      .then(() => {
        return window.feather.queryGlobalTable({ select: [...selectedGenes, 'umap_1', 'umap_2', 'index'] })
      })
      .then((fetchedData) => {
        console.log('Data fetched:', fetchedData)
        const processedData = fetchedData.map((d) => ({
          x: d.umap_1,
          y: d.umap_2,
          index: d.index,
          score: selectedGenes.reduce((acc, gene) => acc + d[gene], 0),
        }))
        setData(processedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [selectedGenes])

  const handleSelectedData = (selectedData) => {
    setSelectedData(selectedData);
  }

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1>MatriViz</h1>
        {/* <div>
        {['SAMD11', 'HES4', 'CD44'].map((gene) => (
          <button
            key={gene}
            onClick={() => toggleGene(gene)}
            className={selectedGenes.includes(gene) ? styles.selectedGeneButton : styles.geneButton}
          >
            {gene}
          </button>
        ))}
      </div> */}
      <h2>Category</h2>
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
      
      <h2>Selected Genes</h2>
      <div className={styles.badgeContainer}>
        {showAllGenes
          ? selectedGenes.map((gene) => (
              <span key={gene} className={styles.geneBadge}>
                {gene}
              </span>
            ))
          : <>
            {selectedGenes.slice(0, 10).map((gene) => (
              <span key={gene} className={styles.geneBadge}>
                {gene}
              </span>
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
        <div className={styles.selectedPoint}>
          <span>Index</span>
          <span>Score</span>
        </div>
      )}
      <div className={styles.selectedContainer}>
        {selectedData.map((point, i) => (
          <div className={styles.selectedPoint} key={`selected-point-${i}`}>
            <span>{point.index}</span>
            <div>
              <span>{point.score.toFixed(3)}</span>
              <div className={styles.colorCircle} style={{ backgroundColor: point.color || "white"}}></div>
            </div>
          </div>
        ))}
      </div>
      </div>
      <div className={styles.plotArea}>
        <div className="container">{loading ? 
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
         : <Plot data={data} onSelectedData={handleSelectedData}/>}</div>
      </div>
    </div>
  )
}

export default App
