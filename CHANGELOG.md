# Release notes

## 1.4.1 - 2026-05-12

### Improvements

- Every content page now shows a "Last updated" date and author below its title, so you can tell at a glance how current each guide and policy is
- Privacy page consent paragraph now describes what actually happens before you consent: Google Analytics runs in cookieless, consent-denied mode (no measurement cookies, no advertising identifiers, no cross-site signals), and AdSense serves only non-personalised ads
- Home FAQ now answers the mobile question accurately: the test works fine on phones and tablets, touch input is fully supported, and the only caveat is that on-screen-keyboard scores aren't directly comparable to physical-keyboard scores

### Fixed

- Bottom-footer link text now meets WCAG AA contrast on the dark theme (was 2.25:1, now ~8.7:1) — the footer links are properly readable instead of fading into the background
- Footer "email" link no longer fails accessibility checkers due to a label/name mismatch; its accessible name now contains the visible word
- A new site deploy now takes effect on the first visit again — previously the service worker would serve the prior deploy's HTML on the first navigation after an update, and only switch on the second

## 1.4.0 - 2026-05-07

### New

- Three new in-depth typing guides: touch typing fundamentals (a beginner-to-intermediate primer with home row, finger zones, posture, drills, and RSI prevention), keyboard layouts compared (an honest walk through QWERTY, Dvorak, Colemak, Workman, AZERTY and whether switching is worth it), and practice routines that work (10-, 30-, and 60-minute deliberate-practice protocols and a weekly shape that compounds)
- A "guides" hover menu in the top nav, grouping the tips overview with the three new in-depth guides

### Improvements

- Restructured the top navigation: a primary "start typing" call-to-action takes the most prominent slot, and less-frequent entries (changelog, contribute, feedback) moved to the footer
- The settings cog now lives in the navbar instead of floating in the corner, scrolling with the rest of the page
- Tips page substantially rewritten — new sections on the bigram bottleneck, multilingual considerations, hardware that actually matters, and how to read the results screen, plus a quick "skip ahead" set of cards near the top
- How-it-works page substantially rewritten — adds formula edge cases, the history of the "five characters per word" convention, how the word lists are constructed, an honest comparison against other typing sites, and the test's known limitations
- About page expanded with the project's origin story, the design principles that shape it, and what's next
- Privacy policy expanded to cover GDPR rights, CCPA / CPRA rights, data retention, international transfers, and how consent works regionally
- Terms of use expanded to cover governing law, acceptable use, age, intellectual property, termination, and word-list licensing
- Compact one-line footer on every viewport, with all secondary links (changelog, contribute, feedback, privacy, terms, email) in one place
- Mobile menu now includes the footer too, so the secondary links are reachable while the menu is open
- EEA, UK, and Switzerland visitors now have advertising personalisation and analytics turned off by default until they make a consent choice; everywhere else stays unchanged

### Fixed

- Accessibility on the typing test page: the page now exposes a heading for screen readers, the typing input has a proper accessible label, and the natural tab order through the controls is restored
- Preferences spinner stuck after switching word mode or language: the new word list loaded correctly, but the in-row spinner kept spinning until the next click. It now clears as soon as the new list is ready.

## 1.3.0 - 2026-05-07

### Improvements

- Faster initial load: Roboto and Roboto Mono are now self-hosted, and analytics and AdSense are deferred until after first paint instead of blocking the page
- Repeat visits load instantly thanks to service-worker caching, and the site keeps working when you're offline
- Tooltips now render in the browser top layer so they're never clipped by parent overflow or hidden behind a modal backdrop
- The settings, Discord, and GitHub icons now dim during a test, matching the header and footer
- Search-engine metadata (the site's Organization and WebApplication schema) now ships with the page rather than being added after JavaScript runs, so crawlers always see it

### Fixed

- Navigating between pages now resets scroll to the top instead of preserving the previous page's scroll position

## 1.2.0 - 2026-05-05

### New

- New landing page at `/` with a feature overview and FAQ; the typing test moved to `/test`
- Terms of Use page at `/terms`
- Display options to hide the timer and live stats during a test
- Skip-to-content link for keyboard users

### Improvements

- Cleaner word and sentence sources across English, Dutch, French, German, Italian, Portuguese, Russian, and Spanish
- Refreshed visual design with consistent spacing, typography, and improved light theme

### Fixed

- Mobile navigation overlay now scrolls on short viewports
- Spanish sentence accents (á, é, í, ó, ú, ü, ñ) are no longer counted as errors
- Corrected the supported-language list and programming-mode description on the About page

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
