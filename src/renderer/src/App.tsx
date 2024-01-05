import { useState, useEffect } from 'react'
import Plot from './components/plot'
import styles from './assets/app.module.css'
import { ColorRing } from 'react-loader-spinner';

const App = (): JSX.Element => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGenes, setSelectedGenes] = useState(['SAMD11', 'HES4', 'CD44'])

  // Fetch and process the data
  useEffect(() => {
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
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1>MatriViz</h1>
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
         : <Plot data={data} />}</div>
      </div>
    </div>
  )
}

export default App
