import { describe, expect, it } from 'vitest';
import { prepareTextForSpeech } from '@/audio/speech-substitutions';

describe('prepareTextForSpeech', () => {
  it('expands geologic time abbreviations', () => {
    expect(prepareTextForSpeech('~543 mya')).toBe('about 543 million years ago');
    expect(prepareTextForSpeech('4.5 bya')).toBe('4.5 billion years ago');
    expect(prepareTextForSpeech('2.1 bya and 543 mya')).toBe(
      '2.1 billion years ago and 543 million years ago',
    );
    expect(prepareTextForSpeech('600 Ma')).toBe('600 million years ago');
    expect(prepareTextForSpeech('4 Ga')).toBe('4 billion years ago');
  });

  it('speaks mnemonic equals signs and arrows', () => {
    expect(prepareTextForSpeech('ENDO=INSIDE. SYM=TOGETHER.')).toBe(
      'ENDO equals INSIDE. SYM equals TOGETHER.',
    );
    expect(prepareTextForSpeech('A=WITHOUT, BIO=LIFE')).toBe(
      'A equals WITHOUT, BIO equals LIFE',
    );
    expect(prepareTextForSpeech('PHENO → PHONE')).toBe('PHENO to PHONE');
    expect(prepareTextForSpeech('Hypotonic → turgid; hypertonic → plasmolyzed.')).toBe(
      'Hypotonic to turgid; hypertonic to plasmolyzed.',
    );
  });

  it('expands chemistry subscripts and reaction symbols', () => {
    expect(prepareTextForSpeech('6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂')).toBe(
      '6CO2 plus 6H2O plus light to C6H12O6 plus 6O2',
    );
    expect(prepareTextForSpeech('CH₂O')).toBe('CH2O');
  });

  it('handles temperature, percent, and ampersand', () => {
    expect(prepareTextForSpeech('Optimum ~45°C')).toBe('Optimum about 45 degrees Celsius');
    expect(prepareTextForSpeech('~10% energy transfer')).toBe('about 10 percent energy transfer');
    expect(prepareTextForSpeech('Miller & Urey produced amino acids')).toBe(
      'Miller and Urey produced amino acids',
    );
  });

  it('reads central dogma notation', () => {
    expect(prepareTextForSpeech('DNA → RNA → protein')).toBe('DNA to RNA to protein');
    expect(prepareTextForSpeech('read 5′→3′')).toBe('read 5 prime to 3 prime');
  });

  it('preserves plain prose', () => {
    expect(prepareTextForSpeech('Keep going — every attempt builds the map.')).toBe(
      'Keep going, every attempt builds the map.',
    );
  });

  it('disambiguates biology terms with single-token respellings (no prosodic breaks)', () => {
    expect(prepareTextForSpeech('Ribosomes read codons.')).toBe('Rybosomes read codons.');
    expect(prepareTextForSpeech('Translate mRNA at the ribosome.')).toBe(
      'Translate mRNA at the rybosome.',
    );
    expect(prepareTextForSpeech('RIBOSOME = PROTEIN PRINTER')).toBe(
      'RYBOSOME equals PROTEIN PRINTER',
    );
    expect(prepareTextForSpeech('Mitochondria produce ATP.')).toBe(
      'Mydoughchondria produce ATP.',
    );
    expect(prepareTextForSpeech('The mitochondrial matrix')).toBe('The mydoughchondrial matrix');
    expect(prepareTextForSpeech('Enter the mitochondrion')).toBe('Enter the mydoughchondrion');
    expect(prepareTextForSpeech('mitosis and mitochondria')).toBe('mitosis and mydoughchondria');
    for (const sample of [
      'Rybosomes read codons.',
      'Mydoughchondria produce ATP.',
    ]) {
      expect(sample).not.toMatch(/,\s/);
    }
  });
});
