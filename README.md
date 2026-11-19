# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01/badge.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, open-source guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze (28 hidden on PSN).
Built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01)
on [make.fun](https://make.fun/r/w3zshnah).

## What it does

- **Every trophy, checked against the official list** — name, description and
  grade as Exophase and PSNProfiles publish them, with the PSN progress target
  where the list tracks one (0/250 stunts, 0/42 shooting-range golds, …).
- **Tracker** — tick trophies off, progress saves in the browser (localStorage),
  with export and import as JSON. A progress bar and per-grade counts show how
  far to the platinum.
- **Filters and search** — by grade, by kind (story, side quests, collectibles,
  activities, crime, exploration, money, combat), by earned/remaining, missable
  only, and free-text search across names and descriptions.
- **Spoiler setting** — story trophies stay masked (name and description
  hidden) until earned.
- **Platinum roadmap** — three steps, about 200 hours, one playthrough, built
  from the official descriptions and PowerPyx's roadmap (18 Nov 2026).
- **Missables page** — the one possibly missable trophy (Positive Mental
  Attitude: the Chapter 1 house meditation) and why nothing else can be missed.
- **A guide for every trophy in this entry's own words**, each citing its
  sources (Exophase, PSNProfiles, PowerPyx, GTA Zone). Five trophies have no
  confirmed unlock method in any published guide yet — those entries say so
  plainly instead of inventing a location.

## Run it

Static files, no build step, no network at run time:

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

or serve `app/` with any static file server and open `index.html`.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored make.fun
library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Official list (names, descriptions, grades): [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- PSN progress targets and rarity: [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- Roadmap, methods and counts: [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- Hidden/visible split and roadmap: [GTA Zone — GTA 6 Trophy List](https://gta-zone.com/news/gta-6-trophies-achievements/)

## License

MIT — see [LICENSE](LICENSE). An unofficial fan guide: Grand Theft Auto and
GTA are trademarks of Rockstar Games. No Rockstar logo, artwork or font is
used anywhere in this guide.
