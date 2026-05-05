# TypeFast.io - Release notes

## Unreleased

### New

- Replaced the bare typing test on `/` with a content landing page: hero, "What you get" feature list, "How it works" snippet, FAQ, and CTAs that link to the typing test
- Moved the typing test to a dedicated `/test` route
- Added a Terms of Use page at `/terms`
- Added FAQPage structured data (JSON-LD) on the landing page so search engines can pick up the Q&A
- Added "Display options" preferences group with toggles to hide the timer and the live stats during a test

### Improvements

- Slimmed the footer to a single line (copyright · privacy · terms · contact email), with a more compact variant on narrow viewports that hides the author name and shortens the email link to "email"
- Scrubbed profanity and mature themes from word lists across English (American + British), Dutch, French, German, Italian, Portuguese, Russian, and Spanish
- Rewrote or dropped flagged sentences in the English and Spanish sentence sources to remove graphic violence, suicide, drug, and sexual content

### Fixed

- Corrected the supported language list on the About page: Polish was listed but never shipped, Hindi was missing, and the programming mode is now described accurately (it focuses on keywords and punctuation across programming languages, rather than full code snippets)
- Spanish sentences mode: accented letters (á, é, í, ó, ú, ü) and ñ are no longer counted as errors when typed correctly (Unicode normalisation mismatch between the source file and keyboard input)
- Russian word list: lowercased "Здравствуй" / "Здравствуйте" to match the rest of the dictionary
- British word list: corrected the typo "offencive" → "offensive"

## 1.1.0 - 2026-05-05

### New

- Added top navigation with About, Privacy, Terms, and Changelog content pages
- Added mobile hamburger menu with full-screen overlay
- Added minimal site footer with mailto contact link
- Added Google AdSense integration and ads.txt
- Added server-side rendering and prerendering for all routes
- Added per-route SEO metadata, dynamic sitemap, JSON-LD structured data, Organization schema, and a 1200x630 social/Open Graph image

### Improvements

- Updated Angular from 13 to 21 (8 major version upgrades) along with ngx-markdown
- Migrated to standalone components and the new `@if` / `@for` template control flow
- Switched the build to the application builder (esbuild)
- Modernized linting and formatting tooling (ESLint flat config, Prettier, angular-eslint)
- Switched analytics to GA4 and tracked SPA route changes (Shynet + GA4)
- Preload lazy route chunks after initial bundle for faster navigation
- Pinned Node 22 via `.nvmrc` and pinned the Netlify build command

### Fixed

- Serve a real 404 page instead of a soft-404 home redirect
- Stop the footer from overlaying typer content on short viewports
- Made nav and typer components prerender-safe

## 1.0.12 - 2022-12-21

### New

- Added Uyghur language, thanks [Waris Ruzi](https://github.com/WarisWorks)!

## 1.0.11 - 2022-11-12

### Improvements

- Added sentences to Italian language, thanks [nuzguy](https://github.com/nuzguy)!

## 1.0.10 - 2022-03-06

### Improvements

- Updated to Angular 13
- Added sentences to Portuguese language, thanks N i k a o!

## 1.0.9 - 2021-11-06

### Improvements

- Added words and sentences to Portuguese language, thanks Lawliet!
- Add accented characters for 'Ignore accented characters' mode in Portuguese language

## 1.0.8 - 2021-10-30

### New

- Added literature texts and tongue twisters to Russian sentences mode, thanks [talkenson](https://github.com/talkenson)!
- Added Indonesian language

### Improvements

- Update dependencies

## 1.0.7 - 2021-06-07

### New

- Add new 'English(200)' language with 200 most common English words (Thanks for the suggestion!)

### Improvements

- Update dependencies

## 1.0.6 - 2021-03-29

### Improvements

- Set default theme to dark
- Update Angular
- Update dependencies

## 1.0.5 - 2020-12-04

### New

- Added sentences and 'ignore accents' characters for Spanish language, thanks [guillemglez](https://github.com/guillemglez)!
- Added Catalan language, thanks [guillemglez](https://github.com/guillemglez)!

### Improvements

- Remove incorrect words with special characters from all languages
- Update dependencies

### Fixed

- Fix error in German 'ignore accents' mode
- Fix small transition issue when closing preferences pane
- Fix small typo in README

## 1.0.4 - 2020-09-27

### New

- Add option to disable animations during text scrolling
- Added sentences for French language, thanks [RyFax](https://github.com/RyFax)!
- Added Romanian language, currently only words
- Added option to ignore accented characters in word validation: this is language sensitive. For example, in French, the letter 'á' can be typed as 'a' and still be counted as correct when this setting is enabled.

  Currently this settings supports:

  - Russian (ë)
  - French (â,à,á,é,è,ë,ê,ì,î,ï,ù,û,ü,ç)
  - Arabic (أ,إ,آ,ة,ؤ,ئ,ى)
  - Romanian (â,ă,î,ș,ț)
  - Dutch (é,è,ë,ê,ü,ç)
  - German (ä,ö,ü,ß (typed as 's'))

- Added option to ignore casing in word validation

### Improvements

- Disable backspace going to previous page on firefox when pressing after test finish
- Added placeholder sentence for the 'Programming' language
- No longer count an inbetween space character as a correct character if the word before was not correct

### Fixed

- Changed 'heer' to 'here' in American English, thanks [fishstik](https://github.com/fishstik)!

## 1.0.3 - 2020-09-09

### New

- Add changelog tab in info popup
- Added link to google feedback form in info window

### Fixed

- Removed words with accented characters from English language

### Improvements

- Improved preferences menu and loading of languages

## 1.0.2 - 2020-08-31

### New

- Added a changelog file, check it out [here](https://github.com/CasperVerswijvelt/TypeFast/blob/master/README.md)

### Fixed

- Fixed typo in README.md ('screenshtos')
- Fixed bug where you FireFox users would need to tab twice to select the reset button

### Improvements

- Remove ugly tab outline on active reset, increase timer and decrease timer buttons (but keep focus outline for accesibility)
- Split up up the english language into British English and American English

## 1.0.1 - 2020-08-30

### New

- Smooth scrolling is here! You can still change back to the old per-word scrolling in the preferences
- Added option to change text size between 3 levels in the preferences

### Fixed

- Fixed text not becoming smaller on mobile layouts larger than 400px wide
- Fixed japanese (full-width) space not completing a word
- Fixed height of uncollapsed preference groups not being exactly perfect
- Fix typo 'sententes' in Word mode preference

## 1.0.0 - 2020-08-09

### Notes

- Officially released on [reddit](https://www.reddit.com/r/MechanicalKeyboards/comments/iirhiw/typefastio_yet_another_typing_speed_test/?utm_source=share&utm_medium=web2x&context=3)
