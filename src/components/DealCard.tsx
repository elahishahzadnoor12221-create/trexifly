import { PROVIDERS, type Badge, type Deal } from '../lib/data'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'
import { Icon } from './Icons'
import { ProviderMark, Stars } from './ui'

function BadgePill({ label }: { label: Badge }) {
  const tone =
    label === 'Cheapest'
      ? 'bg-jade/20 text-jade-soft'
      : label === 'Fastest'
        ? 'bg-sky/20 text-sky'
        : 'bg-gold/15 text-gold'
  return (
    <span className={cx('rounded-pill px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide', tone)}>
      {label}
    </span>
  )
}

export function DealCard({ deal }: { deal: Deal }) {
  const { money } = usePrefs()
  const provider = PROVIDERS[deal.providerId]
  const cheapest = deal.badges.includes('Cheapest')

  return (
    <article
      className={cx(
        'group relative overflow-hidden rounded-card border p-4 transition sm:p-5',
        cheapest
          ? 'border-jade/35 bg-jade/[0.045]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3 sm:w-[52%]">
          <ProviderMark providerId={deal.providerId} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{provider.name}</span>
              {deal.badges.map((badge) => (
                <BadgePill key={badge} label={badge} />
              ))}
            </div>

            <p className="mt-1 truncate text-[13px] text-ink/90">{deal.title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-faint">
              <Icon name="clock" className="size-3" />
              {deal.subtitle}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-pill bg-jade/15 px-2 py-0.5 font-semibold text-jade-soft">
                {deal.score.toFixed(1)}
              </span>
              <span className="text-faint">{deal.reviews.toLocaleString()} reviews</span>
              <Stars count={deal.stars} className="text-gold" />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {deal.perks.map((perk) => (
                <span
                  key={perk}
                  className="flex items-center gap-1 rounded-pill border border-white/10 px-2 py-0.5 text-[10px] text-muted"
                >
                  <Icon name="check" className="size-2.5 text-jade" strokeWidth={2.6} />
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3 sm:w-[48%] sm:justify-end sm:border-0 sm:pt-0">
          <div className="text-right sm:mr-1">
            <p className="text-[10px] text-faint line-through">{money(deal.wasPrice)}</p>
            <p className="font-display text-xl font-semibold leading-tight text-ink">{money(deal.price)}</p>
            <p className="text-[10px] text-faint">{deal.priceUnit}</p>
          </div>

          {/* Affiliate redirect target — swap via buildAffiliateUrl in src/lib/affiliates.ts */}
          {deal.affiliateUrl ? <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            data-affiliate-provider={deal.providerId}
            className="inline-flex items-center gap-1.5 rounded-pill bg-[linear-gradient(100deg,#f7dda8,#f2c879_48%,#e0aa58)] px-4 py-2.5 text-[13px] font-semibold text-[#0b1020] shadow-gold transition hover:brightness-105 active:translate-y-px"
          >
            View Deal
            <Icon name="arrowUpRight" className="size-3.5" strokeWidth={2.2} />
          </a> : <span className="text-xs font-semibold text-muted">No verified partner link currently available.</span>}
        </div>
      </div>
    </article>
  )
}
