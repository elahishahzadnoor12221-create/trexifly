import { useEffect, useMemo, useState } from 'react'

type PriceDay = { date: string; price: number; currency: string }
type Props = {
  value: string
  onChange: (date: string) => void
  returnValue: string
  onReturnChange: (date: string) => void
  origin: string
  destination: string
  tripType: string
  onTripTypeChange: (type: string) => void
}
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1)
const todayKey = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` }
const airportCode = (value: string) => value.match(/\(([A-Z]{3})\)/i)?.[1]?.toUpperCase() ?? value.match(/\b([A-Z]{3})\b/)?.[1] ?? ''
const monthLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
const money = (amount: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: /^[A-Z]{3}$/.test(currency) ? currency : 'USD', maximumFractionDigits: 0 }).format(amount)

export function FlightDatePicker({ value, onChange, returnValue, onReturnChange, origin, destination, tripType, onTripTypeChange }: Props) {
  const firstAllowed = startOfMonth(new Date())
  const lastAllowed = addMonths(firstAllowed, 11)
  const maxStartMonth = addMonths(firstAllowed, 10)
  const initialMonth = startOfMonth(value ? new Date(value + 'T00:00:00') : new Date())
  const [visibleMonth, setVisibleMonth] = useState(() => initialMonth > maxStartMonth ? maxStartMonth : initialMonth)
  const [prices, setPrices] = useState<Record<string, PriceDay>>({})
  const [loading, setLoading] = useState(false)
  const [calendarNotice, setCalendarNotice] = useState('')
  const [open, setOpen] = useState(false)
  const [selectionStep, setSelectionStep] = useState<'departure' | 'return' | 'complete'>('departure')
  const firstCode = airportCode(origin), secondCode = airportCode(destination)
  const today = todayKey()
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => addMonths(firstAllowed, index)), [firstAllowed.getFullYear(), firstAllowed.getMonth()])
  const secondMonth = addMonths(visibleMonth, 1)
  const monthList = [visibleMonth, secondMonth].filter(month => month <= lastAllowed)

  useEffect(() => { setPrices({}) }, [firstCode, secondCode, tripType, returnValue])
  useEffect(() => {
    if (!open || !firstCode || !secondCode) return
    const controller = new AbortController()
    setLoading(true)
    setCalendarNotice('')
    Promise.all(monthList.map(async month => {
      const params = new URLSearchParams({
        origin: firstCode,
        destination: secondCode,
        month: monthKey(month),
        one_way: String(tripType === 'One-way'),
        currency: 'USD',
        departure_at: value,
      })
      if (tripType !== 'One-way' && returnValue) params.set('return_at', returnValue)
      const response = await fetch('/api/flights/calendar?' + params.toString(), { signal: controller.signal, headers: { Accept: 'application/json' } })
      const payload = await response.json() as { prices?: PriceDay[]; message?: string; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Calendar prices are temporarily unavailable.')
      return payload
    })).then(payloads => {
      if (controller.signal.aborted) return
      const next: Record<string, PriceDay> = {}
      payloads.forEach(payload => (payload.prices ?? []).forEach(item => { next[item.date] = item }))
      setPrices(current => ({ ...current, ...next }))
      if (!Object.keys(next).length) setCalendarNotice(payloads.map(item => item.message).filter(Boolean).join(' '))
    }).catch(error => {
      if (!controller.signal.aborted) setCalendarNotice(error instanceof Error ? error.message : 'Calendar prices unavailable.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [open, firstCode, secondCode, visibleMonth.getFullYear(), visibleMonth.getMonth(), tripType, returnValue, value])

  const visibleMonthKeys = monthList.map(monthKey)
  const availablePrices = Object.values(prices).filter(item => item.date >= today && visibleMonthKeys.includes(item.date.slice(0, 7)))
  const cheapest = availablePrices.length ? Math.min(...availablePrices.map(item => item.price)) : null
  const selectedFare = prices[value]?.price
  const displayFare = selectedFare ?? cheapest
  const displayCurrency = prices[value]?.currency ?? availablePrices.find(item => item.price === cheapest)?.currency ?? 'USD'
  const canPrevious = visibleMonth > firstAllowed
  const canNext = visibleMonth < maxStartMonth
  const roundTripReady = tripType !== 'Round-trip' || (!!returnValue && returnValue >= value)

  const openCalendar = () => {
    setSelectionStep('departure')
    setOpen(current => !current)
  }

  const chooseDate = (date: string) => {
    if (selectionStep !== 'return') {
      onChange(date)
      if (tripType === 'One-way') {
        setOpen(false)
      } else {
        onReturnChange('')
        setSelectionStep('return')
      }
      return
    }
    if (date < value) return
    onReturnChange(date)
    setSelectionStep('complete')
  }

  const renderMonth = (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cells: Array<number | null> = [...Array(firstDay).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)]
    while (cells.length % 7) cells.push(null)
    return <section key={monthKey(month)} className="min-w-0">
      <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{monthLabel(month)}</h3><span className="text-[10px] text-slate-400">Lowest daily fares</span></div>
      <div className="grid min-w-0 grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day} className="py-1 text-[10px] font-bold text-slate-400">{day}</span>)}
        {cells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />
          const date = `${monthKey(month)}-${String(day).padStart(2, '0')}`
          const fare = prices[date]
          const disabled = date < today || (selectionStep === 'return' && date < value)
          const isDeparture = date === value
          const isReturn = tripType === 'Round-trip' && date === returnValue
          const isRangeMiddle = tripType === 'Round-trip' && !!returnValue && date > value && date < returnValue
          const isSelected = isDeparture || isReturn
          const isCheapest = !!fare && cheapest !== null && fare.price === cheapest
          const cellStyle = isSelected
            ? 'border-[#FF5500] bg-orange-50 text-orange-900 ring-2 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-100'
            : isRangeMiddle
              ? 'border-orange-100 bg-orange-50/80 text-orange-900 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100'
              : isCheapest
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800'
          return <button key={date} type="button" disabled={disabled} onClick={() => chooseDate(date)} aria-label={`${date}${fare ? ', ' + money(fare.price, fare.currency) : ', price unavailable'}`} aria-pressed={isSelected} className={'flex min-h-[46px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-lg border px-0.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-25 ' + cellStyle}>
            <span className="whitespace-nowrap text-xs font-bold">{day}</span>
            <span className={'mt-0.5 max-w-full truncate whitespace-nowrap text-[9px] font-semibold leading-3 ' + (isCheapest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}>{fare ? money(fare.price, fare.currency) : '—'}</span>
          </button>
        })}
      </div>
    </section>
  }

  return <div data-search-field="Departure / Return" className="relative min-w-0 flex-[1.15] border-b border-slate-200 px-2 py-1 sm:min-w-[170px] sm:border-b-0 sm:border-r lg:min-w-[175px] lg:flex-[1_1_190px] dark:border-slate-700">
    <span className="mb-1 block text-[11px] font-semibold text-slate-500">Departure</span>
    <button type="button" aria-expanded={open} aria-haspopup="dialog" onClick={openCalendar} className="w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#0F172A] hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800">{value || 'Choose departure date'} <span className="float-right text-slate-400">▦</span></button>
    {tripType === 'Round-trip' && <>
      <span className="mb-1 block text-[11px] font-semibold text-slate-500">Return</span>
      <button type="button" aria-expanded={open} aria-haspopup="dialog" onClick={openCalendar} className="w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#0F172A] hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800">{returnValue || 'Choose return date'} <span className="float-right text-slate-400">▦</span></button>
    </>}
    {open && <div role="dialog" aria-label="Flight price calendar" className="absolute left-0 top-full z-[100] mt-2 box-border h-auto max-h-[min(82vh,720px)] w-[min(94vw,760px)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:left-auto sm:right-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-extrabold text-slate-900 dark:text-white">Flexible flight dates</h2><p className="text-[11px] text-slate-500">Daily cached lowest fares · rolling 12-month window</p></div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Calendar trip type" className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            {(['Round-trip', 'One-way'] as const).map(type => <button key={type} type="button" aria-pressed={tripType === type} onClick={() => { onTripTypeChange(type); setSelectionStep('departure') }} className={'rounded-md px-3 py-2 text-xs font-bold transition ' + (tripType === type ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white')}>{type}</button>)}
          </div>
          <button type="button" aria-label="Previous month" disabled={!canPrevious} onClick={() => setVisibleMonth(month => addMonths(month, -1))} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-lg disabled:opacity-30 dark:border-slate-700">‹</button>
          <select aria-label="Calendar month" value={String(visibleMonth.getMonth())} onChange={event => { const selected = months.find(month => month.getMonth() === Number(event.target.value) && month.getFullYear() === visibleMonth.getFullYear()); if (selected) setVisibleMonth(selected > maxStartMonth ? maxStartMonth : selected) }} className="max-w-[105px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            {months.filter(month => month.getFullYear() === visibleMonth.getFullYear()).map(month => <option key={monthKey(month)} value={month.getMonth()}>{month.toLocaleDateString('en-US', { month: 'long' })}</option>)}
          </select>
          <select aria-label="Calendar year" value={String(visibleMonth.getFullYear())} onChange={event => { const selected = months.find(month => month.getFullYear() === Number(event.target.value) && month.getMonth() === visibleMonth.getMonth()) ?? months.find(month => month.getFullYear() === Number(event.target.value)); if (selected) setVisibleMonth(selected > maxStartMonth ? maxStartMonth : selected) }} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            {[...new Set(months.map(month => month.getFullYear()))].map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => setVisibleMonth(month => addMonths(month, 1))} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-lg disabled:opacity-30 dark:border-slate-700">›</button>
        </div>
      </div>
      <p className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-300" aria-live="polite">{tripType === 'One-way' ? 'Choose your departure date' : selectionStep === 'departure' ? '1. Choose departure date' : selectionStep === 'return' ? '2. Choose return date (dates before departure are disabled)' : 'Departure and return selected. Review your trip and continue.'}</p>
      <div className="grid gap-5 md:grid-cols-2">{monthList.map(renderMonth)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
        <p className="min-w-0 break-words text-[10px] text-slate-500">Green = cheapest date with cached fare. Orange = selected trip range. Prices are indicative and may change.</p>
        {loading && <span role="status" className="text-[10px] text-slate-500">Loading fares…</span>}
      </div>
      {calendarNotice && <p role="status" className="mt-2 min-w-0 break-words text-xs text-amber-700 dark:text-amber-300">{calendarNotice}</p>}
      <button type="button" disabled={!value || value < today || !roundTripReady} onClick={() => setOpen(false)} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">Select for {tripType === 'One-way' ? 'one-way trip' : 'round-trip'}{displayFare ? ' — from ' + money(displayFare, displayCurrency) : ''}</button>
    </div>}
  </div>
}
