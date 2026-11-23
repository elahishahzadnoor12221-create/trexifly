import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router'

import { Footer, Header, MobileTabBar } from './components/Chrome'
import { PrefsProvider } from './lib/prefs'
import { Home } from './pages/Home'
import { Results } from './pages/Results'
import { MyTrips } from './pages/MyTrips'
import { Landing, type LandingConfig } from './pages/Landing'
import { GuidesPage, LegalPage, WhatsAppFloat } from './pages/TrustPages'
import { GuideIndexEnhancements, TravelGuideArticle } from './pages/TravelGuidePages'
import { TravelAssistant } from './components/TravelAssistant'
import { AdminAlertsPage } from './pages/AdminAlertsPage'
import { StaysGuideArticle, StaysGuideIndex } from './pages/StaysGuides'

const seoPages: LandingConfig[] = [
  {
    path: '/flights/lahore-to-dubai', title: 'Flights from Lahore to Dubai | Compare Airfares | Trexifly',
    description: 'Compare flight options from Lahore (LHE) to Dubai (DXB), check travel dates and review airline booking details with Trexifly.',
    eyebrow: 'Pakistan to UAE flights', heading: 'Flights from Lahore to Dubai',
    intro: 'Explore flight options between Allama Iqbal International Airport and Dubai International Airport. Compare travel dates, airlines, journey duration and booking conditions.',
    search: { type: 'flights', from: 'Lahore (LHE)', to: 'Dubai (DXB)' },
    faqs: [
      { question: 'How long is a flight from Lahore to Dubai?', answer: 'Non-stop flight duration varies by airline and schedule. Check the selected itinerary for its exact departure and arrival times.' },
      { question: 'Which airlines fly from Lahore to Dubai?', answer: 'Airline schedules change. Compare available operators and confirm the current route directly with the booking provider.' },
      { question: 'Can I compare return flights?', answer: 'Yes. Choose departure and return dates in the search form to explore round-trip options.' },
    ],
  },
  {
    path: '/flights/islamabad-to-london', title: 'Flights from Islamabad to London | Compare Airfares | Trexifly',
    description: 'Explore flights from Islamabad to London. Compare dates, connections, airlines and booking options on Trexifly.',
    eyebrow: 'Pakistan to United Kingdom flights', heading: 'Flights from Islamabad to London',
    intro: 'Compare journey options from Islamabad International Airport to London airports. Review connections, total travel time, baggage terms and provider details before booking.',
    search: { type: 'flights', from: 'Islamabad (ISB)', to: 'London (LHR)' },
    faqs: [
      { question: 'Are there direct flights from Islamabad to London?', answer: 'Direct and connecting schedules depend on the travel date and airline. Check current schedules in the results and confirm with the airline.' },
      { question: 'Which London airport should I choose?', answer: 'Compare the arrival airport, onward transport and total journey cost when choosing an itinerary.' },
      { question: 'How can I compare baggage allowances?', answer: 'Review the baggage allowance displayed by the airline or booking provider for the exact fare before purchase.' },
    ],
  },
  {
    path: '/hotels/hunza-valley', title: 'Hotels in Hunza Valley, Pakistan | Compare Stays | Trexifly',
    description: 'Explore hotels and stays in Hunza Valley, Pakistan. Compare locations, dates and accommodation options with Trexifly.',
    eyebrow: 'Pakistan hotel search', heading: 'Hotels in Hunza Valley',
    intro: 'Find accommodation options around Karimabad, Aliabad and the wider Hunza Valley. Compare location, stay dates, guest details and property policies.',
    search: { type: 'hotels', to: 'Hunza' },
    faqs: [
      { question: 'When is a good time to visit Hunza Valley?', answer: 'Spring, summer and autumn each offer different scenery and road conditions. Check local weather and access conditions for your dates.' },
      { question: 'Where should I stay in Hunza?', answer: 'Karimabad and Aliabad are common bases. Choose a property based on transport, views, accessibility and your itinerary.' },
      { question: 'Are hotel prices guaranteed?', answer: 'Displayed prices are indicative until confirmed by the accommodation provider. Taxes, availability and policies may change.' },
    ],
  },
  {
    path: '/hotels/skardu', title: 'Hotels in Skardu, Pakistan | Compare Stays | Trexifly',
    description: 'Compare accommodation options in Skardu, Pakistan. Check stay dates, guest details and property booking terms.',
    eyebrow: 'Pakistan hotel search', heading: 'Hotels in Skardu',
    intro: 'Explore stays in Skardu for trips to Shangrila, Satpara Lake and the surrounding mountain region. Compare property locations and booking conditions.',
    search: { type: 'hotels', to: 'Skardu' },
    faqs: [
      { question: 'Where are hotels located in Skardu?', answer: 'Accommodation is available in and around Skardu town and nearby scenic areas. Check distance to your planned attractions and transport.' },
      { question: 'Should I book accommodation in advance?', answer: 'Advance booking can be useful during busy travel periods. Confirm cancellation rules and road or flight access for your dates.' },
      { question: 'Do hotel rates include taxes?', answer: 'Tax and fee treatment varies by property and booking provider. Review the final price breakdown before confirming.' },
    ],
  },
  {
    path: '/tours/northern-areas-pakistan', title: 'Northern Areas Pakistan Tours | Hunza & Skardu Trips | Trexifly',
    description: 'Explore tours in northern Pakistan, including Hunza Valley and Skardu. Compare trip styles, durations and booking options.',
    eyebrow: 'Pakistan tours & experiences', heading: 'Tours in Northern Areas of Pakistan',
    intro: 'Plan a northern Pakistan journey through Hunza, Skardu, the Karakoram landscapes and nearby valleys. Explore trip durations and group, family or private travel options.',
    search: { type: 'tours', to: 'Hunza Valley' },
    faqs: [
      { question: 'Which destinations are popular in northern Pakistan?', answer: 'Hunza Valley, Skardu, Khunjerab Pass, Attabad Lake and the Shangrila area are among the well-known destinations.' },
      { question: 'How many days are needed for a northern areas tour?', answer: 'Trip length depends on route, road conditions, weather and activities. Allow flexibility for mountain travel and local conditions.' },
      { question: 'Are tours available as private or family trips?', answer: 'Tour formats vary by operator. Check the itinerary, inclusions, group size and cancellation terms with the provider.' },
    ],
  },
]

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
  return null
}

function NotFound() {
  return <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 text-center">
    <p className="eyebrow text-rose">404</p>
    <h1 className="mt-3 font-display text-3xl font-semibold text-ink">This route has not taken off.</h1>
    <p className="mt-3 text-sm text-muted">The page you were looking for is not in the network.</p>
    <Link to="/" className="mt-6 rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-white">Back to search</Link>
  </div>
}

export function App() {
  return <BrowserRouter><PrefsProvider>
    <ScrollManager />
    <a href="#main" className="sr-only z-[70] rounded-pill bg-ink px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
    <Header />
    <main id="main"><Routes>
      <Route index element={<Home />} />
      <Route path="admin/alerts" element={<AdminAlertsPage />} />
      <Route path="results" element={<Results />} />
      <Route path="my-trips" element={<MyTrips />} />
      <Route path="about" element={<LegalPage page="about" />} />
      <Route path="contact" element={<LegalPage page="contact" />} />
      <Route path="privacy" element={<LegalPage page="privacy" />} />
      <Route path="terms" element={<LegalPage page="terms" />} />
      <Route path="affiliate-disclosure" element={<LegalPage page="affiliate-disclosure" />} />
      <Route path="guides" element={<><GuideIndexEnhancements /><StaysGuideIndex /><GuidesPage /></>} />
      <Route path="guides/stays-dubai-makkah" element={<StaysGuideArticle guide="dubai-makkah" />} />
      <Route path="guides/stays-london-europe" element={<StaysGuideArticle guide="london-europe" />} />
      <Route path="guides/stays-new-york-toronto" element={<StaysGuideArticle guide="new-york-toronto" />} />
      <Route path="guides/stays-sydney-auckland" element={<StaysGuideArticle guide="sydney-auckland" />} />
      <Route path="guides/stays-northern-pakistan" element={<StaysGuideArticle guide="northern-pakistan" />} />
      <Route path="guides/international-airport-transfers" element={<TravelGuideArticle guide="transfers" />} />
      <Route path="guides/hunza-skardu-best-time" element={<TravelGuideArticle guide="northern" />} />
      <Route path="guides/smart-flight-comparison-tips" element={<TravelGuideArticle guide="flights" />} />
      <Route path="guides/northern-pakistan-road-safety-packing" element={<TravelGuideArticle guide="road" />} />
      {seoPages.map((page) => <Route key={page.path} path={page.path} element={<Landing config={page} />} />)}
      <Route path="*" element={<NotFound />} />
    </Routes></main>
    <Footer /><MobileTabBar /><WhatsAppFloat /><TravelAssistant />
  </PrefsProvider></BrowserRouter>
}
