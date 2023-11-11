import React, { useState, useEffect } from 'react'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import { line, curveBasis } from 'd3-shape'
import { polygonContains } from 'd3-polygon'

const App = (): JSX.Element => {
  const [data, setData] = useState([])
  const [dimensions, setDimensions] = useState({
    width: window.innerHeight - 50,
    height: window.innerHeight - 50
  })
  const [lassoPoints, setLassoPoints] = useState<[number, number][]>([])
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

  useEffect(() => {
    const handleResize = (): void => {
      setDimensions({ width: window.innerHeight - 50, height: window.innerHeight - 50 })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const xScale = scaleLinear({
    range: [0, dimensions.width],
    domain: [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  })
  const yScale = scaleLinear({
    range: [dimensions.height, 0],
    domain: [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]
  })

  const handleMouseDown = (event: React.MouseEvent): void => {
    setIsLassoActive(true)
    setLassoPoints([[event.clientX, event.clientY]])
  }

  const handleMouseMove = (event: React.MouseEvent): void => {
    if (!isLassoActive) return

    const updatedLassoPoints: [number, number][] =
      lassoPoints.length > 1 ? lassoPoints.slice(0, -1) : lassoPoints

    const newPoint: [number, number] = [event.clientX, event.clientY]

    const newPoints: [number, number][] = [...updatedLassoPoints, newPoint]

    // Temporarily close the loop for visual effect
    if (newPoints.length > 1) {
      newPoints.push(newPoints[0])
    }

    setLassoPoints(newPoints)
  }

  const handleMouseUp = (): void => {
    setIsLassoActive(false)
    const selected = data.filter((d) => polygonContains(lassoPoints, [xScale(d.x), yScale(d.y)]))
    setSelectedPoints(selected)
    console.log('Selected points:', selected)
  }

  const lassoPath = line().curve(curveBasis)(lassoPoints)

  return (
    <div className="container">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* <rect width={dimensions.width} height={dimensions.height} fill="transparent" /> */}
        <LinearGradient id="stroke" from="#ff614e" to="#ffdc64" />
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
        {isLassoActive && <path d={lassoPath} fill="none" stroke="url(#stroke)" strokeWidth={3} />}
      </svg>
    </div>
  )
}

export default App
