// Real vehicle photographs sourced from Wikimedia Commons.
// Attribution and license details are recorded beside each asset mapping.
export type VehicleKey =
  | 'economy-hatchback' | 'midsize-sedan' | 'compact-suv' | 'fullsize-suv'
  | 'luxury-executive' | 'family-mpv-van' | 'airport-shuttle-minibus'

export interface VehicleVisual { key: VehicleKey; src: string; label: string; models: string }

const VISUALS: Record<VehicleKey, VehicleVisual> = {
  // Toyota Yaris — Vauxford — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:2020_Toyota_Yaris_Design_HEV_CVT_1.5_Front.jpg
  'economy-hatchback': { key: 'economy-hatchback', src: '/vehicles/economy-hatchback.jpg', label: 'Economy', models: 'Toyota Yaris, Kia Picanto, Suzuki Swift' },
  // Toyota Camry — EurovisionNim — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:2018_Toyota_Camry_(ASV70R)_Ascent_sedan_(2018-08-27)_01.jpg
  'midsize-sedan': { key: 'midsize-sedan', src: '/vehicles/midsize-sedan.jpg', label: 'Sedan', models: 'Toyota Corolla, Honda Civic, Toyota Camry' },
  // Kia Sportage — LuvsMG481 — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:2025_Kia_Sportage_S_front_only.jpg
  'compact-suv': { key: 'compact-suv', src: '/vehicles/compact-suv.jpg', label: 'Compact SUV', models: 'Kia Sportage, Hyundai Tucson, Toyota RAV4' },
  // Toyota Land Cruiser 250 — Mr.choppers — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:2024_Toyota_Land_Cruiser_250_VX_in_Platinum_White_Pearl_Mica,_front_left.jpg
  'fullsize-suv': { key: 'fullsize-suv', src: '/vehicles/fullsize-suv.jpg', label: 'Full-size SUV', models: 'Toyota Prado, Fortuner, Land Cruiser' },
  // Mercedes-Benz E-Class — Alexander-93 — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:Mercedes-Benz_W214_1X7A1841.jpg
  'luxury-executive': { key: 'luxury-executive', src: '/vehicles/luxury-executive.jpg', label: 'Luxury', models: 'Mercedes E-Class, BMW 5 Series, Audi A6' },
  // Hyundai Staria — Alexander Migl — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:Hyundai_Staria_1X7A0321.jpg
  'family-mpv-van': { key: 'family-mpv-van', src: '/vehicles/family-mpv-van.jpg', label: 'Van / MPV', models: 'Hyundai Staria, Kia Carnival, Toyota HiAce' },
  // Mercedes-Benz Sprinter — Vauxford — CC BY-SA 4.0
  // https://commons.wikimedia.org/wiki/File:2019_Mercedes-Benz_Sprinter_314_CDi_2.1.jpg
  'airport-shuttle-minibus': { key: 'airport-shuttle-minibus', src: '/vehicles/airport-shuttle-minibus.jpg', label: 'Shuttle', models: 'Mercedes Sprinter, Toyota Coaster' },
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
  const hit = RULES.find(([re]) => re.test(title.toLowerCase())) ?? RULES.find(([re]) => re.test(category.toLowerCase()))
  const key: VehicleKey = hit ? hit[1] : 'economy-hatchback'
  return VISUALS[key]
}