import { useState, useEffect } from 'react'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import useLasso from './lasso'
import { DataPoint } from '../types'
import styles from '../assets/plot.module.css'

const Plot = ({ data }: { data: DataPoint[] }): JSX.Element => {
  const [dimensions, setDimensions] = useState({
    width: window.innerHeight - 50,
    height: window.innerHeight - 50
  })
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState<DataPoint[]>([])

  const xScale = scaleLinear({
    range: [0, dimensions.width * zoomLevel],
    domain: [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  })
  const yScale = scaleLinear({
    range: [dimensions.height * zoomLevel, 0],
    domain: [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]
  })

  useEffect(() => {
    const handleWheel = (event: WheelEvent): void => {
      const scaleFactor = 1.1;
      let newZoomLevel = event.deltaY > 0 ? zoomLevel / scaleFactor : zoomLevel * scaleFactor;
      if (newZoomLevel < 1) {
        newZoomLevel = 1;
      }
      setZoomLevel(newZoomLevel);
    };

    window.addEventListener('wheel', handleWheel);
    const handleResize = (): void => {
      setDimensions({ width: window.innerHeight - 50, height: window.innerHeight - 50 })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [zoomLevel])

  const { handleMouseDown, handleMouseMove, handleMouseUp, Lasso } = useLasso({
    data: data,
    xScale: xScale,
    yScale: yScale,
    onSelection: setSelectedPoints
  })

  return (
    <div className="container">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <LinearGradient id="stroke" from="#ff614e" to="#ffdc64" />
        <Group>
          {data?.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={1} // radius of point
              fill={selectedPoints.includes(point) ? 'red' : 'black'}
              className={styles.point}
            />
          ))}
        </Group>
        <Lasso />
      </svg>
    </div>
  )
}

export default Plot
