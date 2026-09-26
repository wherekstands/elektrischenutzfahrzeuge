/**
 * Editorial intros and FAQs for the most important hubs (English). Hubs without an intro show a
 * data-driven summary instead. Keep intros 80–200 words and factual (docs/03 §7).
 */
type HubContent = { intro: string; faqs: { question: string; answer: string }[] }

export const TYPE_CONTENT: Record<string, HubContent> = {
  vans: {
    intro: `Electric vans are the most mature segment of electric commercial vehicles in Europe, with models from almost every major manufacturer. **Small vans** suit city trades and parcel rounds with about 3–4.5 m³ of load space. **Mid-size vans** carry around a tonne. **Large vans** of the Sprinter class reach up to 4.25 t gross weight and are also available as chassis cabs for box, tipper and refrigerated bodies.

When comparing, check usable battery capacity and WLTP range against your longest daily route plus a winter reserve, the payload that remains after the battery, DC charging power for mid-day top-ups and the AC onboard charger for overnight depot charging.`,
    faqs: [
      {
        question: 'How far can an electric van drive on one charge?',
        answer:
          'Depending on battery size, WLTP ranges of current electric vans run from roughly 200 km to well over 400 km. Real-world range is lower in winter and with full payload, so plan with a reserve of 20–30 %.',
      },
      {
        question: 'Can I drive a 4.25 t electric van with a car licence?',
        answer:
          'In several EU countries, including Germany, holders of a B licence may drive alternatively fuelled vans up to 4.25 t for goods transport under conditions. Check your national rules; each listing shows the licence typically needed.',
      },
      {
        question: 'Do electric vans have less payload than diesel vans?',
        answer:
          'Often slightly, because the battery is heavy. That is why many large electric vans are offered with 4.25 t gross weight. Compare the payload figure of the exact version in our listings.',
      },
    ],
  },
  trucks: {
    intro: `Electric trucks now cover the full weight range from 3.5 t distribution trucks to 44 t tractor units. **Light trucks** up to 7.5 t (C1 licence) are proven in urban distribution. **Medium and heavy rigids** handle city and regional delivery, refrigerated transport and construction logistics. **Tractor units** with 500–600 kWh and more now reach regional and first long-haul applications, with MCS megawatt charging arriving.

Compare battery capacity and range against your daily route, the gross vehicle or combination weight, DC charging power for depot and en-route charging, and the body options the chassis supports.`,
    faqs: [
      {
        question: 'Are electric trucks suitable for long haul?',
        answer:
          'Several tractor units now offer 500 km and more on a charge, and megawatt charging (MCS) allows long breaks to be used for charging. Most fleets start with regional routes that return to the depot every night.',
      },
      {
        question: 'What is the difference between GVW and GCW?',
        answer:
          'Gross vehicle weight (GVW) is the maximum weight of the truck itself; gross combination weight (GCW) is the maximum of truck plus trailer. Tractor units are compared by GCW.',
      },
      {
        question: 'Which charging standard do electric trucks use?',
        answer:
          'In Europe, CCS2 is standard for DC charging. The Megawatt Charging System (MCS) is being introduced for heavy trucks. Some urban trucks also offer AC charging.',
      },
    ],
  },
  buses: {
    intro: `Battery-electric buses are standard in many European cities. **City buses** of 12 m and **articulated buses** of 18 m are available from most manufacturers, alongside **minibuses** for on-demand and rural services, **double-deckers** and a growing number of **intercity buses and coaches**.

When comparing, look at the battery capacity and the manufacturer's range figure, passenger capacity, length, and the charging concept: overnight depot charging with CCS2 or opportunity charging with a pantograph at the terminus.`,
    faqs: [
      {
        question: 'Depot or opportunity charging: which is better?',
        answer:
          'Depot charging keeps infrastructure simple and suits routes that fit within one battery charge. Opportunity charging with pantographs allows smaller batteries and more passengers but needs chargers along the route.',
      },
      {
        question: 'How is bus range measured?',
        answer:
          'Bus ranges are manufacturer figures, often based on the SORT test cycles. Real range depends on heating and air conditioning, topography and passenger load.',
      },
    ],
  },
  municipal: {
    intro: `Municipal fleets are among the fastest adopters of electric vehicles: routes are predictable, vehicles return to the depot every night, and quiet, exhaust-free operation matters in pedestrian zones, parks and early-morning services. This section covers **street sweepers**, **multi-purpose transporters** for year-round implements, **refuse collection trucks** and **fire and rescue vehicles**.

For machines, compare runtime per shift rather than range, the hopper or body volume, the working width, and whether the vehicle is drivable on a B licence. Implement options decide whether one carrier can sweep in summer and clear snow in winter.`,
    faqs: [
      {
        question: 'Can an electric sweeper work a full shift?',
        answer:
          'Current compact sweepers are rated for roughly 6–10 hours depending on battery and duty. Check the runtime figure and whether fast charging during breaks is possible.',
      },
      {
        question: 'Are electric refuse trucks strong enough for a full collection round?',
        answer:
          'Yes, refuse trucks are among the best-suited heavy vehicles for electric drive: routes are short, with many stops where regenerative braking recovers energy. Compare battery size, range and body volume.',
      },
    ],
  },
  construction: {
    intro: `Electric construction machines make zero-emission and inner-city sites possible: no exhaust, far less noise, and work indoors or at night without disturbing neighbours. Cities such as Oslo and Copenhagen already require emission-free machines in public tenders. The segment covers **mini excavators**, larger **excavators**, **wheel loaders**, **telehandlers**, **dumpers**, **rollers**, **aerial work platforms** and **demolition robots**.

For machines, compare operating weight and runtime per charge, how the battery is charged on site (230 V, 400 V CEE or DC), and the working figures such as digging depth or lift capacity.`,
    faqs: [
      {
        question: 'How long does an electric mini excavator run on one charge?',
        answer:
          'Typically four to eight hours of mixed work, depending on battery size and duty. Many models can work while plugged in or charge during breaks.',
      },
      {
        question: 'How are electric construction machines charged on site?',
        answer:
          'Most compact machines charge from a 230 V or 400 V CEE socket; larger machines add DC fast charging via CCS2. Mobile battery storage units can supply sites without a strong grid connection.',
      },
    ],
  },
  agriculture: {
    intro: `Electric drives are arriving on farms where work is local and energy can come from the farm's own solar panels: **yard loaders** in barns and stables, compact **tractors**, **slope and remote-controlled mowers**, **ride-on mowers** and autonomous **field robots**. No exhaust in closed stables and far less noise are key advantages.

Compare runtime per charge, lift capacity and lift height for loaders, working width and maximum slope for mowers, and PTO and hydraulic options for tractors.`,
    faqs: [
      {
        question: 'Why use an electric yard loader in the barn?',
        answer:
          'No exhaust gases in closed stables, less noise for animals and people, and lower energy costs, especially with on-farm solar power.',
      },
    ],
  },
  industrial: {
    intro: `Industrial and airside operations were early adopters of electric drive. This section covers counterbalance **forklifts**, **heavy forklifts and reach stackers**, **terminal tractors** for ports and distribution centres, **tow tractors** and **airport ground support equipment** such as pushback tugs and belt loaders. Warehouse trucks such as pallet trucks are not listed because they have been electric for decades.

Compare lift capacity and lift height, runtime per shift, towing capacity and charging options, including opportunity charging during breaks.`,
    faqs: [
      {
        question: 'Can electric terminal tractors work around the clock?',
        answer:
          'With opportunity charging during breaks or battery swapping, electric terminal tractors can support multi-shift operation. Compare battery capacity, runtime and DC charging power.',
      },
    ],
  },
  'light-vehicles': {
    intro: `Light electric vehicles move goods where vans are too big: pedestrian zones, old towns, parks, campuses and industrial sites. **Cargo bikes and e-trikes** handle parcels and food delivery in city centres; **light utility vehicles** carry tools, waste bins and materials for parks departments and facility managers.

Compare payload, load volume, range and top speed, and check which vehicle class and licence apply.`,
    faqs: [],
  },
  pickups: {
    intro: `Electric pickups and UTVs bring zero-emission drive to farms, estates, construction sites and utilities. Compare payload and towing capacity, range, all-wheel drive and whether the vehicle is road-registered.`,
    faqs: [],
  },
  'street-sweepers': {
    intro: `Electric street sweepers clean pedestrian zones, cycle paths and city squares without exhaust and with much less noise, which allows early-morning and night shifts in residential areas. Most models are **compact sweepers** in the 3.5–5 t class with hoppers of about 1–2.5 m³; some can be driven on a B licence.

Compare hopper volume, working width and runtime per shift, the charging concept (onboard AC or DC fast charging) and whether the sweeper can suck and wash as well as sweep.`,
    faqs: [
      {
        question: 'Which licence do I need for a compact sweeper?',
        answer:
          'Sweepers up to 3.5 t can often be driven on a B licence. Heavier machines usually need C1. Each listing shows the licence typically needed.',
      },
      {
        question: 'How long does an electric sweeper run?',
        answer:
          'Manufacturers state around 6–10 hours depending on battery size and duty. High suction power and hills shorten the runtime.',
      },
    ],
  },
  'refuse-trucks': {
    intro: `Refuse collection is one of the best duty cycles for electric trucks: short routes, frequent stops and a return to the depot every day. This type covers complete refuse collection vehicles and low-entry refuse chassis. Electric bodies with electric compaction make collection quieter, which helps early-morning rounds.

Compare battery capacity and range per shift, gross vehicle weight, body volume and cab layout (low-entry cabs with direct vision improve crew safety).`,
    faqs: [
      {
        question: 'Can an electric refuse truck complete a full round?',
        answer:
          'Most urban and suburban rounds fit within one charge. Check range and battery against your longest route, including trips to the transfer station.',
      },
    ],
  },
  'mini-excavators': {
    intro: `Electric mini excavators up to 6 t are the most popular electric construction machines. They work indoors, in basements, next to hospitals and schools, and on inner-city sites where emission-free machines are required.

Compare operating weight, runtime per charge, digging depth and the charging options: many models charge from 230 V or 400 V sockets overnight, some offer DC fast charging, and some can keep working while plugged in.`,
    faqs: [
      {
        question: 'Can electric mini excavators work indoors?',
        answer:
          'Yes. With no exhaust gases and low noise they are suitable for indoor demolition and renovation, basements and underground work, subject to your site safety rules.',
      },
    ],
  },
  'tractor-units': {
    intro: `Electric tractor units haul 40–44 t combinations in regional distribution and, increasingly, long haul. Current models offer battery capacities from about 300 to over 600 kWh.

Compare range, gross combination weight, DC charging power (CCS2 now, MCS megawatt charging next) and the axle configuration.`,
    faqs: [],
  },
  'city-buses': {
    intro: `The 12 m low-floor city bus is the backbone of urban public transport and the most common electric bus type in Europe. Compare battery capacity and range, passenger capacity and the charging concept: depot charging via CCS2, opportunity charging via pantograph, or both.`,
    faqs: [],
  },
  'yard-loaders': {
    intro: `Electric yard loaders move feed, bedding and manure in barns and stables without exhaust gases. Their compact, articulated design fits through low doors and narrow aisles. Compare lift capacity, lift height, runtime and the battery options offered for each model.`,
    faqs: [],
  },
}

export const JOB_CONTENT: Record<string, HubContent> = {
  'last-mile-delivery': {
    intro: `Parcel and courier routes are ideal for electric vehicles: predictable daily distances, many stops with regenerative braking and overnight charging at the depot. Depending on parcel volume and city layout, fleets combine **small and large vans**, **cargo bikes** for dense centres and **light utility vehicles** for pedestrian zones.

Compare load volume and payload with your typical route, WLTP range with a winter reserve, and the AC onboard charger for overnight depot charging.`,
    faqs: [
      {
        question: 'Which electric van size fits parcel delivery?',
        answer:
          'For dense urban routes, small and mid-size vans with 4–7 m³ are common. High-volume routes use large vans with 10–14 m³. Compare load volume and payload in the listings.',
      },
    ],
  },
  'waste-collection': {
    intro: `Waste and recycling collection suits electric drive because rounds are short, stop-and-go and start at the depot. Besides complete **refuse collection trucks**, municipalities use heavy rigid chassis with refuse bodies, light trucks for narrow streets and **light utility vehicles** for bin emptying in parks and pedestrian zones.

Compare battery capacity and range per round, gross vehicle weight, body volume and cab layout.`,
    faqs: [],
  },
  'street-cleaning': {
    intro: `Street cleaning is done by **compact sweepers** and **multi-purpose transporters** with sweeping units. Electric models allow cleaning in residential areas early in the morning without exhaust and with much less noise. Compare hopper volume, working width, runtime per shift and implement options.`,
    faqs: [],
  },
  'zero-emission-sites': {
    intro: `More and more public clients require emission-free construction sites, and inner-city sites benefit from low noise and no exhaust. Electric **mini excavators**, **wheel loaders**, **dumpers** and **telehandlers** make it possible to run a complete site on electricity.

Compare runtime per charge, the charging options available on site (230 V, 400 V CEE, DC) and operating weight for transport between sites.`,
    faqs: [],
  },
  'night-delivery': {
    intro: `Night and early-morning deliveries relieve congested cities, but only quiet vehicles are allowed to deliver in residential areas at night. Electric trucks are much quieter than diesels; certification schemes such as the Dutch PIEK standard (≤ 60 dB(A)) define limits for the whole delivery process, including body, cooling unit and handling equipment.

Filter by "Low-noise certified" and compare range, gross weight and body options.`,
    faqs: [],
  },
  'livestock-farming': {
    intro: `In barns and stables, electric drive means no exhaust gases for animals and people, less noise and low energy costs with on-farm solar power. **Yard loaders** are the most common electric machine on livestock farms, alongside compact **tractors** and **UTVs**.`,
    faqs: [],
  },
}

/** Curated type × job pages (vehicle type or group key, job or area key). */
export const COMBOS: { type: string; job: string; title: string; intro: string }[] = [
  {
    type: 'trucks',
    job: 'waste-collection',
    title: 'Electric trucks for waste collection',
    intro: `Electric trucks for waste and recycling collection: complete refuse collection vehicles, low-entry refuse chassis, heavy rigid trucks with refuse bodies and light trucks for narrow streets. Compare battery capacity and range per round, gross vehicle weight and body volume.`,
  },
  {
    type: 'vans',
    job: 'last-mile-delivery',
    title: 'Electric vans for last-mile and parcel delivery',
    intro: `Electric vans for parcel, courier and last-mile delivery. Compare load volume, payload, WLTP range and AC charging power for overnight depot charging.`,
  },
  {
    type: 'construction',
    job: 'zero-emission-sites',
    title: 'Electric construction machines for zero-emission sites',
    intro: `Electric construction machines for emission-free and inner-city sites: excavators, loaders, telehandlers and dumpers without exhaust and with far less noise. Compare runtime, charging options and operating weight.`,
  },
]
