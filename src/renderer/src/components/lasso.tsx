import React, { useState, useCallback } from 'react'
import { polygonContains } from 'd3-polygon'
import { line, curveBasis } from 'd3-shape'
import { UseLassoProps, UseLassoReturn } from '../types'

const useLasso = ({ data, xScale, yScale, onSelection }: UseLassoProps): UseLassoReturn => {
  const [lassoPoints, setLassoPoints] = useState<[number, number][]>([])
  const [isLassoActive, setIsLassoActive] = useState(false)

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsLassoActive(true)
    const { left, top } = event.currentTarget.getBoundingClientRect()
    setLassoPoints([[event.clientX - left, event.clientY - top]])
  }, [])

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isLassoActive) return

      const { left, top } = event.currentTarget.getBoundingClientRect()
      const updatedLassoPoints: [number, number][] =
        lassoPoints.length > 1 ? lassoPoints.slice(0, -1) : lassoPoints

      const newPoint: [number, number] = [
        event.clientX - left,
        event.clientY - top,
      ]

      const newPoints: [number, number][] = [...updatedLassoPoints, newPoint]

      // Temporarily close the loop for visual effect
      if (newPoints.length > 1) {
        newPoints.push(newPoints[0])
      }

      setLassoPoints(newPoints)
    },
    [isLassoActive, lassoPoints]
  )

  const handleMouseUp = useCallback(() => {
    setIsLassoActive(false)
    const selected = data.filter((d) => polygonContains(lassoPoints, [xScale(d.x), yScale(d.y)]))
    console.log('Selected points:', selected)
    onSelection(selected)
  }, [lassoPoints, data, xScale, yScale])

  const Lasso: React.FC = () => {
    const lassoPath = line().curve(curveBasis)(lassoPoints)
    return (
      isLassoActive && <path d={lassoPath!} fill="none" stroke="url(#stroke)" strokeWidth={3} />
    )
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    Lasso,
    lassoPoints,
    isLassoActive
  }
}

export default useLasso
