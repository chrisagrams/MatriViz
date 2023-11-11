import { ScaleLinear } from 'd3-scale'

export interface DataPoint {
  x: number
  y: number
}

export interface UseLassoProps {
  data: DataPoint[]
  xScale: ScaleLinear<number, number>
  yScale: ScaleLinear<number, number>
  onSelection: (selectedPoints: DataPoint[]) => void
}

export interface UseLassoReturn {
  handleMouseDown: (event: React.MouseEvent) => void
  handleMouseMove: (event: React.MouseEvent) => void
  handleMouseUp: () => void
  Lasso: React.FC
  lassoPoints: [number, number][]
  isLassoActive: boolean
}
