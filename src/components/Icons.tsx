import type { ReactNode } from 'react'

export type IconName = 'plane'|'bed'|'car'|'compass'|'tag'|'globe'|'search'|'arrowRight'|'arrowUpRight'|'arrowLeft'|'star'|'check'|'chevronDown'|'calendar'|'users'|'mapPin'|'filter'|'close'|'clock'|'sparkles'|'shield'|'shieldCheck'
const PATHS: Record<IconName, ReactNode> = {
  plane:<><path d="M21 3 3 10.6l6.8 2.5L12.3 20 21 3Z"/><path d="m9.8 13.1 4.4-4.4"/></>,
  bed:<><path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 16h18"/><path d="M7 10V7.5A1.5 1.5 0 0 1 8.5 6h3A1.5 1.5 0 0 1 13 7.5V10"/></>,
  car:<><path d="M4 16.5V13l1.7-4.4a2 2 0 0 1 1.9-1.3h8.8a2 2 0 0 1 1.9 1.3L20 13v3.5"/><path d="M4 13h16"/><circle cx="7.6" cy="17" r="1.6"/><circle cx="16.4" cy="17" r="1.6"/></>,
  compass:<><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
  tag:<><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.6" cy="7.6" r="1.2"/></>,
  globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></>,
  arrowRight:<><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></>,
  arrowUpRight:<><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
  arrowLeft:<><path d="M20 12H5"/><path d="m11 6-6 6 6 6"/></>,
  star:<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17.1l-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z"/>,
  check:<path d="m4.5 12.5 4.6 4.6L19.5 6.7"/>,
  chevronDown:<path d="m6 9 6 6 6-6"/>,
  calendar:<><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></>,
  users:<><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M16 5.4a3.2 3.2 0 0 1 0 6.2"/><path d="M17.5 14.5a5.5 5.5 0 0 1 3 5"/></>,
  mapPin:<><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></>,
  filter:<path d="M4 7h16M7 12h10M10 17h4"/>,
  close:<path d="M6 6l12 12M18 6 6 18"/>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></>,
  sparkles:<><path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8 12 3.5Z"/><path d="m18.5 15.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/></>,
  shield:<path d="M12 3.5 19 6v5.8c0 4.4-2.9 7.4-7 8.8-4.1-1.4-7-4.4-7-8.8V6l7-2.5Z"/>,
  shieldCheck:<><path d="M12 3.5 19 6v5.8c0 4.4-2.9 7.4-7 8.8-4.1-1.4-7-4.4-7-8.8V6l7-2.5Z"/><path d="m8.5 12.2 2.2 2.2 4.8-5"/></>,
}
export function Icon({name,className='size-5',strokeWidth=1.6}:{name:IconName;className?:string;strokeWidth?:number}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{PATHS[name]}</svg>
}
