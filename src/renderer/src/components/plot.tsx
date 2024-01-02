import { useState, useEffect } from 'react'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import { TooltipWithBounds, defaultStyles as tooltipStyles } from '@visx/tooltip';
import useLasso from './lasso'
import { DataPoint, TooltipData } from '../types'
import styles from '../assets/plot.module.css'

const Plot = ({ data }: { data: DataPoint[] }): JSX.Element => {
  const [dimensions, setDimensions] = useState({
    width: window.innerHeight - 50,
    height: window.innerHeight - 50
  })
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState<DataPoint[]>([])
  const [tooltip, setTooltip] = useState<TooltipData>();

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

  const handleMouseEnter = (event, point: DataPoint) => {
    setTooltip({
      top: event.clientY,
      left: event.clientX,
      data: point
    });
  };

  const handleMouseLeave = () => {
    setTooltip({top: 0, left:0, data: null });
  };

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
              r={1.5} // radius of point
              fill={selectedPoints.includes(point) ? 'red' : 'black'}
              className={styles.point}
              onMouseEnter={(event) => handleMouseEnter(event, point)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </Group>
        <Lasso />
      </svg>

      {tooltip?.data && (
        <TooltipWithBounds
          top={tooltip.top}
          left={tooltip.left}
          style={tooltipStyles}
        >
          Index: {tooltip.data.index}
        </TooltipWithBounds>
      )}
    </div>
  )
}

export default Plot
