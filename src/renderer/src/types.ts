import { ScaleLinear } from 'd3-scale'

export interface DataPoint {
  x: number
  y: number
  index: string
  score: number
  color: string | null
}

export interface LabelPoint {
  x: number
  y: number
  label: string
  color: string | null
}

export interface TooltipData {
  top: number,
  left: number,
  data: DataPoint | null
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

export interface PlotState {
  minScore: number;
  maxScore: number;
  autoMinScore: boolean;
  autoMaxScore: boolean;
  minColor: string;
  maxColor: string;
  pointSize: number;
  transformX: number;
  transformY: number;
  toggleLabels: boolean;
  toggleGridlines: boolean;
}