import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'

type GuideId = 'dubai-makkah' | 'london-europe' | 'new-york-toronto' | 'sydney-auckland' | 'northern-pakistan'

const guides: Record<GuideId, { path: string; title: string; description: string; intro: string; sections: { heading: string; paragraphs: string[]; bullets?: string[] }[] }> = {
  'dubai-makkah': {
    path: '/guides/stays-dubai-makkah',
    title: 'Where to Stay in Dubai and Makkah: Neighbourhoods, Transport and Hotel Planning',
    description: 'An independent planning guide to choosing accommodation in Dubai and Makkah, comparing locations, transport, guest needs and booking terms.',
    intro: 'Dubai and Makkah serve very different travel needs. Dubai is a large, multi-centre city where the right base depends on your itinerary; Makkah accommodation planning often revolves around access to Al Masjid al-Haram, mobility needs and the timing of a visit. This guide explains how to compare areas before choosing a property.',
    sections: [
      { heading: 'Choosing a base in Dubai', paragraphs: ['Downtown Dubai suits visitors prioritising the central business and sightseeing district, while Dubai Marina and Jumeirah offer a different mix of waterfront walks, dining and beach access. Deira and Bur Dubai can be practical starting points for travellers interested in older commercial districts and metro connections. Distances matter: a property described as “Dubai” may still be far from the places on your itinerary.', 'Before booking, map the hotel against your planned attractions, nearest Metro station, airport transfer point and typical travel times at the hours you expect to move around. Check whether the room rate includes taxes, breakfast, parking and any resort or tourism fees.'] , bullets: ['Downtown: central landmarks and business visits.', 'Dubai Marina / JBR: waterfront stays and dining.', 'Deira / Bur Dubai: historic districts and transport links.', 'Palm Jumeirah: resort-style stays; check transfer time to inland attractions.'] },
      { heading: 'Planning accommodation in Makkah', paragraphs: ['For a visit centred on the Grand Mosque, compare the walking route, slope, shuttle arrangements and building access—not only the straight-line distance shown on a map. Hotel names and room categories can be similar, so verify the exact tower, entrance, room occupancy and whether a shuttle is included. During busy religious travel periods, availability and rates can change quickly.', 'Travellers with older relatives, children or mobility requirements should ask the property about step-free access, lift capacity, drop-off points and the distance from the room to the transport or prayer areas. Confirm the current rules and services directly with the property or official authorities.'] },
      { heading: 'Compare the complete stay', paragraphs: ['Use the same dates, adults, children, child ages and room count across booking sites. Compare the final total after taxes and fees, cancellation deadlines, meal plan, payment currency and whether payment is due now or at the property. A low headline rate may exclude important items or have a stricter cancellation policy.', 'Trexifly comparison links open provider search pages with your selected destination and stay details. Partner pages control live inventory, final prices and booking terms.'] },
    ],
  },
  'london-europe': {
    path: '/guides/stays-london-europe',
    title: 'London and Europe Hotel Guide: Areas, Rail Connections and Booking Checks',
    description: 'Plan a London or European city stay with neighbourhood guidance, public transport considerations and a consistent hotel comparison checklist.',
    intro: 'A good European hotel base is one that fits the route you will actually travel. In London, Paris, Amsterdam, Rome and other major cities, the cheapest central-looking address may not be the most convenient once rail stations, airport transfers and daily journeys are considered.',
    sections: [
      { heading: 'Finding the right London neighbourhood', paragraphs: ['Westminster and the South Bank place visitors near major central sights, while Covent Garden and Soho are convenient for theatre, restaurants and central walks. Paddington can be useful for rail and airport connections; Kensington offers museums and residential streets. Canary Wharf is often more suitable for business travel than for a first-time sightseeing itinerary.', 'Check the nearest Underground or rail station, step-free access if needed, late-night transport and the distance from the station with luggage. London addresses can span several fare zones, so compare transport costs as part of the stay.'] },
      { heading: 'Planning multi-city Europe stays', paragraphs: ['For trips combining several countries, choose accommodation around the actual arrival station or airport and the first activities planned for each city. Rail stations with similar names can be far apart; confirm the station code and city before booking. Allow realistic time for cross-city transfers and check whether your hotel reception is staffed for a late arrival.', 'In historic centres, streets may be pedestrianised or have vehicle restrictions. Confirm the taxi drop-off point, luggage access and any local city tax. For apartment-style accommodation, review check-in instructions and cleaning or service fees.'] },
      { heading: 'Compare rates fairly', paragraphs: ['Compare identical occupancy and dates across providers. Review VAT or city tax, breakfast, cancellation windows, deposit requirements, room size and bed configuration. A “non-refundable” price should not be compared as if it offers the same flexibility as a refundable room.', 'For rail-heavy itineraries, a hotel near a useful station can save time, but weigh that convenience against noise, late-night activity and the neighbourhood you want to experience.'] },
    ],
  },
  'new-york-toronto': {
    path: '/guides/stays-new-york-toronto',
    title: 'New York and Toronto Hotel Guide: Neighbourhoods, Transit and Cross-Border Trips',
    description: 'Compare accommodation areas in New York City and Toronto, including transit access, airport journeys, taxes and booking conditions.',
    intro: 'New York City and Toronto are both large urban destinations with distinct neighbourhoods and transport patterns. Hotel selection is easier when you start with the activities on your itinerary, then compare the transit links and full cost of staying in each area.',
    sections: [
      { heading: 'Where to stay in New York City', paragraphs: ['Midtown Manhattan can be convenient for first-time visitors who want access to major rail hubs, theatres and central attractions. Lower Manhattan suits itineraries focused on the Financial District, waterfront and historic sites. Brooklyn neighbourhoods such as Downtown Brooklyn or Williamsburg may offer a different pace, but check the exact subway line and late-night journey to your planned destinations.', 'New York hotel room sizes, resort fees and tax treatment vary. Read the full price breakdown and confirm whether mandatory property fees are included in the displayed total. Check luggage storage, check-in age rules and cancellation conditions before paying.'] },
      { heading: 'Choosing a Toronto base', paragraphs: ['Downtown Toronto and the Entertainment District work well for many city-centre visits; the Waterfront and Harbourfront offer access to the lakefront, while Yorkville is known for shopping and cultural venues. North York may be practical for some business or family itineraries, but it is not interchangeable with downtown for daily travel time.', 'Check proximity to a subway or GO Transit station, the airport route and any planned day trips. If you are travelling between New York and Toronto, confirm border-crossing requirements separately and avoid booking non-refundable accommodation around an unconfirmed travel connection.'] },
      { heading: 'Taxes, fees and family occupancy', paragraphs: ['Compare the final total in the same currency and occupancy. Enter each child and age accurately, confirm whether a room can accommodate the whole party, and review local taxes, destination fees, parking and breakfast. A room advertised for two adults may not accept additional guests without a different room category.', 'Provider availability and prices can change between search and checkout. Recheck the property address, room terms and cancellation deadline on the booking page.'] },
    ],
  },
  'sydney-auckland': {
    path: '/guides/stays-sydney-auckland',
    title: 'Sydney and Auckland Accommodation Guide: Waterfronts, Transport and Seasonal Planning',
    description: 'Explore where to stay in Sydney and Auckland, how to plan airport transfers and what to check when comparing hotel rates.',
    intro: 'Sydney and Auckland are gateway cities for wider journeys across Australia and New Zealand. The best accommodation area depends on whether you are visiting for city attractions, a cruise or ferry connection, a business meeting, or onward travel.',
    sections: [
      { heading: 'Choosing a Sydney neighbourhood', paragraphs: ['Circular Quay and The Rocks place visitors near the harbour and central attractions. Darling Harbour is convenient for waterfront venues and family activities, while Surry Hills and the CBD provide access to dining and rail connections. Bondi and other beach suburbs offer a coastal experience but require more planning for daily journeys into the centre.', 'Check the airport rail or road transfer, luggage requirements and the location of the hotel entrance. If your itinerary includes a cruise, compare the hotel with the correct passenger terminal rather than assuming every harbour-side property is nearby.'] },
      { heading: 'Planning an Auckland stay', paragraphs: ['The Auckland CBD is a useful base for ferries, central business visits and many city attractions. Viaduct Harbour and Wynyard Quarter are waterfront options; Newmarket may suit shopping and some medical or university visits. If you plan to explore beyond the city, check the location of car collection, ferry terminals and the route out of the urban centre.', 'Weather and daylight vary by season. For outdoor activities, allow flexibility and check local transport timetables, ferry services and any event-related road closures close to travel.'] },
      { heading: 'Compare total costs and room suitability', paragraphs: ['Check local taxes, breakfast, parking, resort or facility fees, cancellation deadlines and the payment currency. For family stays, confirm bedding, child policies, cot availability and the maximum room occupancy. For longer stays, review laundry access and kitchen facilities if those matter to your itinerary.', 'A provider search is a starting point, not a confirmed reservation. Verify the final room description and terms before payment.'] },
    ],
  },
  'northern-pakistan': {
    path: '/guides/stays-northern-pakistan',
    title: 'Northern Pakistan Stays Guide: Hunza, Skardu, Naran and Seasonal Access',
    description: 'Plan accommodation in northern Pakistan with practical advice on valley bases, road access, weather flexibility and property verification.',
    intro: 'Accommodation in northern Pakistan ranges from town hotels and guesthouses to mountain lodges and seasonal resorts. A property’s location can shape the whole trip: road access, elevation, weather, electricity, heating and distance to services may matter as much as the room itself.',
    sections: [
      { heading: 'Hunza Valley: choose a base for your route', paragraphs: ['Karimabad is a common base for visitors exploring Baltit Fort, Altit Fort and central Hunza. Aliabad can be practical for services and road access, while properties around Attabad Lake or Passu offer a different landscape and longer drives to some facilities. Check the exact village and road approach rather than relying on a broad “Hunza” label.', 'Ask about heating, hot water, backup power, mobile coverage, parking and meal arrangements. In colder months, confirm whether the property is open and whether the access road is suitable for your vehicle.'] },
      { heading: 'Skardu and the wider Baltistan region', paragraphs: ['Skardu town is a practical base for shops, transport and onward journeys. Shangrila and Lower Kachura Lake are outside the centre; stays near Shigar, Khaplu or Deosai access points may require a different route and more time. Confirm transfer arrangements and the exact property location before booking.', 'Flights to northern airports and mountain roads can be affected by weather. Build buffer days into the itinerary and check current flight and road information close to departure. Avoid non-refundable arrangements when the transport plan is uncertain.'] },
      { heading: 'Seasonality, safety and responsible booking', paragraphs: ['Summer is a popular period for many valleys, while spring and autumn can bring variable temperatures and changing access. Winter conditions differ sharply by elevation and can affect road access, heating and property operations. Ask the accommodation provider for current opening dates and local conditions rather than assuming a listing is available year-round.', 'Compare room heating, hot water, meal options, cancellation terms, payment method and the property’s verified contact details. Respect local communities, minimise waste, follow local guidance around fragile landscapes and avoid leaving litter at lakes, trails or roadside viewpoints.'] },
    ],
  },
}

export function StaysGuideIndex() {
  return <section aria-label="Original hotel destination guides" className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#FF5500]">Stays destination guides</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Plan where to stay around the world</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Original neighbourhood and accommodation planning notes for major travel hubs.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.entries(guides) as [GuideId, typeof guides[GuideId]][]).map(([id, guide]) => <Link key={id} to={guide.path} className="group rounded-2xl border border-orange-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wider text-[#FF5500]">Destination stay guide</p><h3 className="mt-2 text-lg font-extrabold text-slate-900 group-hover:text-[#D94700]">{guide.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p><span className="mt-4 inline-block text-sm font-bold text-[#D94700]">Read guide →</span>
      </Link>)}
    </div>
  </section>
}

export function StaysGuideArticle({ guide }: { guide: GuideId }) {
  const item = guides[guide]
  const location = useLocation()
  useEffect(() => {
    document.title = item.title + ' | Trexifly'
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = item.description
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = 'https://trexifly.com' + item.path
  }, [item, location.pathname])
  return <div className="min-h-[65vh] bg-white">
    <header className="bg-[#FF5500] px-4 py-12 text-white sm:py-16"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/85">Trexifly original destination guide</p><h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">{item.title}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/95 sm:text-base">{item.description}</p></div></header>
    <article className="prose prose-slate mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p>{item.intro}</p>
      {item.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
      <h2>Hotel comparison checklist</h2><ul><li>Use matching check-in and check-out dates, guest counts and room counts across providers.</li><li>Confirm the exact property address, room category, bed type and occupancy rules.</li><li>Compare taxes, service fees, breakfast, deposits, payment currency and cancellation deadlines.</li><li>Check transport links, accessibility, check-in hours and property contact details.</li><li>Reconfirm live availability and the final payable amount on the booking provider's website.</li></ul>
      <p><strong>Editorial note:</strong> This guide is original general travel-planning information, not a live property review, weather forecast, local authority notice or guarantee of accommodation availability.</p>
      <div className="not-prose mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-extrabold text-slate-900">Compare stays on Trexifly</h2><p className="mt-2 text-sm leading-6 text-slate-700">Enter your destination, dates and guest details to open matching hotel searches with multiple booking providers.</p><Link to="/?tab=hotels#search-widget" className="mt-4 inline-flex rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white">Search Stays</Link></div>
    </article>
  </div>
}
