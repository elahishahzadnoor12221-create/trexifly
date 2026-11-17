import type { ReactNode } from 'react'

import { cx } from '../lib/cx'

type Variant = 'banner' | 'rail' | 'inline'

const HEIGHT: Record<Variant, string> = {
  banner: 'min-h-[132px]',
  rail: 'min-h-[196px]',
  inline: 'min-h-[104px]',
}

/**
 * Modular mount point for affiliate / white-label widgets.
 *
 * - `data-affiliate-slot` and `data-affiliate-variant` identify the frame, so a
 *   partner script can target it, e.g. `document.querySelector('[data-affiliate-slot="results-inline"]')`.
 * - Pass the widget as `children` to render it inside the reserved frame.
 * - The frame keeps its height whether or not a script has loaded, so the
 *   layout never jumps.
 *
 * Slots in use: `results-rail`, `results-inline`, `results-booking`, `home-partner-band`.
 */
export function AffiliateWidgetSlot({
  id,
  variant = 'banner',
  label = 'Partner offer',
  className,
  children,
}: {
  id: string
  variant?: Variant
  label?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      data-affiliate-slot={id}
      data-affiliate-variant={variant}
      className={cx(
        'relative flex flex-col justify-center gap-2 overflow-hidden rounded-card border border-dashed border-white/15 bg-white/[0.015] p-4',
        HEIGHT[variant],
        className,
      )}
    >
      <span className="absolute right-3 top-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-faint/80">
        Sponsored
      </span>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-faint">{label}</p>

      {children ?? (
        <>
          <div className="h-2.5 w-2/3 animate-shimmer rounded-pill bg-white/10" />
          <div className="h-2.5 w-1/2 animate-shimmer rounded-pill bg-white/[0.07] [animation-delay:300ms]" />
          <p className="mt-0.5 text-[10px] text-faint/80">White-label widget mounts here.</p>
        </>
      )}
    </div>
  )
}
