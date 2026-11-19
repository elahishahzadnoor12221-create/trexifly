import { useEffect } from 'react'
import { Link } from 'react-router'
import { SearchWidget } from '../components/SearchWidget'
import { Icon } from '../components/Icons'
import type { SearchQuery } from '../lib/data'

export type LandingConfig = {
  path: string
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: string
  search: Partial<SearchQuery>
  faqs: { question: string; answer: string }[]
}

export function Landing({ config }: { config: LandingConfig }) {
  useEffect(() => {
    document.title = config.title
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', config.description)
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `https://trexifly.com${config.path}`
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    }
    let script = document.getElementById('landing-faq-schema') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'landing-faq-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)
    return () => {
      document.getElementById('landing-faq-schema')?.remove()
      document.querySelector('link[rel="canonical"]')?.remove()
    }
  }, [config])

  return (
    <div className="landing-page min-h-screen bg-abyss pb-12 pt-28 sm:pt-32">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-faint">
          <Link to="/" className="hover:text-ink">Home</Link><span className="mx-2">/</span><span>{config.eyebrow}</span>
        </nav>
        <section className="grid items-center gap-8 rounded-[28px] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 sm:p-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow text-rose">{config.eyebrow}</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{config.heading}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">{config.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5"><Icon name="check" className="size-4 text-rose" /> Compare booking options</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="shield" className="size-4 text-rose" /> Clear partner pricing</span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:p-4">
            <SearchWidget initial={config.search} compact />
          </div>
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">Plan your journey with confidence</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{config.description} Trexifly helps you explore available booking options and compare providers. Final prices, schedules, baggage rules and availability are confirmed on the booking partner's website.</p>
            <h2 className="mt-8 font-display text-xl font-semibold text-ink">Frequently asked questions</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {config.faqs.map((faq) => <details key={faq.question} className="py-4">
                <summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>)}
            </div>
          </div>
          <aside className="rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Travel smarter</p>
            <h2 className="mt-3 text-xl font-semibold">Compare options before you book</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Check dates, airport details and the provider's latest terms before confirming a reservation.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">Explore Trexifly</Link>
          </aside>
        </section>
      </div>
    </div>
  )
}
