import type { SyntheticEvent } from 'react'

/** Local, always-available placeholder shown when a remote photo fails to load. */
export const FALLBACK_IMAGE = '/destination-fallback.svg'

/** onError handler for <img>: swaps in the local placeholder once, never loops. */
export function imgFallback(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget
  if (img.dataset.fallback === '1') return
  img.dataset.fallback = '1'
  img.src = FALLBACK_IMAGE
}
