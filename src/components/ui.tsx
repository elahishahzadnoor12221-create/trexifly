import type { ComponentProps, ReactNode } from 'react'

import { cx } from '../lib/cx'
import { PROVIDERS, type ProviderId } from '../lib/data'
import { Icon, type IconName } from './Icons'

export function Button({
  variant = 'gold',
  className,
  children,
  ...rest
}: ComponentProps<'button'> & { variant?: 'gold' | 'ghost' }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-pill px-5 py-3 text-sm font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'gold'
          ? 'bg-[linear-gradient(100deg,#f7dda8,#f2c879_46%,#e0aa58)] text-[#0b1020] shadow-gold hover:brightness-105'
          : 'border border-white/15 bg-white/[0.04] text-ink hover:bg-white/[0.09]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  icon,
  children,
  className,
}: {
  label: string
  icon: IconName
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('glass-field flex min-w-0 flex-col justify-center gap-0.5 rounded-field px-3 py-2', className)}>
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
        <Icon name={icon} className="size-3" strokeWidth={1.9} />
        {label}
      </span>
      {children}
    </div>
  )
}

export function Input({ className, ...rest }: ComponentProps<'input'>) {
  return (
    <input
      className={cx('w-full min-w-0 bg-transparent text-[13.5px] font-medium text-ink outline-none placeholder:text-faint', className)}
      {...rest}
    />
  )
}

export function Select({ className, children, ...rest }: ComponentProps<'select'>) {
  return (
    <div className="relative min-w-0">
      <select
        className={cx(
          'w-full appearance-none truncate bg-transparent pr-5 text-[13.5px] font-medium text-ink outline-none',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-0 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
    </div>
  )
}

export function Pill({ active, className, ...rest }: ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cx(
        'rounded-pill border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-jade/50 bg-jade/15 text-jade-soft'
          : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/25 hover:text-ink',
        className,
      )}
      {...rest}
    />
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div role="group" className={cx('flex gap-1 rounded-[12px] bg-black/25 p-1', className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cx(
            'flex-1 truncate rounded-[9px] px-2 py-1.5 text-[11px] font-medium transition',
            value === option ? 'bg-ink text-white shadow-sm' : 'text-muted hover:bg-white/10 hover:text-ink',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-0.5', className)} aria-label={`${count} of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true" opacity={index < count ? 1 : 0.22}>
          <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17.1l-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z" />
        </svg>
      ))}
    </span>
  )
}

export function ProviderMark({ providerId, className }: { providerId: ProviderId; className?: string }) {
  const provider = PROVIDERS[providerId]
  return (
    <span
      className={cx(
        'grid size-10 shrink-0 place-items-center rounded-[13px] text-[13px] font-bold text-white ring-1 ring-white/20',
        className,
      )}
      style={{ background: `linear-gradient(150deg, ${provider.color} 0%, ${provider.color}66 58%, rgba(6,12,24,0.92) 100%)` }}
      aria-hidden="true"
    >
      {provider.mark}
    </span>
  )
}
