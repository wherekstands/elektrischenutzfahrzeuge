/**
 * Initial taxonomy. See docs/taxonomy.md for the reasoning. Everything here is editable in the admin.
 *
 * Vehicle types: 9 groups → 38 types. A listing belongs to exactly one type. The type decides the
 * spec profile (group specs + type specs + universal specs) and the four key figures.
 * Jobs: 8 areas → 42 jobs. A listing can have many jobs.
 */
import type { Illustration } from '../../src/lib/constants'

type L10n = { name: string; slug: string; short?: string; synonyms?: string }

export type SeedType = {
  key: string
  en: L10n
  de: L10n
  illustration?: Illustration
  specs?: string[]
  keyFigures?: string[]
  alsoIn?: string[]
  children?: SeedType[]
}

export const TYPES: SeedType[] = [
  {
    key: 'vans',
    en: { name: 'Vans', slug: 'vans', short: 'Panel and crew vans up to 4.25 t for trades, service and delivery.', synonyms: 'e-van, electric van, delivery van, panel van, LCV, light commercial vehicle' },
    de: { name: 'Transporter', slug: 'transporter', short: 'Kastenwagen und Mannschaftstransporter bis 4,25 t für Handwerk, Service und Zustellung.', synonyms: 'E-Transporter, Kastenwagen, Lieferwagen, leichtes Nutzfahrzeug' },
    illustration: 'van',
    specs: ['range_km', 'consumption_kwh_100km', 'charge_time_dc_min', 'heat_pump', 'torque_nm', 'top_speed_kmh', 'gvw_t', 'length_m', 'width_m', 'height_m', 'turning_circle_m', 'payload_kg', 'cargo_m3', 'seats', 'towing_kg', 'body', 'quiet_cert'],
    keyFigures: ['range_km', 'battery_kwh', 'payload_kg', 'dc_kw'],
    children: [
      { key: 'small-vans', en: { name: 'Small vans', slug: 'small-vans', short: 'Compact city vans with about 3–4.5 m³ load volume.', synonyms: 'city van, compact van, caddy class' }, de: { name: 'Kleine Transporter', slug: 'kleine-transporter', short: 'Kompakte Stadtlieferwagen mit etwa 3–4,5 m³ Ladevolumen.', synonyms: 'Hochdachkombi, Stadtlieferwagen' } },
      { key: 'mid-size-vans', en: { name: 'Mid-size vans', slug: 'mid-size-vans', short: 'One-tonne vans with about 5–9 m³ load volume.', synonyms: 'medium van, one-tonne van' }, de: { name: 'Mittelgroße Transporter', slug: 'mittelgrosse-transporter', short: 'Transporter der Eintonnerklasse mit etwa 5–9 m³ Ladevolumen.', synonyms: 'Eintonner, Bulli' } },
      { key: 'large-vans', en: { name: 'Large vans', slug: 'large-vans', short: 'Sprinter-class vans and chassis cabs from 3.5 to 4.25 t.', synonyms: 'sprinter class, high roof van, 3.5 tonne van, 4.25 t' }, de: { name: 'Große Transporter', slug: 'grosse-transporter', short: 'Transporter der Sprinter-Klasse und Fahrgestelle von 3,5 bis 4,25 t.', synonyms: 'Sprinter-Klasse, Hochdach, 3,5-Tonner' } },
    ],
  },
  {
    key: 'pickups',
    en: { name: 'Pickups & UTVs', slug: 'pickups', short: 'Electric pickups and utility side-by-sides for rough terrain.', synonyms: 'pick-up, pickup truck, UTV, side by side, utility vehicle' },
    de: { name: 'Pickups & UTVs', slug: 'pickups', short: 'Elektrische Pickups und Nutz-Side-by-Sides für Gelände und Hof.', synonyms: 'Pick-up, UTV, Side-by-Side, Geländefahrzeug' },
    illustration: 'pickup',
    specs: ['range_km', 'consumption_kwh_100km', 'heat_pump', 'torque_nm', 'top_speed_kmh', 'gvw_t', 'length_m', 'width_m', 'height_m', 'payload_kg', 'towing_kg', 'seats', 'body'],
    keyFigures: ['range_km', 'battery_kwh', 'payload_kg', 'towing_kg'],
    children: [
      { key: 'pickup-trucks', en: { name: 'Pickups', slug: 'pickup-trucks', short: 'Double-cab and single-cab pickups with a load bed.', synonyms: 'pickup truck, double cab' }, de: { name: 'Pickups', slug: 'pickup-fahrzeuge', short: 'Pickups mit Doppel- oder Einzelkabine und Ladefläche.' } },
      { key: 'utvs', en: { name: 'UTVs & side-by-sides', slug: 'utvs', short: 'Off-road utility vehicles for farms, estates and sites.', synonyms: 'side-by-side, utility task vehicle, gator, mule, ranger' }, de: { name: 'UTVs & Side-by-Sides', slug: 'utvs', short: 'Geländegängige Nutzfahrzeuge für Höfe, Anlagen und Baustellen.' }, illustration: 'utv', alsoIn: ['agriculture'] },
    ],
  },
  {
    key: 'light-vehicles',
    en: { name: 'Light electric vehicles', slug: 'light-vehicles', short: 'Cargo bikes and light utility vehicles for the last mile, parks and campuses.', synonyms: 'LEV, micro vehicle, last mile vehicle' },
    de: { name: 'Leichte Elektrofahrzeuge', slug: 'leichtfahrzeuge', short: 'Lastenräder und leichte Nutzfahrzeuge für die letzte Meile, Parks und Werksgelände.', synonyms: 'LEV, Kleinstfahrzeug' },
    illustration: 'micro',
    specs: ['range_km', 'top_speed_kmh', 'gvw_t', 'length_m', 'width_m', 'height_m', 'payload_kg', 'cargo_m3', 'body', 'quiet_cert'],
    keyFigures: ['range_km', 'payload_kg', 'battery_kwh', 'top_speed_kmh'],
    children: [
      { key: 'cargo-bikes', en: { name: 'Cargo bikes & e-trikes', slug: 'cargo-bikes', short: 'Electric cargo bikes, trikes and heavy-duty quadricycles for urban delivery.', synonyms: 'cargo bike, e-cargo bike, trike, bakfiets, lastenrad' }, de: { name: 'Lastenräder & E-Trikes', slug: 'lastenraeder', short: 'Elektrische Lastenräder, Trikes und Schwerlasträder für die urbane Zustellung.', synonyms: 'Lastenrad, Cargobike, Schwerlastrad' }, illustration: 'bike', keyFigures: ['range_km', 'payload_kg', 'cargo_m3', 'battery_kwh'] },
      { key: 'light-utility-vehicles', en: { name: 'Light utility vehicles', slug: 'light-utility-vehicles', short: 'Compact utility vehicles and quadricycles for parks, campuses and old towns.', synonyms: 'compact utility vehicle, quadricycle, L7e, micro truck, Goupil, Alke' }, de: { name: 'Leichte Nutzfahrzeuge', slug: 'leichte-nutzfahrzeuge', short: 'Kompakte Nutzfahrzeuge und Quads für Parks, Werksgelände und Altstädte.', synonyms: 'Kleinnutzfahrzeug, L7e, Kommunalfahrzeug klein' } },
    ],
  },
  {
    key: 'trucks',
    en: { name: 'Trucks', slug: 'trucks', short: 'Rigid trucks and tractor units from 3.5 t to 44 t.', synonyms: 'lorry, e-truck, HGV, electric truck, BEV truck' },
    de: { name: 'Lkw', slug: 'lkw', short: 'Solo-Lkw und Sattelzugmaschinen von 3,5 t bis 44 t.', synonyms: 'E-Lkw, Elektro-Lkw, Nutzfahrzeug schwer' },
    illustration: 'truck',
    specs: ['range_km', 'consumption_kwh_100km', 'h2_tank_kg', 'charge_time_dc_min', 'heat_pump', 'torque_nm', 'gvw_t', 'gcw_t', 'length_m', 'payload_kg', 'body', 'quiet_cert'],
    keyFigures: ['range_km', 'battery_kwh', 'gvw_t', 'dc_kw'],
    children: [
      { key: 'light-trucks', en: { name: 'Light trucks (3.5–8.5 t)', slug: 'light-trucks', short: 'Light trucks for urban distribution; C1 licence up to 7.5 t.', synonyms: '7.5 tonne truck, 7.5 t, light truck, C1' }, de: { name: 'Leichte Lkw (3,5–8,5 t)', slug: 'leichte-lkw', short: 'Leichte Lkw für die Stadtbelieferung; Klasse C1 bis 7,5 t.', synonyms: '7,5-Tonner, 7,5 t' } },
      { key: 'medium-trucks', en: { name: 'Medium trucks (8.5–18 t)', slug: 'medium-trucks', short: 'Distribution trucks for city and regional delivery.', synonyms: '12 tonne, 16 tonne, 18 tonne truck, distribution truck' }, de: { name: 'Mittelschwere Lkw (8,5–18 t)', slug: 'mittelschwere-lkw', short: 'Verteiler-Lkw für Stadt- und Regionalbelieferung.', synonyms: '12-Tonner, 18-Tonner, Verteiler-Lkw' } },
      { key: 'heavy-trucks', en: { name: 'Heavy rigid trucks (18 t+)', slug: 'heavy-trucks', short: 'Two-, three- and four-axle rigid trucks for heavy distribution and construction.', synonyms: '26 tonne, 32 tonne, rigid, tipper truck, mixer truck' }, de: { name: 'Schwere Solo-Lkw (ab 18 t)', slug: 'schwere-lkw', short: 'Zwei-, drei- und vierachsige Solo-Lkw für schwere Verteilung und Bau.', synonyms: '26-Tonner, Kipper, Betonmischer' } },
      { key: 'tractor-units', en: { name: 'Tractor units', slug: 'tractor-units', short: 'Semi-trailer tractors for 40–44 t combinations.', synonyms: 'semi truck, tractor unit, prime mover, artic, 40 tonne' }, de: { name: 'Sattelzugmaschinen', slug: 'sattelzugmaschinen', short: 'Sattelzugmaschinen für 40–44-t-Züge.', synonyms: 'Sattelzug, SZM, 40-Tonner' }, illustration: 'tractor', keyFigures: ['range_km', 'battery_kwh', 'gcw_t', 'dc_kw'] },
    ],
  },
  {
    key: 'buses',
    en: { name: 'Buses & coaches', slug: 'buses', short: 'Minibuses, city buses, articulated buses and coaches.', synonyms: 'e-bus, electric bus, BEV bus, zero-emission bus' },
    de: { name: 'Busse', slug: 'busse', short: 'Kleinbusse, Stadtbusse, Gelenkbusse und Reisebusse.', synonyms: 'E-Bus, Elektrobus, Linienbus' },
    illustration: 'bus',
    specs: ['range_km', 'consumption_kwh_100km', 'h2_tank_kg', 'heat_pump', 'passengers', 'seats', 'length_m', 'height_m', 'gvw_t', 'body'],
    keyFigures: ['range_km', 'passengers', 'battery_kwh', 'length_m'],
    children: [
      { key: 'minibuses', en: { name: 'Minibuses & midibuses', slug: 'minibuses', short: 'Buses up to about 10 m for on-demand, school and rural routes.', synonyms: 'minibus, midibus, shuttle bus' }, de: { name: 'Klein- & Midibusse', slug: 'kleinbusse', short: 'Busse bis etwa 10 m für Rufbus-, Schul- und Landlinien.', synonyms: 'Kleinbus, Midibus, Rufbus' } },
      { key: 'city-buses', en: { name: 'City buses (12 m)', slug: 'city-buses', short: 'Low-floor 12 m buses for urban public transport.', synonyms: 'solo bus, 12 metre bus, transit bus' }, de: { name: 'Stadtbusse (12 m)', slug: 'stadtbusse', short: 'Niederflur-Solobusse mit 12 m für den Stadtverkehr.', synonyms: 'Solobus, Linienbus' } },
      { key: 'articulated-buses', en: { name: 'Articulated buses (18 m+)', slug: 'articulated-buses', short: 'Articulated and bi-articulated buses for high-capacity lines.', synonyms: 'bendy bus, articulated bus, 18 metre' }, de: { name: 'Gelenkbusse (ab 18 m)', slug: 'gelenkbusse', short: 'Gelenk- und Doppelgelenkbusse für nachfragestarke Linien.' } },
      { key: 'double-decker-buses', en: { name: 'Double-decker buses', slug: 'double-decker-buses', short: 'High-capacity double-deckers for city and sightseeing routes.', synonyms: 'double decker' }, de: { name: 'Doppeldeckerbusse', slug: 'doppeldecker', short: 'Doppeldecker für Stadt- und Sightseeinglinien.' } },
      { key: 'coaches', en: { name: 'Intercity buses & coaches', slug: 'coaches', short: 'Class II intercity buses and Class III coaches.', synonyms: 'coach, intercity bus, touring coach, regional bus' }, de: { name: 'Überland- & Reisebusse', slug: 'reisebusse', short: 'Überlandbusse (Klasse II) und Reisebusse (Klasse III).', synonyms: 'Reisebus, Überlandbus, Regionalbus' } },
    ],
  },
  {
    key: 'municipal',
    en: { name: 'Municipal vehicles', slug: 'municipal', short: 'Sweepers, multi-purpose transporters, refuse trucks and fire engines.', synonyms: 'municipal vehicle, communal vehicle, public works' },
    de: { name: 'Kommunalfahrzeuge', slug: 'kommunal', short: 'Kehrmaschinen, Geräteträger, Müllfahrzeuge und Feuerwehrfahrzeuge.', synonyms: 'Kommunalfahrzeug, Bauhof' },
    illustration: 'sweeper',
    specs: ['runtime_h', 'range_km', 'gvw_t', 'payload_kg', 'top_speed_kmh', 'length_m', 'width_m', 'height_m', 'noise_db', 'implements', 'body', 'quiet_cert'],
    keyFigures: ['runtime_h', 'battery_kwh', 'payload_kg', 'gvw_t'],
    children: [
      { key: 'street-sweepers', en: { name: 'Street sweepers', slug: 'street-sweepers', short: 'Compact and truck-mounted sweepers for streets, pavements and squares.', synonyms: 'compact sweeper, road sweeper, street cleaner, sweeping machine' }, de: { name: 'Kehrmaschinen', slug: 'kehrmaschinen', short: 'Kompakt- und Aufbaukehrmaschinen für Straßen, Gehwege und Plätze.', synonyms: 'Kompaktkehrmaschine, Straßenkehrmaschine, Kehrfahrzeug' }, illustration: 'sweeper', specs: ['hopper_m3', 'work_width_m', 'water_tank_l'], keyFigures: ['hopper_m3', 'runtime_h', 'work_width_m', 'battery_kwh'] },
      { key: 'multi-purpose-transporters', en: { name: 'Multi-purpose transporters', slug: 'multi-purpose-transporters', short: 'Implement carriers for sweeping, winter service, mowing and tipping all year round.', synonyms: 'implement carrier, tool carrier, multicar, municipal carrier' }, de: { name: 'Geräteträger', slug: 'geraetetraeger', short: 'Geräteträger für Kehren, Winterdienst, Mähen und Kippen – ganzjährig.', synonyms: 'Multicar, Kommunaltransporter, Mehrzweckfahrzeug' }, illustration: 'carrier', specs: ['aux_hydraulics_lpm', 'pto', 'towing_kg'], keyFigures: ['payload_kg', 'runtime_h', 'battery_kwh', 'gvw_t'] },
      { key: 'refuse-trucks', en: { name: 'Refuse collection trucks', slug: 'refuse-trucks', short: 'Complete refuse collection vehicles and low-entry refuse chassis.', synonyms: 'RCV, garbage truck, bin lorry, waste truck, refuse vehicle, dustcart' }, de: { name: 'Müllfahrzeuge', slug: 'muellfahrzeuge', short: 'Komplette Abfallsammelfahrzeuge und Niederflur-Fahrgestelle für Müllaufbauten.', synonyms: 'Müllwagen, Abfallsammelfahrzeug, Pressmüllfahrzeug' }, illustration: 'refuse', alsoIn: ['trucks'], specs: ['body_volume_m3', 'consumption_kwh_100km', 'h2_tank_kg', 'turning_circle_m', 'seats'], keyFigures: ['battery_kwh', 'range_km', 'body_volume_m3', 'gvw_t'] },
      { key: 'fire-rescue-vehicles', en: { name: 'Fire & rescue vehicles', slug: 'fire-rescue-vehicles', short: 'Electric fire engines and rescue vehicles.', synonyms: 'fire engine, fire truck, fire appliance, rescue vehicle' }, de: { name: 'Feuerwehrfahrzeuge', slug: 'feuerwehrfahrzeuge', short: 'Elektrische Lösch- und Rettungsfahrzeuge.', synonyms: 'Löschfahrzeug, HLF, Feuerwehrauto' }, illustration: 'truck', specs: ['water_tank_l', 'seats'], keyFigures: ['battery_kwh', 'range_km', 'water_tank_l', 'gvw_t'] },
    ],
  },
  {
    key: 'construction',
    en: { name: 'Construction machinery', slug: 'construction', short: 'Excavators, loaders, telehandlers, dumpers, rollers and work platforms.', synonyms: 'construction equipment, plant, earthmoving machinery, zero emission construction' },
    de: { name: 'Baumaschinen', slug: 'baumaschinen', short: 'Bagger, Lader, Teleskoplader, Dumper, Walzen und Arbeitsbühnen.', synonyms: 'Elektro-Baumaschine, emissionsfreie Baustelle' },
    illustration: 'excavator',
    specs: ['runtime_h', 'op_weight_kg', 'top_speed_kmh', 'length_m', 'width_m', 'height_m', 'noise_db', 'implements', 'aux_hydraulics_lpm'],
    keyFigures: ['op_weight_kg', 'runtime_h', 'battery_kwh', 'power_kw'],
    children: [
      { key: 'mini-excavators', en: { name: 'Mini excavators (up to 6 t)', slug: 'mini-excavators', short: 'Compact excavators for inner-city, indoor and landscaping work.', synonyms: 'mini digger, compact excavator, micro excavator' }, de: { name: 'Minibagger (bis 6 t)', slug: 'minibagger', short: 'Kompaktbagger für Innenstadt, Innenräume und GaLaBau.', synonyms: 'Kompaktbagger, Kleinbagger' }, illustration: 'excavator', specs: ['dig_depth_m', 'outreach_m', 'bucket_m3'], keyFigures: ['op_weight_kg', 'runtime_h', 'dig_depth_m', 'battery_kwh'] },
      { key: 'excavators', en: { name: 'Excavators (6 t+)', slug: 'excavators', short: 'Midi, crawler and wheeled excavators and material handlers.', synonyms: 'crawler excavator, wheeled excavator, midi excavator, material handler' }, de: { name: 'Bagger (ab 6 t)', slug: 'bagger', short: 'Midi-, Ketten- und Mobilbagger sowie Umschlagbagger.', synonyms: 'Kettenbagger, Mobilbagger, Umschlagbagger' }, illustration: 'excavator', specs: ['dig_depth_m', 'outreach_m', 'bucket_m3'], keyFigures: ['op_weight_kg', 'battery_kwh', 'runtime_h', 'dig_depth_m'] },
      { key: 'wheel-loaders', en: { name: 'Wheel loaders', slug: 'wheel-loaders', short: 'Compact and mid-size wheel loaders.', synonyms: 'loader, front loader, shovel' }, de: { name: 'Radlader', slug: 'radlader', short: 'Kompakte und mittlere Radlader.' }, illustration: 'loader', specs: ['bucket_m3', 'lift_kg', 'lift_height_m'], keyFigures: ['op_weight_kg', 'lift_kg', 'runtime_h', 'battery_kwh'] },
      { key: 'compact-loaders', en: { name: 'Skid steer & compact track loaders', slug: 'compact-loaders', short: 'Skid steers, compact track loaders and articulated mini loaders.', synonyms: 'skid steer, CTL, compact track loader, mini loader, Avant' }, de: { name: 'Kompaktlader', slug: 'kompaktlader', short: 'Kompaktlader, Kettenlader und knickgelenkte Minilader.', synonyms: 'Kompaktlader, Kettenlader, Minilader' }, illustration: 'loader', specs: ['lift_kg', 'lift_height_m', 'bucket_m3'], keyFigures: ['op_weight_kg', 'lift_kg', 'runtime_h', 'battery_kwh'] },
      { key: 'telehandlers', en: { name: 'Telehandlers', slug: 'telehandlers', short: 'Telescopic handlers for construction, farming and rental.', synonyms: 'telescopic handler, teleporter, loadall, telehandler' }, de: { name: 'Teleskoplader', slug: 'teleskoplader', short: 'Teleskoplader für Bau, Landwirtschaft und Vermietung.' }, illustration: 'telehandler', specs: ['lift_kg', 'lift_height_m', 'outreach_m'], keyFigures: ['lift_kg', 'lift_height_m', 'runtime_h', 'battery_kwh'] },
      { key: 'dumpers', en: { name: 'Dumpers & tracked carriers', slug: 'dumpers', short: 'Site dumpers and tracked carriers.', synonyms: 'site dumper, track dumper, tracked carrier, power barrow' }, de: { name: 'Dumper & Raupentransporter', slug: 'dumper', short: 'Baustellendumper und Raupentransporter.', synonyms: 'Dumper, Raupendumper, Kettendumper' }, illustration: 'dumper', specs: ['payload_kg', 'body_volume_m3', 'max_slope_deg'], keyFigures: ['payload_kg', 'runtime_h', 'battery_kwh', 'op_weight_kg'] },
      { key: 'rollers', en: { name: 'Rollers & compactors', slug: 'rollers', short: 'Tandem rollers, single-drum rollers and plate compactors.', synonyms: 'roller, compactor, vibratory plate' }, de: { name: 'Walzen & Verdichter', slug: 'walzen', short: 'Tandemwalzen, Walzenzüge und Rüttelplatten.', synonyms: 'Walze, Rüttelplatte, Verdichter' }, illustration: 'roller', specs: ['work_width_m'], keyFigures: ['op_weight_kg', 'work_width_m', 'runtime_h', 'battery_kwh'] },
      { key: 'aerial-work-platforms', en: { name: 'Aerial work platforms', slug: 'aerial-work-platforms', short: 'Scissor lifts, boom lifts and vertical masts.', synonyms: 'AWP, MEWP, scissor lift, boom lift, cherry picker' }, de: { name: 'Arbeitsbühnen', slug: 'arbeitsbuehnen', short: 'Scheren-, Gelenk- und Teleskopbühnen sowie Mastbühnen.', synonyms: 'Hubarbeitsbühne, Scherenbühne, Gelenkbühne' }, illustration: 'platform', specs: ['working_height_m', 'lift_kg', 'outreach_m', 'body'], keyFigures: ['working_height_m', 'lift_kg', 'outreach_m', 'battery_kwh'] },
      { key: 'demolition-robots', en: { name: 'Demolition robots', slug: 'demolition-robots', short: 'Remote-controlled demolition machines for indoor and hazardous work.', synonyms: 'demolition machine, remote demolition, brokk' }, de: { name: 'Abbruchroboter', slug: 'abbruchroboter', short: 'Ferngesteuerte Abbruchmaschinen für Innenräume und Gefahrenbereiche.' }, illustration: 'excavator', specs: ['outreach_m'], keyFigures: ['op_weight_kg', 'outreach_m', 'power_kw', 'runtime_h'] },
    ],
  },
  {
    key: 'agriculture',
    en: { name: 'Agriculture & groundcare', slug: 'agriculture', short: 'Tractors, yard loaders, mowers and field robots.', synonyms: 'farm machinery, agricultural machinery, groundcare' },
    de: { name: 'Land- & Grünflächentechnik', slug: 'landtechnik', short: 'Traktoren, Hoflader, Mäher und Feldroboter.', synonyms: 'Landmaschinen, Grünflächenpflege' },
    illustration: 'agtractor',
    specs: ['runtime_h', 'op_weight_kg', 'top_speed_kmh', 'max_slope_deg', 'noise_db', 'implements', 'pto', 'towing_kg', 'aux_hydraulics_lpm', 'width_m', 'height_m'],
    keyFigures: ['power_kw', 'runtime_h', 'battery_kwh', 'lift_kg'],
    children: [
      { key: 'tractors', en: { name: 'Tractors', slug: 'tractors', short: 'Compact and utility tractors.', synonyms: 'farm tractor, compact tractor, utility tractor' }, de: { name: 'Traktoren', slug: 'traktoren', short: 'Kompakt- und Standardtraktoren.', synonyms: 'Schlepper, Kompakttraktor' }, illustration: 'agtractor', specs: ['lift_kg'], keyFigures: ['power_kw', 'battery_kwh', 'runtime_h', 'lift_kg'] },
      { key: 'yard-loaders', en: { name: 'Farm & yard loaders', slug: 'yard-loaders', short: 'Articulated yard loaders for barns, stables and farmyards.', synonyms: 'yard loader, farm loader, hoftrac, compact loader' }, de: { name: 'Hoflader', slug: 'hoflader', short: 'Knickgelenkte Hoflader für Stall, Scheune und Hof.', synonyms: 'Hoftrac, Hoflader, Stalllader' }, illustration: 'loader', specs: ['lift_kg', 'lift_height_m', 'bucket_m3'], keyFigures: ['lift_kg', 'lift_height_m', 'runtime_h', 'battery_kwh'] },
      { key: 'slope-mowers', en: { name: 'Slope & remote-controlled mowers', slug: 'slope-mowers', short: 'Tracked and remote-controlled mowers for embankments and steep slopes.', synonyms: 'slope mower, remote control mower, embankment mower' }, de: { name: 'Hang- & Funkmäher', slug: 'hangmaeher', short: 'Raupen- und funkgesteuerte Mäher für Böschungen und Steilhänge.', synonyms: 'Hangmäher, Raupenmäher, Funkmäher, Böschungsmäher' }, illustration: 'mower', specs: ['work_width_m'], keyFigures: ['max_slope_deg', 'work_width_m', 'runtime_h', 'battery_kwh'] },
      { key: 'ride-on-mowers', en: { name: 'Ride-on mowers & groundcare', slug: 'ride-on-mowers', short: 'Professional ride-on and zero-turn mowers for parks and sports grounds.', synonyms: 'ride on mower, zero turn mower, front mower' }, de: { name: 'Aufsitzmäher', slug: 'aufsitzmaeher', short: 'Profi-Aufsitz- und Nullwendekreismäher für Parks und Sportplätze.', synonyms: 'Aufsitzmäher, Frontmäher, Zero-Turn' }, illustration: 'mower', specs: ['work_width_m'], keyFigures: ['work_width_m', 'runtime_h', 'battery_kwh', 'top_speed_kmh'] },
      { key: 'field-robots', en: { name: 'Field robots', slug: 'field-robots', short: 'Autonomous electric robots for seeding, weeding and crop care.', synonyms: 'agricultural robot, weeding robot, autonomous tractor' }, de: { name: 'Feldroboter', slug: 'feldroboter', short: 'Autonome Elektroroboter für Aussaat, Unkrautbekämpfung und Pflege.', synonyms: 'Agrarroboter, Hackroboter' }, illustration: 'mower', specs: ['work_width_m'], keyFigures: ['runtime_h', 'work_width_m', 'battery_kwh', 'op_weight_kg'] },
    ],
  },
  {
    key: 'industrial',
    en: { name: 'Industrial, port & airport', slug: 'industrial', short: 'Forklifts, terminal tractors, tow tractors and airport ground support.', synonyms: 'material handling, intralogistics, GSE, port equipment' },
    de: { name: 'Industrie, Hafen & Flughafen', slug: 'industrie', short: 'Stapler, Terminalzugmaschinen, Schlepper und Flughafen-Bodengeräte.', synonyms: 'Flurförderzeuge, Intralogistik, GSE' },
    illustration: 'forklift',
    specs: ['runtime_h', 'top_speed_kmh', 'op_weight_kg', 'towing_kg', 'lift_kg', 'lift_height_m', 'noise_db', 'length_m', 'width_m', 'height_m', 'implements'],
    keyFigures: ['runtime_h', 'battery_kwh', 'towing_kg', 'top_speed_kmh'],
    children: [
      { key: 'forklifts', en: { name: 'Forklifts (up to 5 t)', slug: 'forklifts', short: 'Counterbalance forklifts for indoor and outdoor work. Warehouse trucks are not listed.', synonyms: 'forklift truck, counterbalance, lift truck' }, de: { name: 'Gabelstapler (bis 5 t)', slug: 'gabelstapler', short: 'Frontstapler für innen und außen. Lagertechnik wird nicht gelistet.', synonyms: 'Stapler, Frontstapler' }, illustration: 'forklift', keyFigures: ['lift_kg', 'lift_height_m', 'battery_kwh', 'runtime_h'] },
      { key: 'heavy-forklifts', en: { name: 'Heavy forklifts & reach stackers', slug: 'heavy-forklifts', short: 'Forklifts above 5 t, reach stackers and container handlers.', synonyms: 'heavy forklift, reach stacker, container handler' }, de: { name: 'Schwerlaststapler & Reachstacker', slug: 'schwerlaststapler', short: 'Stapler über 5 t, Reachstacker und Containerstapler.' }, illustration: 'forklift', keyFigures: ['lift_kg', 'lift_height_m', 'battery_kwh', 'runtime_h'] },
      { key: 'terminal-tractors', en: { name: 'Terminal tractors', slug: 'terminal-tractors', short: 'Yard and terminal tractors for ports, rail terminals and distribution centres.', synonyms: 'yard tractor, terminal truck, shunter, tug master, RoRo tractor' }, de: { name: 'Terminalzugmaschinen', slug: 'terminalzugmaschinen', short: 'Terminal- und Rangierzugmaschinen für Häfen, KV-Terminals und Logistikzentren.', synonyms: 'Terminaltraktor, Rangierzugmaschine' }, illustration: 'yard', alsoIn: ['trucks'], specs: ['gcw_t'], keyFigures: ['gcw_t', 'battery_kwh', 'runtime_h', 'dc_kw'] },
      { key: 'tow-tractors', en: { name: 'Tow tractors & tuggers', slug: 'tow-tractors', short: 'Tow tractors for factories, logistics and baggage handling.', synonyms: 'tugger, tow tractor, baggage tractor, tow tug' }, de: { name: 'Schlepper', slug: 'schlepper', short: 'Schlepper für Werk, Logistik und Gepäckabfertigung.', synonyms: 'Schleppfahrzeug, Routenzug, Gepäckschlepper' }, illustration: 'tug', keyFigures: ['towing_kg', 'battery_kwh', 'runtime_h', 'top_speed_kmh'] },
      { key: 'airport-gse', en: { name: 'Airport ground support', slug: 'airport-gse', short: 'Pushback tugs, belt loaders, passenger stairs and other airside equipment.', synonyms: 'GSE, pushback tug, belt loader, aircraft tug, ground support equipment' }, de: { name: 'Flughafen-Bodengeräte', slug: 'flughafen-bodengeraete', short: 'Pushback-Schlepper, Förderbandwagen, Treppen und weitere Vorfeldgeräte.', synonyms: 'GSE, Flugzeugschlepper, Gepäckbandwagen' }, illustration: 'tug', specs: ['body', 'seats'], keyFigures: ['runtime_h', 'battery_kwh', 'towing_kg', 'top_speed_kmh'] },
    ],
  },
]

export type SeedJob = {
  key: string
  en: L10n
  de: L10n
  illustration?: Illustration
  typical?: string[]
  children?: SeedJob[]
}

export const JOBS: SeedJob[] = [
  {
    key: 'logistics',
    en: { name: 'Logistics & delivery', slug: 'logistics', short: 'Parcel, retail, refrigerated and long-haul transport.' },
    de: { name: 'Logistik & Zustellung', slug: 'logistik', short: 'Paket-, Handels-, Kühl- und Fernverkehr.' },
    illustration: 'truck',
    children: [
      { key: 'last-mile-delivery', en: { name: 'Last-mile & parcel delivery', slug: 'last-mile-delivery', synonyms: 'parcel delivery, courier, last mile, KEP' }, de: { name: 'Letzte Meile & Paketzustellung', slug: 'letzte-meile', synonyms: 'KEP, Paketdienst, Kurier' }, typical: ['small-vans', 'large-vans', 'cargo-bikes', 'light-utility-vehicles'] },
      { key: 'urban-distribution', en: { name: 'Urban distribution', slug: 'urban-distribution', synonyms: 'city logistics, store delivery, retail delivery' }, de: { name: 'Stadtbelieferung', slug: 'stadtbelieferung', synonyms: 'City-Logistik, Filialbelieferung' }, typical: ['large-vans', 'light-trucks', 'medium-trucks'] },
      { key: 'night-delivery', en: { name: 'Night & low-noise delivery', slug: 'night-delivery', synonyms: 'quiet delivery, night-time delivery, PIEK, off-peak delivery' }, de: { name: 'Nacht- & geräuscharme Belieferung', slug: 'nachtbelieferung', synonyms: 'Nachtanlieferung, PIEK, leise Belieferung' }, typical: ['light-trucks', 'medium-trucks', 'heavy-trucks'] },
      { key: 'refrigerated-transport', en: { name: 'Refrigerated transport', slug: 'refrigerated-transport', synonyms: 'temperature-controlled, cold chain, reefer, fridge van' }, de: { name: 'Kühltransport', slug: 'kuehltransport', synonyms: 'Kühlkette, temperaturgeführt' }, typical: ['large-vans', 'light-trucks', 'medium-trucks'] },
      { key: 'regional-distribution', en: { name: 'Regional distribution', slug: 'regional-distribution', synonyms: 'regional haulage, day trips' }, de: { name: 'Regionalverkehr', slug: 'regionalverkehr', synonyms: 'Regionalverteilung' }, typical: ['heavy-trucks', 'tractor-units'] },
      { key: 'long-haul', en: { name: 'Long-haul transport', slug: 'long-haul', synonyms: 'long distance haulage, 40 t long haul' }, de: { name: 'Fernverkehr', slug: 'fernverkehr', synonyms: 'Langstrecke' }, typical: ['tractor-units'] },
      { key: 'construction-logistics', en: { name: 'Construction logistics', slug: 'construction-logistics', synonyms: 'tipper, mixer, building materials, construction transport' }, de: { name: 'Baustellenlogistik', slug: 'baustellenlogistik', synonyms: 'Baustoffe, Kipper, Betonmischer' }, typical: ['heavy-trucks', 'light-trucks'] },
      { key: 'intralogistics', en: { name: 'Warehousing & intralogistics', slug: 'intralogistics', synonyms: 'warehouse, distribution centre, material flow' }, de: { name: 'Lager & Intralogistik', slug: 'intralogistik', synonyms: 'Lager, Logistikzentrum' }, typical: ['forklifts', 'tow-tractors'] },
    ],
  },
  {
    key: 'passenger-transport',
    en: { name: 'Passenger transport', slug: 'passenger-transport', short: 'Public transport, coaches and shuttles.' },
    de: { name: 'Personenbeförderung', slug: 'personenbefoerderung', short: 'ÖPNV, Reiseverkehr und Shuttles.' },
    illustration: 'bus',
    children: [
      { key: 'city-bus', en: { name: 'Urban public transport', slug: 'urban-public-transport', synonyms: 'city bus, public transport, transit' }, de: { name: 'Stadtverkehr (ÖPNV)', slug: 'stadtverkehr', synonyms: 'ÖPNV, Linienverkehr' }, typical: ['city-buses', 'articulated-buses', 'double-decker-buses'] },
      { key: 'intercity', en: { name: 'Regional & intercity', slug: 'intercity', synonyms: 'regional bus, rural bus' }, de: { name: 'Regional- & Überlandverkehr', slug: 'ueberlandverkehr', synonyms: 'Regionalbus' }, typical: ['coaches', 'city-buses'] },
      { key: 'coach-tourism', en: { name: 'Coach & tourism', slug: 'coach-tourism', synonyms: 'coach travel, tour bus' }, de: { name: 'Reise- & Touristikverkehr', slug: 'reiseverkehr', synonyms: 'Reisebus, Touristik' }, typical: ['coaches'] },
      { key: 'shuttles', en: { name: 'Shuttles & on-demand', slug: 'shuttles', synonyms: 'on-demand transport, demand responsive, hotel shuttle, airport shuttle' }, de: { name: 'Shuttles & On-Demand', slug: 'shuttles', synonyms: 'Rufbus, On-Demand-Verkehr' }, typical: ['minibuses'] },
      { key: 'school-transport', en: { name: 'School & accessible transport', slug: 'school-transport', synonyms: 'school bus, accessible transport, paratransit' }, de: { name: 'Schüler- & Behindertenbeförderung', slug: 'schuelerbefoerderung', synonyms: 'Schulbus, Behindertenfahrdienst' }, typical: ['minibuses'] },
    ],
  },
  {
    key: 'construction',
    en: { name: 'Construction & civil engineering', slug: 'construction', short: 'Earthmoving, material handling and zero-emission job sites.' },
    de: { name: 'Bau & Tiefbau', slug: 'bau', short: 'Erdbau, Materialumschlag und emissionsfreie Baustellen.' },
    illustration: 'excavator',
    children: [
      { key: 'earthmoving', en: { name: 'Earthmoving', slug: 'earthmoving', synonyms: 'excavation, digging, groundworks' }, de: { name: 'Erdbau', slug: 'erdbau', synonyms: 'Aushub, Erdarbeiten' }, typical: ['mini-excavators', 'excavators', 'wheel-loaders', 'dumpers'] },
      { key: 'site-material-handling', en: { name: 'Material handling on site', slug: 'site-material-handling', synonyms: 'lifting, loading, placing materials' }, de: { name: 'Materialumschlag auf der Baustelle', slug: 'materialumschlag', synonyms: 'Heben, Laden' }, typical: ['telehandlers', 'wheel-loaders', 'dumpers'] },
      { key: 'zero-emission-sites', en: { name: 'Zero-emission & inner-city sites', slug: 'zero-emission-sites', synonyms: 'emission-free site, inner city construction, low noise site, zero emission tender' }, de: { name: 'Emissionsfreie & innerstädtische Baustellen', slug: 'emissionsfreie-baustellen', synonyms: 'Innenstadtbaustelle, emissionsfreie Ausschreibung' }, typical: ['mini-excavators', 'wheel-loaders', 'dumpers'] },
      { key: 'indoor-work', en: { name: 'Indoor & underground work', slug: 'indoor-work', synonyms: 'indoor demolition, basement, tunnel, no exhaust' }, de: { name: 'Innenräume & Untertage', slug: 'innenraeume', synonyms: 'Innenabbruch, Keller, Tunnel' }, typical: ['mini-excavators', 'demolition-robots', 'dumpers'] },
      { key: 'road-construction', en: { name: 'Road construction', slug: 'road-construction', synonyms: 'paving, asphalt, compaction' }, de: { name: 'Straßenbau', slug: 'strassenbau', synonyms: 'Asphalt, Verdichtung' }, typical: ['rollers', 'excavators', 'wheel-loaders'] },
      { key: 'utility-works', en: { name: 'Utility & civil works', slug: 'utility-works', synonyms: 'trenching, cables, pipes, fibre rollout' }, de: { name: 'Leitungs- & Tiefbau', slug: 'leitungsbau', synonyms: 'Graben, Kabel, Glasfaser' }, typical: ['mini-excavators', 'dumpers'] },
      { key: 'demolition', en: { name: 'Demolition & renovation', slug: 'demolition', synonyms: 'demolition, refurbishment, strip-out' }, de: { name: 'Abbruch & Sanierung', slug: 'abbruch', synonyms: 'Rückbau, Entkernung' }, typical: ['demolition-robots', 'mini-excavators'] },
    ],
  },
  {
    key: 'municipal-services',
    en: { name: 'Municipal & public services', slug: 'municipal-services', short: 'Waste, street cleaning, winter service, parks and emergency services.' },
    de: { name: 'Kommunale Dienste', slug: 'kommunale-dienste', short: 'Abfall, Stadtreinigung, Winterdienst, Grünflächen und Rettung.' },
    illustration: 'sweeper',
    children: [
      { key: 'waste-collection', en: { name: 'Waste collection & recycling', slug: 'waste-collection', synonyms: 'refuse collection, bin collection, recycling, waste management' }, de: { name: 'Abfallsammlung & Recycling', slug: 'abfallsammlung', synonyms: 'Müllabfuhr, Entsorgung, Wertstoff' }, typical: ['refuse-trucks', 'heavy-trucks', 'light-utility-vehicles'] },
      { key: 'street-cleaning', en: { name: 'Street cleaning', slug: 'street-cleaning', synonyms: 'sweeping, street cleansing, washing' }, de: { name: 'Straßenreinigung', slug: 'strassenreinigung', synonyms: 'Kehren, Stadtreinigung' }, typical: ['street-sweepers', 'multi-purpose-transporters'] },
      { key: 'winter-service', en: { name: 'Winter service', slug: 'winter-service', synonyms: 'snow clearing, gritting, salt spreading' }, de: { name: 'Winterdienst', slug: 'winterdienst', synonyms: 'Schneeräumung, Streudienst' }, typical: ['multi-purpose-transporters', 'tractors'] },
      { key: 'parks', en: { name: 'Parks & green spaces', slug: 'parks', synonyms: 'green space maintenance, park maintenance, cemetery' }, de: { name: 'Parks & Grünflächen', slug: 'gruenflaechen', synonyms: 'Grünpflege, Friedhof' }, typical: ['light-utility-vehicles', 'ride-on-mowers', 'multi-purpose-transporters'] },
      { key: 'road-maintenance', en: { name: 'Road & infrastructure maintenance', slug: 'road-maintenance', synonyms: 'verge maintenance, road works, signage' }, de: { name: 'Straßen- & Infrastrukturunterhalt', slug: 'strassenunterhalt', synonyms: 'Straßenmeisterei, Bankettpflege' }, typical: ['multi-purpose-transporters', 'slope-mowers'] },
      { key: 'fire-rescue', en: { name: 'Fire & rescue', slug: 'fire-rescue', synonyms: 'fire brigade, emergency services, rescue' }, de: { name: 'Feuerwehr & Rettung', slug: 'feuerwehr', synonyms: 'Brandschutz, Rettungsdienst' }, typical: ['fire-rescue-vehicles'] },
    ],
  },
  {
    key: 'agriculture-forestry',
    en: { name: 'Agriculture & forestry', slug: 'agriculture-forestry', short: 'Arable farming, livestock, special crops and forestry.' },
    de: { name: 'Land- & Forstwirtschaft', slug: 'land-forstwirtschaft', short: 'Ackerbau, Tierhaltung, Sonderkulturen und Forst.' },
    illustration: 'agtractor',
    children: [
      { key: 'arable-farming', en: { name: 'Arable farming', slug: 'arable-farming', synonyms: 'field work, crop farming, tillage' }, de: { name: 'Ackerbau', slug: 'ackerbau', synonyms: 'Feldarbeit' }, typical: ['tractors', 'field-robots'] },
      { key: 'livestock-farming', en: { name: 'Livestock & farmyard', slug: 'livestock-farming', synonyms: 'barn, stable, dairy, feeding, mucking out' }, de: { name: 'Tierhaltung & Hofarbeit', slug: 'tierhaltung', synonyms: 'Stall, Fütterung, Entmisten' }, typical: ['yard-loaders', 'tractors', 'utvs'] },
      { key: 'vineyards-orchards', en: { name: 'Vineyards & orchards', slug: 'vineyards-orchards', synonyms: 'viticulture, fruit growing, special crops' }, de: { name: 'Wein- & Obstbau', slug: 'weinbau-obstbau', synonyms: 'Sonderkulturen, Weinberg' }, typical: ['tractors', 'slope-mowers'] },
      { key: 'horticulture', en: { name: 'Horticulture & greenhouses', slug: 'horticulture', synonyms: 'greenhouse, nursery, market gardening' }, de: { name: 'Gartenbau & Gewächshaus', slug: 'gartenbau', synonyms: 'Gewächshaus, Baumschule' }, typical: ['tractors', 'light-utility-vehicles', 'field-robots'] },
      { key: 'forestry', en: { name: 'Forestry', slug: 'forestry', synonyms: 'woodland, timber' }, de: { name: 'Forstwirtschaft', slug: 'forstwirtschaft', synonyms: 'Wald, Holz' }, typical: ['tractors', 'utvs'] },
    ],
  },
  {
    key: 'landscaping-groundcare',
    en: { name: 'Landscaping & grounds care', slug: 'landscaping-groundcare', short: 'Landscaping contractors, slopes, sports turf and estates.' },
    de: { name: 'GaLaBau & Grünpflege', slug: 'galabau', short: 'Garten- und Landschaftsbau, Böschungen, Sportrasen und Anlagen.' },
    illustration: 'mower',
    children: [
      { key: 'landscaping', en: { name: 'Landscaping', slug: 'landscaping', synonyms: 'landscape gardening, garden construction, hardscaping' }, de: { name: 'Garten- & Landschaftsbau', slug: 'garten-landschaftsbau', synonyms: 'GaLaBau, Gartenbau' }, typical: ['mini-excavators', 'compact-loaders', 'dumpers'] },
      { key: 'slope-mowing', en: { name: 'Slope & embankment mowing', slug: 'slope-mowing', synonyms: 'embankment, steep slope, verge mowing, dyke' }, de: { name: 'Hang- & Böschungspflege', slug: 'boeschungspflege', synonyms: 'Böschung, Deich, Steilhang' }, typical: ['slope-mowers'] },
      { key: 'sports-turf', en: { name: 'Sports turf & golf courses', slug: 'sports-turf', synonyms: 'golf course, pitch maintenance, stadium' }, de: { name: 'Sportrasen & Golfplätze', slug: 'sportrasen', synonyms: 'Golfplatz, Sportplatz' }, typical: ['ride-on-mowers', 'utvs'] },
      { key: 'estates-campuses', en: { name: 'Estates, campuses & resorts', slug: 'estates-campuses', synonyms: 'campus, resort, holiday park, hospital grounds' }, de: { name: 'Anlagen, Campus & Resorts', slug: 'anlagen-campus', synonyms: 'Campus, Ferienpark, Klinikgelände' }, typical: ['light-utility-vehicles', 'utvs', 'ride-on-mowers'] },
    ],
  },
  {
    key: 'trades-services',
    en: { name: 'Trades & services', slug: 'trades-services', short: 'Tradespeople, service fleets, facility management and rental.' },
    de: { name: 'Handwerk & Dienstleistung', slug: 'handwerk-dienstleistung', short: 'Handwerk, Serviceflotten, Facility Management und Vermietung.' },
    illustration: 'van',
    children: [
      { key: 'trades', en: { name: 'Trades & installation', slug: 'trades', synonyms: 'tradesman, plumber, electrician, installer, craftsmen' }, de: { name: 'Handwerk & Montage', slug: 'handwerk', synonyms: 'Installateur, Elektriker, Handwerker' }, typical: ['small-vans', 'mid-size-vans', 'large-vans'] },
      { key: 'service-fleets', en: { name: 'Service & maintenance fleets', slug: 'service-fleets', synonyms: 'field service, technicians, utilities fleet' }, de: { name: 'Service- & Wartungsflotten', slug: 'serviceflotten', synonyms: 'Kundendienst, Techniker, Stadtwerke' }, typical: ['small-vans', 'mid-size-vans'] },
      { key: 'facility-management', en: { name: 'Facility management', slug: 'facility-management', synonyms: 'building services, caretaking, cleaning services' }, de: { name: 'Facility Management', slug: 'facility-management', synonyms: 'Hausmeisterdienst, Gebäudereinigung' }, typical: ['light-utility-vehicles', 'small-vans'] },
      { key: 'rental', en: { name: 'Rental', slug: 'rental', synonyms: 'hire, equipment rental, plant hire' }, de: { name: 'Vermietung', slug: 'vermietung', synonyms: 'Mietpark, Baumaschinenvermietung' }, typical: ['telehandlers', 'mini-excavators', 'large-vans'] },
    ],
  },
  {
    key: 'industry-airports',
    en: { name: 'Industry, ports & airports', slug: 'industry-airports', short: 'Airside operations, ports, plants and mines.' },
    de: { name: 'Industrie, Häfen & Flughäfen', slug: 'industrie-haefen-flughaefen', short: 'Vorfeld, Häfen, Werke und Bergbau.' },
    illustration: 'tug',
    children: [
      { key: 'airport-ground-handling', en: { name: 'Airports & ground handling', slug: 'airport-ground-handling', synonyms: 'airside, apron, ground handling, baggage, pushback' }, de: { name: 'Flughafen & Bodenabfertigung', slug: 'bodenabfertigung', synonyms: 'Vorfeld, Gepäck, Pushback' }, typical: ['airport-gse', 'tow-tractors', 'street-sweepers'] },
      { key: 'ports-terminals', en: { name: 'Ports & container terminals', slug: 'ports-terminals', synonyms: 'port, container terminal, RoRo, yard' }, de: { name: 'Häfen & Containerterminals', slug: 'haefen', synonyms: 'Hafen, Terminal, RoRo' }, typical: ['terminal-tractors', 'heavy-forklifts'] },
      { key: 'industrial-sites', en: { name: 'Industrial sites & plants', slug: 'industrial-sites', synonyms: 'factory, plant, works traffic' }, de: { name: 'Werke & Industriegelände', slug: 'werksgelaende', synonyms: 'Werksverkehr, Fabrik' }, typical: ['tow-tractors', 'forklifts', 'light-utility-vehicles'] },
      { key: 'mining-quarrying', en: { name: 'Mining & quarrying', slug: 'mining-quarrying', synonyms: 'underground mining, quarry, tunnelling' }, de: { name: 'Bergbau & Steinbruch', slug: 'bergbau', synonyms: 'Untertage, Steinbruch' }, typical: ['wheel-loaders', 'excavators', 'dumpers'] },
    ],
  },
]
