import { useRef, type PointerEvent } from 'react'

import { cx } from '../lib/cx'

const RADIUS = 170
const MERIDIANS = Array.from({ length: 12 }, (_, index) => index * 15)
const PARALLELS = [-60, -40, -20, 0, 20, 40, 60].map((lat) => {
  const radians = (lat * Math.PI) / 180
  return { lat, z: RADIUS * Math.sin(radians), scale: Math.cos(radians) }
})
const MARKERS = [
  { city: 'Dubai', lat: 25, lon: 55 },
  { city: 'London', lat: 51, lon: 0 },
  { city: 'Istanbul', lat: 41, lon: 29 },
  { city: 'Hunza', lat: 36, lon: 74 },
  { city: 'Cairo', lat: 30, lon: 31 },
]

/**
 * A CSS 3D wireframe globe: twelve meridians, seven parallels and five city
 * markers inside a `preserve-3d` context that auto-spins, plus a pointer
 * parallax tilt. No WebGL, so it stays light on mobile and needs no canvas.
 */
export function GlobeStage({ className }: { className?: string }) {
  const stage = useRef<HTMLDivElement>(null)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = stage.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--mx', String((event.clientX - rect.left) / rect.width - 0.5))
    element.style.setProperty('--my', String((event.clientY - rect.top) / rect.height - 0.5))
  }

  const reset = () => {
    const element = stage.current
    if (!element) return
    element.style.setProperty('--mx', '0')
    element.style.setProperty('--my', '0')
  }

  return (
    <div
      ref={stage}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={cx('globe-stage', className)}
    >
      <div className="globe-aura" aria-hidden="true" />

      <div className="globe-tilt" aria-hidden="true">
        <div className="globe-sphere" />
        <div className="globe-grid">
          {MERIDIANS.map((degrees) => (
            <div key={`meridian-${degrees}`} className="globe-meridian" style={{ transform: `rotateY(${degrees}deg)` }} />
          ))}
          {PARALLELS.map((parallel) => (
            <div
              key={`parallel-${parallel.lat}`}
              className="globe-parallel"
              style={{ transform: `rotateX(90deg) translateZ(${parallel.z}px) scale(${parallel.scale})` }}
            />
          ))}
          {MARKERS.map((marker) => (
            <div
              key={marker.city}
              className="globe-marker"
              style={{ transform: `rotateY(${marker.lon}deg) rotateX(${-marker.lat}deg) translateZ(${RADIUS}px)` }}
            >
              <span />
            </div>
          ))}
        </div>

        <div className="globe-orbit">
          <div className="orbit-runner">
            <div className="orbit-dot" />
          </div>
        </div>
        <div className="globe-orbit globe-orbit--b">
          <div className="orbit-runner">
            <div className="orbit-dot" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 top-10 hidden animate-float lg:block">
        <div className="glass-soft rounded-2xl px-3 py-2">
          <p className="text-[9px] uppercase tracking-[0.18em] text-faint">Live fare</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            ISB → DXB <span className="text-gold">$412</span>
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-0 hidden animate-float-slow lg:block">
        <div className="glass-soft rounded-2xl px-3 py-2">
          <p className="text-[9px] uppercase tracking-[0.18em] text-faint">Hotel · 4 nights</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            Istanbul <span className="text-jade">$689</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/** Decorative contour lines, standing in for a topographic terrain map. */
export function Topography({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 620"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: 7 }, (_, index) => (
        <path
          key={index}
          d={`M-60 ${470 + index * 24} C 140 ${404 + index * 22}, 262 ${498 + index * 18}, 430 ${452 + index * 24} S 648 ${356 + index * 26}, 812 ${420 + index * 22} S 1014 ${502 + index * 18}, 1240 ${436 + index * 20}`}
          stroke={index % 2 === 0 ? 'rgba(47,216,160,0.20)' : 'rgba(242,200,121,0.18)'}
          strokeWidth={1}
        />
      ))}
    </svg>
  )
}

