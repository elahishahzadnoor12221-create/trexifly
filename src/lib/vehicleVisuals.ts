// Clean studio-style vehicle visuals. No external/Unsplash URLs.
// Files live in public/vehicles/*.svg (served at /vehicles/...).

export type VehicleKey =
  | 'economy-hatchback' | 'midsize-sedan' | 'compact-suv' | 'fullsize-suv'
  | 'luxury-executive' | 'family-mpv-van' | 'airport-shuttle-minibus'

export interface VehicleVisual { key: VehicleKey; src: string; label: string; models: string }

const LABELS: Record<VehicleKey, { label: string; models: string }> = {
  'economy-hatchback': { label: 'Economy', models: 'Toyota Yaris, Kia Picanto, Suzuki Swift' },
  'midsize-sedan': { label: 'Sedan', models: 'Toyota Corolla, Honda Civic, Toyota Camry' },
  'compact-suv': { label: 'Compact SUV', models: 'Kia Sportage, Hyundai Tucson, Toyota RAV4' },
  'fullsize-suv': { label: 'Full-size SUV', models: 'Toyota Prado, Fortuner, Land Cruiser' },
  'luxury-executive': { label: 'Luxury', models: 'Mercedes E-Class, BMW 5 Series, Audi A6' },
  'family-mpv-van': { label: 'Van / MPV', models: 'Hyundai Staria, Kia Carnival, Toyota HiAce' },
  'airport-shuttle-minibus': { label: 'Shuttle', models: 'Mercedes Sprinter, Toyota Coaster' },
}

// Specific models first, then generic category words.
const RULES: [RegExp, VehicleKey][] = [
  [/coaster|sprinter|minibus|mini bus|shuttle|group transfer|\bbus\b/, 'airport-shuttle-minibus'],
  [/staria|carnival|hiace|v-class|vito|innova|odyssey|mpv|minivan|\bvan\b|people carrier|7.?seater family/, 'family-mpv-van'],
  [/executive suv|prado|fortuner|land ?cruiser|range rover|patrol|pajero|full.?size suv/, 'fullsize-suv'],
  [/sportage|tucson|\bzs\b|rav4|x-trail|compact suv|crossover|seltos|kicks/, 'compact-suv'],
  [/3 series|c-class|a4\b|corolla|civic|elantra|camry|altima|accord|sedan|saloon|midsize|mid-size|intermediate/, 'midsize-sedan'],
  [/e-class|s-class|5 series|7 series|a6|a8|porsche|911|luxury|executive|premium|sports/, 'luxury-executive'],
  [/yaris|picanto|swift|micra|i10|aqua|economy|mini|compact|hatchback|fiat 500|\bpolo\b/, 'economy-hatchback'],
  [/suv|4x4|jeep/, 'compact-suv'],
  [/transfer|taxi|private/, 'midsize-sedan'],
]

export function getVehicleVisual(title = '', category = ''): VehicleVisual {
  // Match the model/title first, then fall back to the category.
  const hit = RULES.find(([re]) => re.test(title.toLowerCase())) ?? RULES.find(([re]) => re.test(category.toLowerCase()))
  const key: VehicleKey = hit ? hit[1] : 'economy-hatchback'
  return { key, src: `/vehicles/${key}.svg`, ...LABELS[key] }
}
