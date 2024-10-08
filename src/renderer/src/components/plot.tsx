import { useState, useEffect, useRef, useMemo } from 'react'

/* Visx */
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { LinearGradient } from '@visx/gradient'
import { TooltipWithBounds, defaultStyles as tooltipStyles } from '@visx/tooltip'
import { GridRows, GridColumns } from '@visx/grid'

/* Components */
import useLasso from './lasso'
import Legend from './legend'
import { PlotOptionsSheet } from '@renderer/components/PlotOptionsSheet'

/* Types */
import { DataPoint, LabelPoint, TooltipData, PlotState } from '../types'

/* Styles */
import styles from '../assets/plot.module.css'

const Plot = ({
  data,
  labels,
  plotState,
  setPlotState,
  onSelectedData
}: {
  data: DataPoint[]
  labels: LabelPoint[]
  plotState: PlotState
  setPlotState: (plotState: PlotState) => void
  onSelectedData: (data: DataPoint[]) => void
}): JSX.Element => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  })
  const svgContainerRef = useRef<SVGSVGElement | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedPoints, setSelectedPoints] = useState<DataPoint[]>([])
  const [tooltip, setTooltip] = useState<TooltipData>()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const scaleOffset = 2

  const xScale = scaleLinear({
    range: [
      (0 - plotState.transformX) / zoomLevel,
      (dimensions.width - plotState.transformX) / zoomLevel
    ],
    domain: [
      Math.min(...data.map((d) => d.x)) - scaleOffset,
      Math.max(...data.map((d) => d.x)) + scaleOffset
    ]
  })

  const yScale = scaleLinear({
    range: [
      (dimensions.height - plotState.transformY) / zoomLevel,
      (0 - plotState.transformY) / zoomLevel
    ],
    domain: [
      Math.min(...data.map((d) => d.y)) - scaleOffset,
      Math.max(...data.map((d) => d.y)) + scaleOffset
    ]
  })

  const colorScale = scaleLinear<string>({
    domain: [plotState.minScore, plotState.maxScore],
    range: [plotState.minColor, plotState.maxColor]
  })

  useEffect(() => {
    const handleWheel = (event: WheelEvent): void => {
      const scaleFactor = 1.1
      const svgContainer = svgContainerRef.current
      if (!svgContainer) return

      const svgRect = svgContainer.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      if (mouseX >= 0 && mouseY >= 0 && mouseX <= svgRect.width && mouseY <= svgRect.height) {
        let newZoomLevel = event.deltaY > 0 ? zoomLevel / scaleFactor : zoomLevel * scaleFactor

        let newTransformX = mouseX - (mouseX - plotState.transformX) * (newZoomLevel / zoomLevel)
        let newTransformY = mouseY - (mouseY - plotState.transformY) * (newZoomLevel / zoomLevel)

        if (newZoomLevel > 1) {
          newZoomLevel = 1
          newTransformX = 0
          newTransformY = 0
        }
        setZoomLevel(newZoomLevel)

        setPlotState({
          ...plotState,
          transformX: newTransformX,
          transformY: newTransformY
        })
      }
    }

    window.addEventListener('wheel', handleWheel)
  }, [zoomLevel, plotState])

  useEffect(() => {
    const handleResize = (): void => {
      if (containerRef.current) {
        setDimensions({ 
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        })
      }
    }
    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []);

  useEffect(() => {
    // Set the min and max score
    const scores = data.map((d) => d.score)
    let newMinScore = plotState.minScore
    let newMaxScore = plotState.maxScore

    if (plotState.autoMinScore) newMinScore = Math.min(...scores)
    else newMinScore = 0

    if (plotState.autoMaxScore) newMaxScore = Math.max(...scores)
    else newMaxScore = 10

    setPlotState({ ...plotState, minScore: newMinScore, maxScore: newMaxScore })
  }, [data, plotState.autoMinScore, plotState.autoMaxScore])

  useEffect(() => {
    const sortedPoints = [...selectedPoints].sort((a, b) => b.score - a.score)
    const modifiedPoints = sortedPoints.map((point) => ({
      ...point,
      color: colorScale(point.score)
    }))
    onSelectedData(modifiedPoints)
  }, [selectedPoints])

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
    })
  }

  const handleMouseLeave = () => {
    setTooltip({ top: 0, left: 0, data: null })
  }

  const selectedPointIds = useMemo(
    () => new Set(selectedPoints.map((point) => point.index)),
    [selectedPoints]
  )

  const processedData = useMemo(
    () =>
      data?.map((point) => ({
        ...point,
        cx: xScale(point.x),
        cy: yScale(point.y),
        fill: selectedPointIds.has(point.index)
          ? colorScale(point.score)
          : selectedPoints.length > 0
          ? 'gray'
          : colorScale(point.score)
      })),
    [data, xScale, yScale, colorScale, selectedPointIds, selectedPoints.length]
  )

  return (
    <>
      <div ref={containerRef} className="flex flex-row w-full h-screen relative">
        <PlotOptionsSheet plotState={plotState} setPlotState={setPlotState}></PlotOptionsSheet>
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
            {plotState.toggleGridlines && (
              <>
                <GridRows scale={yScale} width={dimensions.width} stroke="#e0e0e0" />
                <GridColumns scale={xScale} height={dimensions.height} stroke="#e0e0e0" />
              </>
            )}
            {processedData.map((point) => (
              <Circle
                key={`point-${point.index}`}
                cx={point.cx}
                cy={point.cy}
                r={plotState.pointSize}
                fill={point.fill}
                className={styles.point}
                onMouseEnter={(event) => handleMouseEnter(event, point)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
            {plotState.toggleLabels &&
              labels?.map((label) => (
                <text x={xScale(label.x)} y={yScale(label.y)} className={styles.label}>
                  {label.label}
                </text>
              ))}
            <Lasso />
          </Group>
        </svg>

        {tooltip?.data && (
          <TooltipWithBounds top={tooltip.top} left={tooltip.left} style={tooltipStyles}>
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
