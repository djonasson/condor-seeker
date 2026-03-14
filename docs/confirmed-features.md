# Confirmed Features

## Application Setup

- Choose a storage backend: local file, cloud storage service (Goole Drive, etc.).
- Choose prefered units like meters/yards, celsius/fahrenheit, etc.
- Choose a theme: light/dark mode, color scheme.
- Choose a language: English, Spanish, French, etc.

## Player Setup

- Enter main user name, handicap, gender and other basic information.
- Enter golf clubs data for each club, such as type, brand, carry distance, etc.

## Golf Course Setup

- Allow import from open-source and free, community-driven golf course databases
- Enter course name, number of holes, available tees with total length, course rating, slope rating, etc.
- Enter each hole's information such as par, handicap, distance from each tee, etc.

## Round Setup

- Select a course
- Set number of players and enter player names or select from saved players.
- Choose tee box (front/middle/back or red/yellow/white, for example) for each user (by default, the choice of the first player is used as default for the others) to load par, handicap and distance per hole.
- Choose scoring system: stroke play, Stableford, etc. (needs to be flexible to support other formats in the future).

## Scorecard

- Hole-by-hole score entry for each player with optional FIR, GIR, total putts, etc.
- Display par for the current hole.
- Running total (gross score) updated after each hole entry.
- Net score calculation based on player handicap.
- Over/under par indicator per hole and for the round.
- Edit previous hole scores during or after the round.

## Handicap Support

- Enter player handicap index before the round.
- Automatic stroke allocation per hole based on hole handicap.
- Display net score alongside gross score.

## Round Summary

- Final scorecard with all holes, pars, and player scores.
- Total gross and net scores.
- Round date and course name.
- Basic stats: total putts, fairways hit, greens in regulation (optional manual input per hole).

## Round History

- Save completed rounds to chosen storage backend.
- View list of past rounds with date, course, and score.
- View full scorecard for any past round.

## Statistics

- Display basic player stats including total putts, fairways hit, greens in regulation over a time period for one or multiple courses.
- Advanced statistics: average gross score, average net score, etc. per hole or course.

## Import/Export

- Ability to import and export all application data including rounds, settings, and player stats from/to json files.
