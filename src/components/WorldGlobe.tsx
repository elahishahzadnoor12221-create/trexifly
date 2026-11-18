import { useEffect, useRef } from 'react'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import landTopology from 'world-atlas/land-110m.json'

import { cx } from '../lib/cx'

/**
 * Crisp canvas 3D world globe (orthographic projection of real Natural Earth
 * land data) with a glowing orbital trail and an airplane flying along it.
 * Navy ocean + cream continents give strong contrast on the #FF5500 panel.
 */
const TOPOLOGY = landTopology as unknown as Topology
const LAND = feature(TOPOLOGY, TOPOLOGY.objects.land) as unknown as GeoPermissibleObjects
const GRATICULE = geoGraticule10()

const CITIES: Array<[number, number]> = [
  [55.3, 25.2], // Dubai
  [-0.1, 51.5], // London
  [29, 41], // Istanbul
  [73.05, 33.7], // Islamabad
  [-74, 40.7], // New York
  [139.7, 35.7], // Tokyo
  [103.8, 1.35], // Singapore
]

const TILT = (72 * Math.PI) / 180
const ROLL = (-22 * Math.PI) / 180
const TRAIL = 1.7 // radians of glowing trail behind the plane
const SEGMENTS = 240

let planePath: Path2D | null = null
function getPlanePath(): Path2D {
  if (!planePath) {
    planePath = new Path2D(
      'M17 0 C13 -1.6 8 -2 3 -2.4 L-3 -13 C-3.6 -14 -5.6 -14 -5.4 -12.6 L-3.4 -2.6 L-10 -2.4 L-13.5 -6.6 C-14 -7.2 -15.4 -7 -15.2 -6 L-13.4 0 L-15.2 6 C-15.4 7 -14 7.2 -13.5 6.6 L-10 2.4 L-3.4 2.6 L-5.4 12.6 C-5.6 14 -3.6 14 -3 13 L3 2.4 C8 2 13 1.6 17 0 Z',
    )
  }
  return planePath
}

function draw(ctx: CanvasRenderingContext2D, size: number, time: number) {
  const cx0 = size / 2
  const cy0 = size / 2
  const R = size * 0.33
  const OR = R * 1.34
  const sc = size / 420

  const orbitPoint = (theta: number) => {
    const ox = Math.cos(theta)
    const oy = Math.sin(theta)
    const y1 = oy * Math.cos(TILT)
    const z = oy * Math.sin(TILT)
    const x2 = ox * Math.cos(ROLL) - y1 * Math.sin(ROLL)
    const y2 = ox * Math.sin(ROLL) + y1 * Math.cos(ROLL)
    return { x: cx0 + x2 * OR, y: cy0 + y2 * OR, z }
  }

  const planeTheta = time * 0.55
  const centerLon = 70 - time * 9
  const centerLat = 18

  ctx.clearRect(0, 0, size, size)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Soft white atmosphere glow behind everything.
  const glow = ctx.createRadialGradient(cx0, cy0, R * 0.9, cx0, cy0, R * 1.6)
  glow.addColorStop(0, 'rgba(255,255,255,0.40)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx0, cy0, R * 1.6, 0, Math.PI * 2)
  ctx.fill()

  const drawOrbit = (front: boolean) => {
    for (let i = 0; i < SEGMENTS; i += 1) {
      const a0 = (i / SEGMENTS) * Math.PI * 2
      const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2
      const p0 = orbitPoint(a0)
      const p1 = orbitPoint(a1)
      if (p0.z + p1.z >= 0 !== front) continue
      // faint full ring
      ctx.shadowBlur = 0
      ctx.strokeStyle = front ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.26)'
      ctx.lineWidth = 1.2 * sc
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
      // glowing comet trail behind the airplane
      const mid = (a0 + a1) / 2
      const d = (((planeTheta - mid) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      if (d < TRAIL) {
        const k = 1 - d / TRAIL
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.25 + 0.75 * k * k).toFixed(3) + ')'
        ctx.shadowColor = 'rgba(255,224,190,1)'
        ctx.shadowBlur = 14 * sc * k
        ctx.lineWidth = (0.8 + 3.4 * k) * sc
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
  }

  const drawPlane = () => {
    const p = orbitPoint(planeTheta)
    const q = orbitPoint(planeTheta + 0.03)
    const angle = Math.atan2(q.y - p.y, q.x - p.x)
    const s = sc * 1.15 * (0.85 + 0.3 * p.z)
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(angle)
    ctx.scale(s, s)
    ctx.shadowColor = 'rgba(255,255,255,0.95)'
    ctx.shadowBlur = 14
    ctx.fillStyle = '#FFFFFF'
    ctx.fill(getPlanePath())
    ctx.shadowBlur = 0
    ctx.lineWidth = 1.1 / s
    ctx.strokeStyle = '#FF5500'
    ctx.stroke(getPlanePath())
    ctx.restore()
  }

  const planeInFront = orbitPoint(planeTheta).z >= 0

  // 1) back half of the orbit (and plane when it is behind the globe)
  drawOrbit(false)
  if (!planeInFront) drawPlane()

  // 2) the globe
  const ocean = ctx.createRadialGradient(cx0 - R * 0.35, cy0 - R * 0.4, R * 0.1, cx0, cy0, R)
  ocean.addColorStop(0, '#2F7AC8')
  ocean.addColorStop(0.55, '#0F3F7C')
  ocean.addColorStop(1, '#061B3D')
  ctx.fillStyle = ocean
  ctx.beginPath()
  ctx.arc(cx0, cy0, R, 0, Math.PI * 2)
  ctx.fill()

  const projection = geoOrthographic()
    .scale(R)
    .translate([cx0, cy0])
    .clipAngle(90)
    .rotate([-centerLon, -centerLat])
  const path = geoPath(projection, ctx)

  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 0.7 * sc
  ctx.beginPath()
  path(GRATICULE)
  ctx.stroke()

  ctx.fillStyle = '#FFF3E4'
  ctx.strokeStyle = 'rgba(6,27,61,0.45)'
  ctx.lineWidth = 0.7 * sc
  ctx.beginPath()
  path(LAND)
  ctx.fill()
  ctx.stroke()

  // 3D shading: light from the top-left, shadow on the bottom-right.
  const shade = ctx.createRadialGradient(cx0 - R * 0.45, cy0 - R * 0.5, R * 0.2, cx0, cy0, R * 1.05)
  shade.addColorStop(0, 'rgba(255,255,255,0.20)')
  shade.addColorStop(0.55, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(2,10,30,0.60)')
  ctx.fillStyle = shade
  ctx.beginPath()
  ctx.arc(cx0, cy0, R, 0, Math.PI * 2)
  ctx.fill()

  // City markers on the visible hemisphere.
  const centre: [number, number] = [centerLon, centerLat]
  CITIES.forEach(([lon, lat], index) => {
    if (geoDistance([lon, lat], centre) > Math.PI / 2 - 0.08) return
    const point = projection([lon, lat])
    if (!point) return
    const pulse = ((time * 0.6 + index * 0.37) % 1)
    ctx.strokeStyle = 'rgba(255,85,0,' + (0.7 * (1 - pulse)).toFixed(3) + ')'
    ctx.lineWidth = 1.4 * sc
    ctx.beginPath()
    ctx.arc(point[0], point[1], (3 + pulse * 9) * sc, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#FF5500'
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1.5 * sc
    ctx.beginPath()
    ctx.arc(point[0], point[1], 3 * sc, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })

  // Crisp white rim + soft outer halo.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 5 * sc
  ctx.beginPath()
  ctx.arc(cx0, cy0, R + 3 * sc, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1.5 * sc
  ctx.beginPath()
  ctx.arc(cx0, cy0, R, 0, Math.PI * 2)
  ctx.stroke()

  // 3) front half of the orbit (and plane when it is in front of the globe)
  drawOrbit(true)
  if (planeInFront) drawPlane()
}

export function WorldGlobe({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let frame = 0
    let size = 0

    const resize = () => {
      const width = canvas.clientWidth
      if (!width) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = width
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(width * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduceMotion) draw(ctx, size, 2)
    }

    const tick = (now: number) => {
      if (size) draw(ctx, size, (now - start) / 1000)
      frame = requestAnimationFrame(tick)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    if (!reduceMotion) frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className={cx('world-globe-canvas', className)}
      role="img"
      aria-label="Rotating 3D world globe with an airplane flying along a glowing orbital trail"
    />
  )
}
