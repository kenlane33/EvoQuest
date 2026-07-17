import { describe, expect, it } from 'vitest';
import { prepareTextForSpeech } from '@/tts';

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
      'ENDO equals INSIDE. S Y M equals TOGETHER.',
    );
    expect(prepareTextForSpeech('A=WITHOUT, BIO=LIFE')).toBe(
      'A equals WITHOUT, B I O equals LIFE',
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

  it('reads clock times naturally', () => {
    expect(prepareTextForSpeech('Meet at 10:00.')).toBe('Meet at ten.');
    expect(prepareTextForSpeech('Starts at 10:30.')).toBe('Starts at ten thirty.');
    expect(prepareTextForSpeech('Arrive by 9:05.')).toBe('Arrive by nine oh five.');
    expect(prepareTextForSpeech('Ends at 12:45.')).toBe('Ends at twelve forty five.');
    expect(prepareTextForSpeech('From 10:00 to 10:30')).toBe('From ten to ten thirty');
  });

  it('still reads digit ratios as "to"', () => {
    expect(prepareTextForSpeech('3:1 phenotypic ratio')).toBe('3 to 1 phenotypic ratio');
  });

  it('handles temperature, percent, and ampersand', () => {
    expect(prepareTextForSpeech('Optimum ~45°C')).toBe('Optimum about 45 degrees Celsius');
    expect(prepareTextForSpeech('~10% energy transfer')).toBe('about 10 percent energy transfer');
    expect(prepareTextForSpeech('Miller & Urey produced amino acids')).toBe(
      'Miller and Urey produced amino acids',
    );
  });

  it('reads central dogma notation', () => {
    expect(prepareTextForSpeech('DNA → RNA → protein')).toBe('D N A to R N A to protein');
    expect(prepareTextForSpeech('read 5′→3′')).toBe('read 5 prime to 3 prime');
  });

  it('spells out likely acronyms letter by letter', () => {
    expect(prepareTextForSpeech('Chloroplasts produce ATP.')).toBe(
      'Chloroplasts produce A T P.',
    );
    expect(prepareTextForSpeech('Translate mRNA at the ribosome.')).toBe(
      'Translate m R N A at the rybosome.',
    );
    expect(prepareTextForSpeech('siRNA silences genes.')).toBe('s i R N A silences genes.');
    expect(prepareTextForSpeech('The pH scale measures acidity.')).toBe(
      'The p H scale measures acidity.',
    );
    expect(prepareTextForSpeech('PCR amplifies DNA.')).toBe('P C R amplifies D N A.');
  });

  it('does not spell out common short words or long tokens', () => {
    expect(prepareTextForSpeech('It is in the US or UK.')).toBe('It is in the US or U K.');
    expect(prepareTextForSpeech('PHENO to PHONE')).toBe('PHENO to PHONE');
    expect(prepareTextForSpeech('Keep going every day.')).toBe('Keep going every day.');
  });

  it('replaces hyphens in compound words with spaces', () => {
    expect(prepareTextForSpeech('well-known fact')).toBe('well known fact');
    expect(prepareTextForSpeech('state-of-the-art')).toBe('state of the art');
    expect(prepareTextForSpeech('single-celled organisms')).toBe('single celled organisms');
  });

  it('preserves plain prose', () => {
    expect(prepareTextForSpeech('Keep going — every attempt builds the map.')).toBe(
      'Keep going, every attempt builds the map.',
    );
  });

  it('disambiguates biology terms with single-token respellings (no prosodic breaks)', () => {
    expect(prepareTextForSpeech('Ribosomes read codons.')).toBe('Rybosomes read codons.');
    expect(prepareTextForSpeech('Translate mRNA at the ribosome.')).toBe(
      'Translate m R N A at the rybosome.',
    );
    expect(prepareTextForSpeech('RIBOSOME = PROTEIN PRINTER')).toBe(
      'RYBOSOME equals PROTEIN PRINTER',
    );
    expect(prepareTextForSpeech('Mitochondria produce ATP.')).toBe(
      'Mydoughchondria produce A T P.',
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

  it('respells job as jahb (role sense, not biblical Johb)', () => {
    expect(prepareTextForSpeech('Each organelle has a job.')).toBe('Each organelle has a jahb.');
    expect(prepareTextForSpeech('Each Organelle Has a Job')).toBe('Each Organelle Has a Jahb');
    expect(prepareTextForSpeech('reshaped for new jobs')).toBe('reshaped for new jahbs');
  });
});
