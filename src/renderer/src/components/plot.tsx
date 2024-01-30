import { useState, useEffect, useRef } from 'react'

/* Visx */
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import { TooltipWithBounds,
        defaultStyles as tooltipStyles
       } from '@visx/tooltip';
import { GridRows, GridColumns } from '@visx/grid';

/* Lucide */
import { Settings } from 'lucide-react';

/* Components */
import useLasso from './lasso'
import Legend from './legend'
import PlotOptions from './plotOptions'

/* Types */
import { DataPoint, LabelPoint, TooltipData, PlotState } from '../types'

/* Styles */
import styles from '../assets/plot.module.css'

const Plot = ({ data, labels, plotState, setPlotState, onSelectedData }: { 
    data: DataPoint[],
    labels: LabelPoint[],
    plotState: PlotState,
    setPlotState: (plotState: PlotState) => void,
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

  const [togglePlotOptions, setTogglePlotOptions] = useState(false);

  const xScale = scaleLinear({
    range: [(0 - plotState.transformX) / zoomLevel, (dimensions.width - plotState.transformX) / zoomLevel],
    domain: [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
  })
  
  const yScale = scaleLinear({
    range: [(dimensions.height - plotState.transformY) / zoomLevel, (0 - plotState.transformY) / zoomLevel],
    domain: [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]
  })

  const colorScale = scaleLinear<string>({
    domain: [plotState.minScore, plotState.maxScore],
    range: [plotState.minColor, plotState.maxColor],
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

        const newTransformX = mouseX - (mouseX - plotState.transformX) * (newZoomLevel / zoomLevel);
        const newTransformY = mouseY - (mouseY - plotState.transformY) * (newZoomLevel / zoomLevel);
        setPlotState({...plotState, transformX: newTransformX, transformY: newTransformY })

        if (newZoomLevel > 1) {
          newZoomLevel = 1;
          setPlotState({...plotState, transformX: 0, transformY: 0 })
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
     
    if (plotState.autoMinScore)
      setPlotState({...plotState, minScore: Math.min(...scores)})
    else 
      setPlotState({...plotState, minScore: 0})

    if (plotState.autoMaxScore)
      setPlotState({...plotState, maxScore: Math.max(...scores)})
    else 
    setPlotState({...plotState, maxScore: 10})
    console.log('minScore:', plotState.minScore);
    console.log('maxScore:', plotState.minScore);
  }, [data, plotState.autoMinScore, plotState.autoMaxScore]);

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
    <>
   {togglePlotOptions && 
    <PlotOptions 
      plotState={plotState}
      setPlotState={setPlotState}
    />}
    <div className="container">
      <div 
        className={styles.settings}
        onClick={() => setTogglePlotOptions(!togglePlotOptions)}
      >
        <p>Plot options </p>
        <Settings/>
      </div>
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
          { plotState.toggleGridlines && 
          <>
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
          </>
          }
          { data?.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={plotState.pointSize} // radius of point
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
          { plotState.toggleLabels && labels?.map((label) => (
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

      { tooltip?.data && (
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
        maxScore={plotState.maxScore}
        minScore={plotState.minScore}
        minColor={plotState.minColor}
        maxColor={plotState.maxColor}
      />
    </div>
    </>
  )
}

export default Plot
