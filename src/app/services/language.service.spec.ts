import { LanguageService } from './language.service';
import { Language } from '../models/Preference';

describe('LanguageService', () => {
  describe('getLanguageString', () => {
    it('returns custom labels for the English variants', () => {
      expect(LanguageService.getLanguageString(Language.ENGLISH_BRITISH)).toBe(
        'English (UK)',
      );
      expect(LanguageService.getLanguageString(Language.ENGLISH_AMERICAN)).toBe(
        'English (US)',
      );
      expect(LanguageService.getLanguageString(Language.ENGLISH_200)).toBe(
        'English (200)',
      );
    });

    it('capitalises the enum value as a fallback', () => {
      expect(LanguageService.getLanguageString(Language.FRENCH)).toBe('French');
      expect(LanguageService.getLanguageString(Language.GERMAN)).toBe('German');
      expect(LanguageService.getLanguageString(Language.RUSSIAN)).toBe(
        'Russian',
      );
      expect(LanguageService.getLanguageString(Language.CUSTOM)).toBe('Custom');
    });
  });

  describe('getLanguageISO', () => {
    it('maps known languages to their ISO 639-1 codes', () => {
      expect(LanguageService.getLanguageISO(Language.DUTCH)).toBe('nl');
      expect(LanguageService.getLanguageISO(Language.FRENCH)).toBe('fr');
      expect(LanguageService.getLanguageISO(Language.GERMAN)).toBe('de');
      expect(LanguageService.getLanguageISO(Language.RUSSIAN)).toBe('ru');
      expect(LanguageService.getLanguageISO(Language.SPANISH)).toBe('es');
    });

    it('maps the English variants distinctly', () => {
      expect(LanguageService.getLanguageISO(Language.ENGLISH_BRITISH)).toBe(
        'en-gb',
      );
      expect(LanguageService.getLanguageISO(Language.ENGLISH_AMERICAN)).toBe(
        'en-us',
      );
      expect(LanguageService.getLanguageISO(Language.ENGLISH_200)).toBe(
        'en-gb',
      );
    });

    it('maps special-purpose entries', () => {
      expect(LanguageService.getLanguageISO(Language.PROGRAMMING)).toBe('dev');
      expect(LanguageService.getLanguageISO(Language.CUSTOM)).toBe('custom');
    });

    it("returns 'unknown' for unknown enum values", () => {
      // Cast through unknown so we can simulate a value that isn't part of the
      // enum at runtime — the default branch should kick in.
      const unknown = 'totally-not-a-language' as unknown as Language;
      expect(LanguageService.getLanguageISO(unknown)).toBe('unknown');
    });
  });

  describe('compareCharacter', () => {
    it('returns true for identical characters', () => {
      expect(LanguageService.compareCharacter('a', 'a')).toBeTrue();
    });

    it('returns false for different characters', () => {
      expect(LanguageService.compareCharacter('a', 'b')).toBeFalse();
    });

    it('returns false when either input is empty', () => {
      expect(LanguageService.compareCharacter('', 'a')).toBeFalse();
      expect(LanguageService.compareCharacter('a', '')).toBeFalse();
      expect(LanguageService.compareCharacter('', '')).toBeFalse();
    });

    it('is case-sensitive when ignoreAccents is false', () => {
      expect(
        LanguageService.compareCharacter('A', 'a', Language.CUSTOM, false),
      ).toBeFalse();
    });

    it('treats Russian ё as е under ignoreAccents only for RUSSIAN', () => {
      expect(
        LanguageService.compareCharacter('е', 'ё', Language.RUSSIAN, true),
      ).toBeTrue();
      // Without ignoreAccents the substitution is not applied.
      expect(
        LanguageService.compareCharacter('е', 'ё', Language.RUSSIAN, false),
      ).toBeFalse();
      // Under a different language the Russian map isn't consulted.
      expect(
        LanguageService.compareCharacter('е', 'ё', Language.GERMAN, true),
      ).toBeFalse();
    });

    it('treats Arabic أ as ا under ignoreAccents for ARABIC', () => {
      expect(
        LanguageService.compareCharacter('ا', 'أ', Language.ARABIC, true),
      ).toBeTrue();
    });

    it('treats French é as e under ignoreAccents for FRENCH', () => {
      expect(
        LanguageService.compareCharacter('e', 'é', Language.FRENCH, true),
      ).toBeTrue();
    });

    it('preserves case when substituting an uppercase accented char', () => {
      // Uppercase É should map through the lowercase entry but yield 'E'.
      expect(
        LanguageService.compareCharacter('E', 'É', Language.FRENCH, true),
      ).toBeTrue();
      // And shouldn't accidentally match a lowercase 'e'.
      expect(
        LanguageService.compareCharacter('e', 'É', Language.FRENCH, true),
      ).toBeFalse();
    });

    it('NFC-normalises both inputs so combining and precomposed forms match', () => {
      // 'é' as a single codepoint vs 'e' + combining acute (U+0301).
      const precomposed = 'é';
      const decomposed = 'é';
      expect(precomposed).not.toBe(decomposed);
      expect(
        LanguageService.compareCharacter(precomposed, decomposed),
      ).toBeTrue();
    });
  });

  describe('compare', () => {
    it('returns true for identical strings', () => {
      expect(LanguageService.compare('hello', 'hello')).toBeTrue();
    });

    it('returns true for two empty strings (length match, no iterations)', () => {
      expect(LanguageService.compare('', '')).toBeTrue();
    });

    it('returns false for strings of different lengths', () => {
      expect(LanguageService.compare('hello', 'hellos')).toBeFalse();
      expect(LanguageService.compare('a', '')).toBeFalse();
    });

    it('returns false for non-string inputs (typeof guard)', () => {
      // The function checks typeof at runtime — exercise that branch.
      expect(
        LanguageService.compare(undefined as unknown as string, 'hello'),
      ).toBeFalse();
      expect(
        LanguageService.compare('hello', null as unknown as string),
      ).toBeFalse();
      expect(
        LanguageService.compare(
          42 as unknown as string,
          43 as unknown as string,
        ),
      ).toBeFalse();
    });

    it('applies ignoreAccents per character', () => {
      expect(
        LanguageService.compare('cafe', 'café', Language.FRENCH, true),
      ).toBeTrue();
      expect(
        LanguageService.compare('cafe', 'café', Language.FRENCH, false),
      ).toBeFalse();
    });

    it('returns false when any character mismatches', () => {
      expect(LanguageService.compare('hello', 'jello')).toBeFalse();
    });
  });
});
