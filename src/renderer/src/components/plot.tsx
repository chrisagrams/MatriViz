import { useState, useEffect } from 'react'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import { Text } from '@visx/text'
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
  const [selectedPoints, setSelectedPoints] = useState<DataPoint[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData>();
  const [minScore, setMinScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)


  const xScale = scaleLinear({
    range: [0, dimensions.width * zoomLevel],
    domain: [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  })
  const yScale = scaleLinear({
    range: [dimensions.height * zoomLevel, 0],
    domain: [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]
  })
  const colorScale = scaleLinear<string>({
    domain: [minScore, maxScore],
    range: ['#ffff00', '#ff0000'], // Yellow to Red
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

  useEffect(() => {
     // Set the min and max score
     const scores = data.map((d) => d.score)
     setMinScore(Math.min(...scores))
     setMaxScore(Math.max(...scores))
     console.log('minScore:', minScore);
     console.log('maxScore:', maxScore);
  }, [data]);

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
        <LinearGradient id="stroke" from="#6699ff" to="#9933cc" />
        <Group>
          {data?.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={2} // radius of point
              fill={selectedPoints.includes(point) ? 'blue' : colorScale(point.score)}
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
          <b>Index:</b> {tooltip.data.index}
          <br />
          <b>Score:</b> {tooltip.data.score}
        </TooltipWithBounds>
      )}

      <svg
        width={80}
        height={100}
        x={dimensions.width - 80} 
        y={0}
      >
        <LinearGradient id="colorScale" from="#ff0000" to="#ffff00" vertical={true} />
        <rect x={0} y={0} width={20} height={100} fill="url(#colorScale)" />
        <Text x={25} y={10} fill="#000" fontSize={12}>
          {maxScore.toFixed(3)}
        </Text>
        <Text x={25} y={100} fill="#000" fontSize={12}>
          {minScore.toFixed(3)}
        </Text>
      </svg>
    </div>
  )
}

export default Plot
