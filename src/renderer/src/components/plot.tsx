import { useState, useEffect, useRef } from 'react'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import { TooltipWithBounds, defaultStyles as tooltipStyles } from '@visx/tooltip';
import { GridRows, GridColumns } from '@visx/grid';
import useLasso from './lasso'
import Legend from './legend'
import { DataPoint, LabelPoint, TooltipData } from '../types'
import styles from '../assets/plot.module.css'

const Plot = ({ data, labels,  onSelectedData }: { 
    data: DataPoint[],
    labels: LabelPoint[],
    onSelectedData:(data: DataPoint[]) => void; 
  }): JSX.Element => {
  const [dimensions, setDimensions] = useState({
    width: window.innerHeight - 50,
    height: window.innerHeight - 50
  })
  const svgContainerRef = useRef<SVGSVGElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPoints, setSelectedPoints] = useState<DataPoint[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData>();
  const [minScore, setMinScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)

  const [minColor, setMinColor] = useState('#ffff00')
  const [maxColor, setMaxColor] = useState('#ff0000')

  const [pointSize, setPointSize] = useState(2);

  const [transformX, setTransformX] = useState(0);
  const [transformY, setTransformY] = useState(0);

  const xScale = scaleLinear({
    range: [(0 - transformX) / zoomLevel, (dimensions.width - transformX) / zoomLevel],
    domain: [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  })
  
  const yScale = scaleLinear({
    range: [(dimensions.height - transformY) / zoomLevel, (0 - transformY) / zoomLevel],
    domain: [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]
  })

  const colorScale = scaleLinear<string>({
    domain: [minScore, maxScore],
    range: [minColor, maxColor],
  })

  useEffect(() => {
    const handleWheel = (event: WheelEvent): void => {
      const scaleFactor = 1.1;
      const svgContainer = svgContainerRef.current;
      if (!svgContainer) return;

      const svgRect = svgContainer.getBoundingClientRect();
      const mouseX = event.clientX - svgRect.left;
      const mouseY = event.clientY - svgRect.top;

      if (
        mouseX >= 0 &&
        mouseY >= 0 &&
        mouseX <= svgRect.width &&
        mouseY <= svgRect.height
      ) 
      {
        let newZoomLevel = event.deltaY > 0 ? zoomLevel / scaleFactor : zoomLevel * scaleFactor;

        const newTransformX = mouseX - (mouseX - transformX) * (newZoomLevel / zoomLevel);
        const newTransformY = mouseY - (mouseY - transformY) * (newZoomLevel / zoomLevel);
        setTransformX(newTransformX);
        setTransformY(newTransformY);

        if (newZoomLevel > 1) {
          newZoomLevel = 1;
          setTransformX(0);
          setTransformY(0);
        }

        console.log(newZoomLevel);
        setZoomLevel(newZoomLevel);
      }
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
    //  setMinScore(Math.min(...scores))
     setMaxScore(Math.max(...scores))
    // setMinScore(0);
    // setMaxScore(50);
     console.log('minScore:', minScore);
     console.log('maxScore:', maxScore);
  }, [data]);

  useEffect(() => {
    const sortedPoints = [...selectedPoints].sort((a, b) => b.score - a.score);
    const modifiedPoints = sortedPoints.map((point) => ({
      ...point,
      color: colorScale(point.score),
    }));    
    onSelectedData(modifiedPoints);
  }, [selectedPoints]);

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
        ref={svgContainerRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <LinearGradient id="stroke" from="#6699ff" to="#9933cc" />
        <Group>
          <GridRows
            scale={yScale}
            width={dimensions.width}
            stroke="#e0e0e0"
          />
          <GridColumns
            scale={xScale}
            height={dimensions.height}
            stroke="#e0e0e0"
          />
          {data?.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={pointSize} // radius of point
              fill={
                selectedPoints.includes(point)
                  ? colorScale(point.score)
                  : selectedPoints.length > 0
                  ? 'gray'
                  : colorScale(point.score)
              }
              className={styles.point}
              onMouseEnter={(event) => handleMouseEnter(event, point)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          {labels?.map((label, i) => (
            <text
              x={xScale(label.x)}
              y={yScale(label.y)}
              className={styles.label}
            >
            {label.label}
            </text>
          ))}
          <Lasso />
        </Group>
      </svg>

      {tooltip?.data && (
        <TooltipWithBounds
          top={tooltip.top}
          left={tooltip.left}
          style={tooltipStyles}
        >
          <b>Cell Name:</b> {tooltip.data.index}
          <br />
          <b>Score:</b> {tooltip.data.score}
        </TooltipWithBounds>
      )}

      <Legend 
        x={dimensions.width - 80}
        y={0}
        maxScore={maxScore}
        minScore={minScore}
        minColor={minColor}
        maxColor={maxColor}
      />
    </div>
  )
}

export default Plot
