import { useState, type FormEvent } from 'react'

type ChatMessage = { role: 'user' | 'assistant'; content: string; provider?: string }

export function TravelAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I’m your Trexifly travel assistant. Ask me about routes, flights, stays, car hire, transfers or planning a trip.' },
  ])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = input.trim()
    if (!message || busy) return
    setInput('')
    setError('')
    setMessages((current) => [...current, { role: 'user', content: message }])
    setBusy(true)
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await response.json() as { reply?: string; error?: string; provider?: string }
      if (!response.ok) throw new Error(data.error || 'The travel assistant is temporarily unavailable.')
      if (!data.reply?.trim()) throw new Error('The assistant returned an empty response. Please try again.')
      setMessages((current) => [...current, { role: 'assistant', content: data.reply!.trim(), provider: data.provider }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the travel assistant. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[75] flex flex-col items-end gap-3">
      {open && <section aria-label="Trexifly AI travel assistant" className="flex h-[min(76vh,620px)] max-h-[calc(100vh-7rem)] w-[min(92vw,390px)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-[0_24px_80px_rgba(40,20,5,.24)]">
        <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF5500] to-[#E64A00] px-4 py-4 text-white">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-100">Trexifly AI</p><h2 className="text-base font-extrabold">Travel assistant</h2><p className="mt-0.5 text-[11px] text-orange-50">Ollama Cloud + free AI backup</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close travel assistant" className="rounded-full bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25">×</button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-[#FFFAF7] p-3" aria-live="polite">
          {messages.map((item, index) => <div key={index} className={item.role === 'user' ? 'ml-8 rounded-2xl rounded-br-sm bg-[#FF5500] px-3 py-2.5 text-sm leading-6 text-white' : 'mr-5 rounded-2xl rounded-bl-sm border border-orange-100 bg-white px-3 py-2.5 text-sm leading-6 text-slate-700'}>{item.content}{item.provider && <span className="mt-1 block text-[10px] text-slate-400">{item.provider === 'openrouter-free' ? 'Free model' : 'Ollama Cloud'}</span>}</div>)}
          {busy && <p className="mr-8 rounded-2xl bg-white px-3 py-2.5 text-xs text-slate-500">Thinking…</p>}
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        </div>
        <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-orange-100 bg-white p-3">
          <label className="sr-only" htmlFor="trexifly-ai-message">Ask a travel question</label>
          <textarea id="trexifly-ai-message" rows={2} maxLength={2000} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your next trip…" className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#FF5500]" />
          <button type="submit" disabled={busy || !input.trim()} className="rounded-xl bg-[#FF5500] px-4 py-3 text-sm font-bold text-white hover:bg-[#E64A00] disabled:cursor-not-allowed disabled:opacity-50">Send</button>
        </form>
      </section>}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close AI travel assistant' : 'Open AI travel assistant'} className="flex items-center gap-2 rounded-full bg-[#FF5500] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_32px_rgba(255,85,0,.35)] transition hover:-translate-y-0.5 hover:bg-[#E64A00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5500]"><span aria-hidden="true">✦</span> AI Travel Assistant</button>
    </div>
  )
}
