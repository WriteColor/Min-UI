'use client'

import { useRef, useCallback } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'
import { cn } from '@/lib/utils'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** RGB values e.g. "163,230,53" */
  glowColor?: string
  /** Max tilt degrees */
  tiltDeg?: number
}

export function TiltCard({
  children,
  className,
  glowColor = '163,230,53',
  tiltDeg = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rawRotateX = useTransform(mouseY, [0, 1], [tiltDeg, -tiltDeg])
  const rawRotateY = useTransform(mouseX, [0, 1], [-tiltDeg, tiltDeg])
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 20 })
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 20 })

  const spotX = useTransform(mouseX, [0, 1], [0, 100])
  const spotY = useTransform(mouseY, [0, 1], [0, 100])
  const spotlight = useMotionTemplate`radial-gradient(circle at ${spotX}% ${spotY}%, rgba(${glowColor},0.12), transparent 70%)`

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={cn('relative group/tilt', className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-500"
        style={{ background: spotlight }}
      />
      {children}
    </motion.div>
  )
}
