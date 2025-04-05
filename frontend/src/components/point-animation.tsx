"use client"

import { useEffect, useState } from "react"

interface PointAnimationProps {
  x: number
  y: number
}

export function PointAnimation({ x, y }: PointAnimationProps) {
  const [style, setStyle] = useState({
    left: `${x}px`,
    top: `${y}px`,
    opacity: 1,
    transform: "translateY(0) scale(1)",
  })

  useEffect(() => {
    // Start animation after a small delay
    const timeout = setTimeout(() => {
      setStyle({
        left: `${x}px`,
        top: `${y}px`,
        opacity: 0,
        transform: "translateY(-50px) scale(1.2)",
      })
    }, 50)

    return () => clearTimeout(timeout)
  }, [x, y])

  return (
    <div
      className="fixed z-50 pointer-events-none text-lg font-bold text-green-500"
      style={{
        ...style,
        transition: "all 0.8s ease-out",
      }}
    >
      +10
    </div>
  )
}

