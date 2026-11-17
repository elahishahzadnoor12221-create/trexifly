// Remove deployment-incompatible files and prerender SEO landing and guide routes.
import { readdirSync, rmSync, statSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/client', import.meta.url))
function clean(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name.startsWith('.') || name.endsWith('.map')) { rmSync(path, { recursive: true, force: true }); continue }
    if (statSync(path).isDirectory()) clean(path)
  }
}
clean(dist)

const pages = [
  { path:'/flights/lahore-to-dubai', title:'Flights from Lahore to Dubai | Compare Airfares | Trexifly', description:'Compare flight options from Lahore (LHE) to Dubai (DXB), check travel dates and review airline booking details with Trexifly.', faqs:[['How long is a flight from Lahore to Dubai?','Non-stop flight duration varies by airline and schedule. Check the selected itinerary for exact times.'],['Which airlines fly from Lahore to Dubai?','Airline schedules change. Compare available operators and confirm current schedules with the provider.'],['Can I compare return flights?','Choose departure and return dates to explore round-trip options.']] },
  { path:'/flights/islamabad-to-london', title:'Flights from Islamabad to London | Compare Airfares | Trexifly', description:'Explore flights from Islamabad to London. Compare dates, connections, airlines and booking options on Trexifly.', faqs:[['Are there direct flights from Islamabad to London?','Schedules depend on travel date and airline. Confirm current schedules with the airline.'],['Which London airport should I choose?','Compare arrival airport, onward transport and total journey cost.'],['How can I compare baggage allowances?','Review baggage allowance for the exact fare before purchase.']] },
  { path:'/hotels/hunza-valley', title:'Hotels in Hunza Valley, Pakistan | Compare Stays | Trexifly', description:'Explore hotels and stays in Hunza Valley, Pakistan. Compare locations, dates and accommodation options with Trexifly.', faqs:[['When is a good time to visit Hunza Valley?','Spring, summer and autumn offer different scenery and road conditions. Check local weather for your dates.'],['Where should I stay in Hunza?','Karimabad and Aliabad are common bases. Choose based on transport and itinerary.'],['Are hotel prices guaranteed?','Displayed prices are indicative until confirmed by the accommodation provider.']] },
  { path:'/hotels/skardu', title:'Hotels in Skardu, Pakistan | Compare Stays | Trexifly', description:'Compare accommodation options in Skardu, Pakistan. Check stay dates, guest details and property booking terms.', faqs:[['Where are hotels located in Skardu?','Accommodation is available in Skardu town and nearby scenic areas. Check distance to attractions.'],['Should I book accommodation in advance?','Advance booking can help during busy periods. Confirm cancellation rules and access conditions.'],['Do hotel rates include taxes?','Tax and fee treatment varies by property. Review the final price breakdown.']] },
  { path:'/tours/northern-areas-pakistan', title:'Northern Areas Pakistan Tours | Hunza & Skardu Trips | Trexifly', description:'Explore tours in northern Pakistan, including Hunza Valley and Skardu. Compare trip styles, durations and booking options.', faqs:[['Which destinations are popular in northern Pakistan?','Hunza Valley, Skardu, Khunjerab Pass, Attabad Lake and Shangrila are well-known destinations.'],['How many days are needed for a northern areas tour?','Trip length depends on route, road conditions, weather and activities. Allow flexibility.'],['Are tours available as private or family trips?','Tour formats vary by operator. Check itinerary, inclusions, group size and cancellation terms.']] },
  { path:'/guides', title:'Travel Guides & Route Insights | Trexifly', description:'Read practical Trexifly travel guides covering international airport transfers and the best time to visit Hunza and Skardu, with seasonal and route-planning advice.', faqs:[['What can I learn from Trexifly travel guides?','Find practical information about airport transfers, seasonal travel, routes and trip preparation.']] },
  { path:'/guides/international-airport-transfers', title:'How to Book International Airport Transfers Smoothly: Step-by-Step Traveler Guide | Trexifly', description:'Learn how to plan an international airport transfer, choose the correct airport, enter a hotel address and compare transfer options online with Trexifly.', faqs:[['What details do I need to book an airport transfer?','Prepare your arrival date and time, airport code, flight number if requested, exact destination address, passenger count and luggage details.'],['Does an address suggestion confirm my pickup?','No. Address search suggestions are geocoding matches. Confirm the exact pickup and drop-off point with the transfer provider.'],['Are transfer rates guaranteed on Trexifly?','No. Check live availability, final rates and provider conditions on the partner booking page before paying.']] },
  { path:'/guides/hunza-skardu-best-time', title:'Best Time to Visit Hunza & Skardu: Seasonal Weather & Travel Preparation Guide | Trexifly', description:'Understand typical Hunza and Skardu seasons, mountain road access, flights, packing and practical preparation before travelling in northern Pakistan.', faqs:[['When is the best time to visit Hunza and Skardu?','Spring, summer and autumn offer different conditions. The best dates depend on intended activities, elevation, weather and current road access.'],['Are flights to Skardu and Gilgit guaranteed in summer?','No. Flights are subject to weather and airline operations and may be delayed, diverted or cancelled.'],['Can I drive over Babusar Top or visit Deosai in winter?','Access can be restricted or unsafe due to snow and weather. Check current official road and weather advisories before travel.']] }
]
const base = readFileSync(join(dist,'index.html'),'utf8')
for (const page of pages) {
  const canonical = 'https://trexifly.com' + page.path
  const faq = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity:page.faqs.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}})) }
  const html = base
    .replace(/<title>[^<]*<\/title>/, '<title>' + page.title + '</title>')
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, '<meta name="description" content="' + page.description + '" />')
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, '<link rel="canonical" href="' + canonical + '" />')
    .replace('</head>', '<script type="application/ld+json">' + JSON.stringify(faq) + '</script></head>')
  const target = join(dist,page.path.slice(1))
  mkdirSync(target,{recursive:true})
  writeFileSync(join(target,'index.html'),html)
  console.log('Prerendered ' + page.path)
}
