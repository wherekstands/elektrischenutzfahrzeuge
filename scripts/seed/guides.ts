/** Two starter guides (English). Evergreen buyer questions; link to hubs. */
export const GUIDES: {
  slug: string
  title: string
  excerpt: string
  markdown: string
  relatedTypes: string[]
  relatedJobs: string[]
  faqs: { question: string; answer: string }[]
}[] = [
  {
    slug: 'how-to-compare-electric-vans',
    title: 'How to compare electric vans: range, payload and charging',
    excerpt:
      'The five figures that decide whether an electric van fits your fleet, and how to read them without falling for brochure numbers.',
    relatedTypes: ['vans', 'small-vans', 'mid-size-vans', 'large-vans'],
    relatedJobs: ['last-mile-delivery', 'trades', 'service-fleets'],
    markdown: `
Electric vans look similar on paper, but small differences in battery, payload and charging decide whether a van completes your routes without stress. These five figures matter most. You can compare them side by side for every model in our [vans section](/en/types/vans).

## 1. Usable battery capacity

Manufacturers publish gross or usable (net) capacity. Only usable capacity tells you how much energy you can actually drive with. We show the usable figure wherever the manufacturer publishes it.

## 2. Range: WLTP and your real route

The WLTP range is measured in a standard cycle and is useful for comparing models with each other. For your own planning:

- take your **longest regular daily route**,
- add **20–30 %** as a reserve for winter, full payload and motorway stretches,
- and compare this with the WLTP range.

If the van charges at the depot every night, a range comfortably above your longest route is enough. A larger battery adds cost and weight, and weight reduces payload.

## 3. Payload after the battery

Batteries are heavy. Compare the payload of the exact version you are considering, not the lightest version in the range. Many large electric vans are therefore offered with a gross weight of 4.25 t. In several EU countries, including Germany, these can be driven on a car licence (B) for goods transport under conditions. Check your national rules.

## 4. AC charging for the depot

Most electric vans charge overnight at the depot on AC. The onboard charger decides how fast: 11 kW charges a typical 70–90 kWh battery in roughly 7–9 hours, 22 kW in about half the time. For fleets that return late and leave early, a 22 kW onboard charger can be worth the extra cost.

## 5. DC charging for the day

DC fast charging matters if vans need a top-up during the day. Compare peak DC power, and look for published 10–80 % charging times, which reflect the whole charging curve better than the peak value.

## A quick checklist

- Usable battery capacity and WLTP range with a 20–30 % reserve
- Payload of the exact version
- Load volume and door openings
- AC onboard charger (11 or 22 kW) and DC peak power
- Heat pump for winter efficiency
- Licence needed for the heaviest version

Use [compare](/en/compare) to put up to four vans side by side with the best value marked.
`,
    faqs: [
      {
        question: 'Is WLTP range realistic for electric vans?',
        answer:
          'WLTP is a standardised figure that is good for comparing models. For planning, add a reserve of 20–30 % for winter, full payload and motorway driving.',
      },
      {
        question: 'Do I need a heat pump in an electric van?',
        answer:
          'A heat pump reduces the energy needed for cab heating and noticeably improves winter range, especially for short trips with many stops.',
      },
    ],
  },
  {
    slug: 'charging-an-electric-fleet-at-the-depot',
    title: 'Charging an electric fleet at the depot: AC or DC?',
    excerpt:
      'How much charging power a commercial fleet really needs, when AC is enough, and when DC chargers pay off.',
    relatedTypes: ['vans', 'trucks', 'buses'],
    relatedJobs: ['last-mile-delivery', 'urban-distribution', 'city-bus'],
    markdown: `
Most commercial vehicles are parked at the depot for many hours every night. That makes depot charging the cheapest and simplest way to run an electric fleet. The key question is how much power you need.

## Start with energy, not with chargers

For each vehicle, estimate the **energy used per day**: daily distance times consumption, or battery capacity times the share typically used. Then compare it with the **time available** at the depot.

Example: a van uses 60 kWh on a typical day and is parked for 10 hours. A charging power of 6–7 kW would already be enough. An 11 kW AC wallbox leaves a comfortable reserve.

## When AC is enough

AC charging with 11 or 22 kW per vehicle suits fleets that:

- park for 8 hours or more,
- use less than about 150 kWh per vehicle and day,
- and charge vans or light trucks with a matching onboard charger.

AC wallboxes are inexpensive and easy to install in large numbers. Load management spreads the available grid capacity across all vehicles.

## When DC pays off

DC chargers make sense when:

- vehicles have large batteries (heavy trucks, buses) that AC cannot fill overnight,
- vehicles run multiple shifts with short breaks,
- or vans need a quick top-up during the day.

Look at the vehicle's peak DC power and its published 10–80 % charging time. A 150 kW charger is wasted on a van that accepts 50 kW.

## Grid connection and load management

The grid connection is often the real bottleneck. Smart load management, staggered departure times and, where needed, a battery storage unit or on-site solar power can avoid an expensive grid upgrade. Talk to your grid operator early.

## Checklist

- Daily energy per vehicle and parking time
- Onboard AC charger and DC peak power of each model (see the listings)
- Grid connection capacity and load management
- Space for cables and chargers, and a plan for growth

Compare charging figures of vans, trucks and buses in our [vehicle directory](/en/vehicles).
`,
    faqs: [
      {
        question: 'How long does it take to charge an electric van on AC?',
        answer:
          'With an 11 kW onboard charger, a 70–90 kWh battery takes roughly 7–9 hours from low to full; with 22 kW about half as long. Most vans are parked long enough overnight.',
      },
    ],
  },
]
