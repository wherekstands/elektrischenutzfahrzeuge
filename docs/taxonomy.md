# Taxonomy

Buyers arrive with one of two questions: **"What kind of vehicle?"** (a street sweeper, a 7.5 t truck) or
**"What do I need to get done?"** (winter service, vineyard work, airport ground handling). The taxonomy
therefore has two independent, shallow trees that meet on every listing:

| | Vehicle types | Jobs |
|---|---|---|
| Answers | What it is | What it is used for |
| Per listing | exactly **one** type | **any number** of jobs |
| Levels | group → type | area → job |
| Decides | URL, spec profile, key figures, page layout | job hubs, "Used for", cross-links |
| URL | `/en/types/municipal/street-sweepers` | `/en/jobs/municipal-services/winter-service` |

Both trees are edited in the admin (Catalogue → Vehicle types / Jobs). Nothing is hard-coded: adding a
type, a job or a spec needs no deployment.

## Why two levels, and not more

Two levels keep URLs short, hubs full and navigation predictable. Niches are served without deeper trees:

- **Type × job pages** (Landing pages): curated combinations such as "Electric trucks for waste
  collection" (`/en/types/trucks/for/waste-collection`), with their own intro and FAQs. Create one when a
  combination has at least three listings and real search demand.
- **Cross-listing** ("Also listed in"): a type can appear in a second group without duplicating listings,
  e.g. refuse collection trucks in *Municipal vehicles* and *Trucks*, UTVs in *Pickups & UTVs* and
  *Agriculture & groundcare*, terminal tractors in *Industrial* and *Trucks*.
- **Synonyms** on types and jobs feed the site search ("RCV", "garbage truck", "Kehrmaschine").
- **Filters** handle everything that is a property rather than a kind: payload, licence class, charging
  ports, V2X, price published.

## Rules for editors

1. A **type** is something a buyer would ask for by name and that needs different spec rows or key figures.
   If two candidates share the same specs and buyers compare them against each other, it is one type
   (use a filter or a synonym for the difference).
2. A **job** is a task a fleet has to get done, named the way buyers name it. Jobs never duplicate types
   ("Street cleaning" is a job; "Street sweepers" is a type).
3. Every listing has exactly one type (the closest match) and all jobs it is genuinely marketed for.
4. Groups and areas hold no listings of their own; listings always sit on a type (level 2).
5. Slugs are lowercase ASCII with hyphens and never change silently. Changing a slug writes a redirect.
   `for` and `fuer` are reserved.
6. Keep 3–12 types per group and 4–8 jobs per area. A hub with fewer than three listings is `noindex`
   automatically; it is still reachable.

## Spec profiles

Each type shows **universal specs** (every vehicle) + its **group's specs** + its **own specs**, always in
the same section order: Energy & range → Charging → Drivetrain & performance → Dimensions & weights →
Load & passenger capacity → Work equipment → Configuration & operation → Price & warranty.

Universal: energy source, usable battery, chemistry, system voltage, DC and AC charging power, charging
interfaces, V2L/V2G, motor power, drive, EU vehicle class, driving licence, operation mode, list price
(net), battery warranty.

**Key figures** (up to four per type, e.g. hopper volume, runtime, working width and battery for street
sweepers) appear on cards, in the summary panel, hub comparison tables, titles and descriptions. A type
without its own key figures inherits the group's.

In the listing editor the Specifications tab shows exactly the rows of the selected type, marks key
figures, validates units and ranges, and shows a completeness bar. "Show all specs" allows values outside
the profile (they are kept but only shown where the type's profile includes them).

### Adding a spec

Catalogue → Specs → Create. Choose a stable `key` (snake_case with unit, e.g. `hopper_m3`) and `urlKey`
(used in filter URLs, e.g. `hopper`), unit, data type, and whether higher or lower is better (enables
"best value" in compare and sorting). Then add it to the groups or types that need it. Filterable number
specs become range filters automatically once at least two listings in a hub have a value.

## Current tree

9 groups / 38 types, 8 areas / 42 jobs (seeded from `scripts/seed/taxonomy.ts`, editable in the admin).

**Vehicle types**

- **Vans**: small vans, mid-size vans, large vans
- **Pickups & UTVs**: pickups, UTVs & side-by-sides (also in Agriculture)
- **Light electric vehicles**: cargo bikes & e-trikes, light utility vehicles
- **Trucks**: light (3.5–8.5 t), medium (8.5–18 t), heavy rigid (18 t+), tractor units
- **Buses & coaches**: minibuses & midibuses, city buses, articulated, double-deckers, intercity & coaches
- **Municipal vehicles**: street sweepers, multi-purpose transporters, refuse collection trucks (also in
  Trucks), fire & rescue vehicles
- **Construction machinery**: mini excavators (up to 6 t), excavators (6 t+), wheel loaders, skid steer &
  compact track loaders, telehandlers, dumpers & tracked carriers, rollers & compactors, aerial work
  platforms, demolition robots
- **Agriculture & groundcare**: tractors, farm & yard loaders, slope & remote-controlled mowers, ride-on
  mowers & groundcare, field robots
- **Industrial, port & airport**: forklifts (up to 5 t), heavy forklifts & reach stackers, terminal
  tractors (also in Trucks), tow tractors & tuggers, airport ground support

**Jobs**

- **Logistics & delivery**: last-mile & parcel, urban distribution, night & low-noise delivery,
  refrigerated transport, regional distribution, long-haul, construction logistics, warehousing &
  intralogistics
- **Passenger transport**: urban public transport, regional & intercity, coach & tourism, shuttles &
  on-demand, school & accessible transport
- **Construction & civil engineering**: earthmoving, material handling on site, zero-emission & inner-city
  sites, indoor & underground work, road construction, utility & civil works, demolition & renovation
- **Municipal & public services**: waste collection & recycling, street cleaning, winter service, parks &
  green spaces, road & infrastructure maintenance, fire & rescue
- **Agriculture & forestry**: arable farming, livestock & farmyard, vineyards & orchards, horticulture &
  greenhouses, forestry
- **Landscaping & grounds care**: landscaping, slope & embankment mowing, sports turf & golf, estates,
  campuses & resorts
- **Trades & services**: trades & installation, service & maintenance fleets, facility management, rental
- **Industry, ports & airports**: airports & ground handling, ports & container terminals, industrial
  sites & plants, mining & quarrying

## Changing the taxonomy safely

- **Rename**: edit the name; keep the slug unless the old one is wrong. Changing a slug records a redirect.
- **Move a type to another group**: change its parent. The URL changes (`/types/<group>/<type>`); add a
  redirect in System → Redirects for the old path (types are not redirected automatically yet).
- **Merge two types**: move the listings to the remaining type (bulk edit in the list view), delete the
  other type, add a redirect.
- **Delete**: only when no listings and no child types use it (check the "Children" and "Listings" lists at
  the bottom of the entry first). Add a redirect for the old URL.
- **Translate**: switch the admin locale to Deutsch and fill name, slug, short description and synonyms.
  A type or job appears on the German site only when it has a German name and slug.
