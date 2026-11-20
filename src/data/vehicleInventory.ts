import { getVehicleVisual } from '../lib/vehicleVisuals'

export const CAR_ROWS:Array<[string,string,number,string]>=[
['Toyota Yaris','Economy & Compact',27,'Automatic'],['Suzuki Swift','Economy & Compact',24,'Manual'],['Kia Picanto','Economy & Compact',23,'Automatic'],['Nissan Micra','Economy & Compact',25,'Manual'],['Hyundai i10','Economy & Compact',26,'Automatic'],
['Toyota Corolla','Sedan & Executive',39,'Automatic'],['Honda Civic','Sedan & Executive',48,'Automatic'],['Toyota Camry','Sedan & Executive',68,'Automatic'],['BMW 3 Series','Sedan & Executive',92,'Automatic'],['Mercedes C-Class','Sedan & Executive',105,'Automatic'],['Audi A4','Sedan & Executive',98,'Automatic'],['Hyundai Elantra','Sedan & Executive',44,'Automatic'],
['Hyundai Tucson','SUV & 4x4',62,'Automatic'],['Toyota Fortuner','SUV & 4x4',105,'Automatic'],['Toyota Prado','SUV & 4x4',145,'Automatic'],['Toyota Land Cruiser','SUV & 4x4',190,'Automatic'],['Range Rover Sport','SUV & 4x4',220,'Automatic'],['Nissan X-Trail','SUV & 4x4',76,'Automatic'],['Kia Sportage','SUV & 4x4',59,'Automatic'],['Mitsubishi Pajero','SUV & 4x4',115,'Automatic'],
['Mercedes E-Class','Luxury & Sports',145,'Automatic'],['Mercedes S-Class','Luxury & Sports',260,'Automatic'],['Audi A6','Luxury & Sports',155,'Automatic'],['Porsche 911','Sports & Performance',390,'Automatic'],['BMW 5 Series','Luxury & Sports',175,'Automatic'],
['Hyundai Staria','Van / 7-Seater Family',88,'Automatic'],['Kia Carnival','Van / 7-Seater Family',96,'Automatic'],['Toyota HiAce','Van / 7-Seater Family',110,'Manual'],['Toyota Innova','Van / 7-Seater Family',72,'Automatic'],['Honda Odyssey','Van / 7-Seater Family',84,'Automatic']]

export const TRANSFER_ROWS:Array<[string,string,number,string,string[]]>=[
['Standard Private Sedan','Private Sedan',34,'1-3 Pax • 2 Bags',['Free waiting time','Flight tracking']],['Business / VIP Sedan','Business / VIP Sedan',58,'1-3 Pax • 2 Bags',['Meet & greet included','Flight tracking']],['Family Minivan / MPV','Family Minivan / MPV',62,'1-6 Pax • 5 Bags',['Family luggage space','Free waiting time']],['Executive SUV','Executive SUV',76,'1-5 Pax • 4 Bags',['Premium comfort','Flight tracking']],['Minibus / Sprinter','Minibus / Sprinter Group Transfer',115,'7-14 Pax • 12 Bags',['Group pickup','Free waiting time']],['Shared Airport Shuttle','Shared Shuttle',15,'1-2 Pax • 1 Bag',['Scheduled service','Airport pickup']],['Premium Airport Sedan','Private Sedan',42,'1-3 Pax • 2 Bags',['60 min waiting','Flight tracking']],['Luxury Chauffeur Sedan','Business / VIP Sedan',95,'1-3 Pax • 2 Bags',['Meet & greet included','Professional chauffeur']],['Large Family MPV','Family Minivan / MPV',72,'1-6 Pax • 5 Bags',['Child-seat request','Free waiting time']],['Premium 4x4 Transfer','Executive SUV',88,'1-5 Pax • 4 Bags',['4x4 vehicle','Flight tracking']],['Executive Sprinter','Minibus / Sprinter Group Transfer',145,'7-14 Pax • 12 Bags',['Meet & greet','Group luggage']],['Economy Shared Van','Shared Shuttle',19,'1-3 Pax • 2 Bags',['Shared ride','Airport pickup']],['Comfort Private Sedan','Private Sedan',38,'1-3 Pax • 2 Bags',['Free waiting time','Door-to-door']],['VIP Business Class','Business / VIP Sedan',68,'1-3 Pax • 2 Bags',['Meet & greet included','Flight tracking']],['Premium MPV Transfer','Family Minivan / MPV',79,'1-6 Pax • 5 Bags',['Family friendly','Free waiting time']],['Luxury SUV Chauffeur','Executive SUV',112,'1-5 Pax • 4 Bags',['Premium vehicle','Flight tracking']],['Private Group Minibus','Minibus / Sprinter Group Transfer',165,'7-14 Pax • 12 Bags',['Private group ride','Free waiting time']],['Shared City Connector','Shared Shuttle',22,'1-2 Pax • 1 Bag',['Fixed route','Scheduled pickup']],['Airport Meet & Greet Sedan','Private Sedan',45,'1-3 Pax • 2 Bags',['Name-board pickup','Flight tracking']],['Long-Wheelbase Sprinter','Minibus / Sprinter Group Transfer',185,'7-14 Pax • 14 Bags',['Large group','Meet & greet']]]

export const HOME_SHOWCASE_CARS = [
{name:'Toyota Yaris',category:'Economy Hatchback',price:16,supplier:'Europcar',rating:'8.6'},
{name:'Toyota Camry',category:'Mid-size Sedan',price:30,supplier:'Hertz',rating:'8.4'},
{name:'MG ZS / Hyundai Tucson',category:'SUV & 4x4',price:36,supplier:'Avis',rating:'8.9'},
{name:'Toyota Prado',category:'Full-Size SUV',price:72,supplier:'Sixt',rating:'8.7'}
] as const

// Exact local assets for the existing inventory; new rows use a class fallback.
export function getInventoryVehicleVisual(title:string,category:string){
  const carIndex = CAR_ROWS.findIndex(row => row[0] === title);
  if (carIndex >= 0) {
    const visual = getVehicleVisual(title, category);
    return { ...visual, src: `/vehicles/car-${String(carIndex + 1).padStart(2, '0')}.jpg` };
  }
  const transferIndex = TRANSFER_ROWS.findIndex(row => row[0] === title);
  if (transferIndex >= 0) {
    const visual = getVehicleVisual(title, category);
    return { ...visual, src: `/vehicles/transfer-${String(transferIndex + 1).padStart(2, '0')}.jpg` };
  }
  const fallback = getVehicleVisual(title, category);
  // The combined home-showcase label uses the exact Hyundai Tucson inventory photo.
  if (title === 'MG ZS / Hyundai Tucson') {
    return { ...fallback, src: '/vehicles/car-13.jpg' };
  }
  const brands = ['Mercedes-Benz', 'Land Rover', 'Volkswagen', 'Mitsubishi', 'Toyota', 'Honda', 'Hyundai', 'Nissan', 'Suzuki', 'Kia', 'BMW', 'Audi', 'Porsche', 'Lexus', 'Ford', 'MG'];
  const brand = brands.find((name) => title.toLowerCase().startsWith(name.toLowerCase()));
  if (!brand) return fallback;
  const model = title.slice(brand.length).replace(/^\s+/, '').split(/\s*\/\s*/)[0].trim();
  if (!model) return fallback;
  const providerSrc = `/api/vehicle-image?make=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&fallback=${encodeURIComponent(fallback.src)}`;
  return { ...fallback, src: providerSrc };
}
