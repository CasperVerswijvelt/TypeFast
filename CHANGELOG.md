# TypeFast.io - Release notes

## Unreleased

### New

- Add option to disable animations during text scrolling
- Added sentences for French language, thanks [RyFax](https://github.com/RyFax)!
- Added Romanian language, currently only words
- Added option to ignore accented characters: this is language sensitive. For example, in French, the letter 'á' can be typed as 'a' and still be counted as correct when this setting is enabled.

  Currently this settings supports:

  - Russian (ë)
  - French (â,à,á,é,è,ë,ê,ì,î,ï,ù,û,ü,ç)
  - Arabic (أ,إ,آ,ة,ؤ,ئ,ى)
  - Romanian (â,ă,î,ș,ț)
  - Dutch (é,è,ë,ê,ü,ç)
  - German (ä,ö,ü,ß (typed as 's'))

### Improvements

- Disable backspace going to previous page on firefox when pressing after test finish
- Added placeholder sentence for the 'Programming' language

### Fixed

- Changed 'heer' to 'here' in American English, thanks [fishstik](https://github.com/fishstik)!

## 1.0.3 - 09-09-2020

### New

- Add changelog tab in info popup
- Added link to google feedback form in info window

### Fixed

- Removed words with accented characters from English language

### Improvements

- Improved preferences menu and loading of languages

## 1.0.2 - 31-08-2020

### New

- Added a changelog file, check it out [here](https://github.com/CasperVerswijvelt/TypeFast/blob/master/README.md)

### Fixed

- Fixed typo in README.md ('screenshtos')
- Fixed bug where you FireFox users would need to tab twice to select the reset button

### Improvements

- Remove ugly tab outline on active reset, increase timer and decrease timer buttons (but keep focus outline for accesibility)
- Split up up the english language into British English and American English

## 1.0.1 - 30-08-2020

### New

- Smooth scrolling is here! You can still change back to the old per-word scrolling in the preferences
- Added option to change text size between 3 levels in the preferences

### Fixed

- Fixed text not becoming smaller on mobile layouts larger than 400px wide
- Fixed japanese (full-width) space not completing a word
- Fixed height of uncollapsed preference groups not being exactly perfect
- Fix typo 'sententes' in Word mode preference

## 1.0.0 - 29-08-2020

### Notes

- Officially released on [reddit](https://www.reddit.com/r/MechanicalKeyboards/comments/iirhiw/typefastio_yet_another_typing_speed_test/?utm_source=share&utm_medium=web2x&context=3)
