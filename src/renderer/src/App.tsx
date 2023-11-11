import { useState, useEffect } from 'react'
import Plot from './components/plot'

const App = (): JSX.Element => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch and process the data
  useEffect(() => {
    window.feather
      .loadFeatherFile('./resources/enge_modified_nocomp.feather')
      .then(() => {
        return window.feather.queryGlobalTable({ select: ['umap_1', 'umap_2'] })
      })
      .then((fetchedData) => {
        console.log('Data fetched:', fetchedData)
        const processedData = fetchedData.map((d) => ({
          x: d.umap_1,
          y: d.umap_2
        }))
        setData(processedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  return <div className="container">{loading ? <div>Loading...</div> : <Plot data={data} />}</div>
}

export default App
