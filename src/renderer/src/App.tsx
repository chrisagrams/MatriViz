import React, { useState, useEffect } from 'react'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { line } from 'd3-shape'
import { polygonContains } from 'd3-polygon'

const App = (): JSX.Element => {
  const [data, setData] = useState([]) // State to store the data
  const [lassoPoints, setLassoPoints] = useState([])
  const [selectedPoints, setSelectedPoints] = useState([])
  const [isLassoActive, setIsLassoActive] = useState(false)

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
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  const width = 600
  const height = 600

  const xScale = scaleLinear({
    range: [0, width],
    domain: [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  })
  const yScale = scaleLinear({
    range: [height, 0],
    domain: [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]
  })

  const handleMouseDown = (event) => {
    setIsLassoActive(true)
    setLassoPoints([[event.clientX, event.clientY]])
  }

  const handleMouseMove = (event) => {
    if (!isLassoActive) return
    setLassoPoints([...lassoPoints, [event.clientX, event.clientY]])
  }

  const handleMouseUp = () => {
    setIsLassoActive(false)
    const selected = data.filter((d) => polygonContains(lassoPoints, [xScale(d.x), yScale(d.y)]))
    setSelectedPoints(selected)
  }

  const lassoPath = line()(lassoPoints)

  return (
    <div className="container">
      <svg
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <rect width={width} height={height} fill="transparent" />
        <Group>
          {data.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={1}
              fill={selectedPoints.includes(point) ? 'red' : 'white'}
            />
          ))}
        </Group>
        {isLassoActive && <path d={lassoPath} fill="none" stroke="blue" />}
      </svg>
    </div>
  )
}

export default App
