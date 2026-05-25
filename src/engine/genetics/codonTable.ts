const CODON_AA: Record<string, string> = {
  TTT: 'Phe',
  TTC: 'Phe',
  TTA: 'Leu',
  TTG: 'Leu',
  CTT: 'Leu',
  CTC: 'Leu',
  CTA: 'Leu',
  CTG: 'Leu',
  ATT: 'Ile',
  ATC: 'Ile',
  ATA: 'Ile',
  ATG: 'Met',
  GTT: 'Val',
  GTC: 'Val',
  GTA: 'Val',
  GTG: 'Val',
  TCT: 'Ser',
  TCC: 'Ser',
  TCA: 'Ser',
  TCG: 'Ser',
  CCT: 'Pro',
  CCC: 'Pro',
  CCA: 'Pro',
  CCG: 'Pro',
  ACT: 'Thr',
  ACC: 'Thr',
  ACA: 'Thr',
  ACG: 'Thr',
  GCT: 'Ala',
  GCC: 'Ala',
  GCA: 'Ala',
  GCG: 'Ala',
  TAT: 'Tyr',
  TAC: 'Tyr',
  TAA: 'Stop',
  TAG: 'Stop',
  CAT: 'His',
  CAC: 'His',
  CAA: 'Gln',
  CAG: 'Gln',
  AAT: 'Asn',
  AAC: 'Asn',
  AAA: 'Lys',
  AAG: 'Lys',
  GAT: 'Asp',
  GAC: 'Asp',
  GAA: 'Glu',
  GAG: 'Glu',
  TGT: 'Cys',
  TGC: 'Cys',
  TGA: 'Stop',
  TGG: 'Trp',
  CGT: 'Arg',
  CGC: 'Arg',
  CGA: 'Arg',
  CGG: 'Arg',
  AGT: 'Ser',
  AGC: 'Ser',
  AGA: 'Arg',
  AGG: 'Arg',
  GGT: 'Gly',
  GGC: 'Gly',
  GGA: 'Gly',
  GGG: 'Gly',
};

const STOP = new Set(['TAA', 'TAG', 'TGA']);

export function splitCodons(dna: string): string[] {
  const codons: string[] = [];
  for (let i = 0; i + 3 <= dna.length; i += 3) {
    codons.push(dna.slice(i, i + 3));
  }
  return codons;
}

export function translateDna(dna: string): string[] {
  return splitCodons(dna).map((codon) => CODON_AA[codon] ?? '?');
}

export function proteinString(aa: string[]): string {
  return aa.join('-');
}

export type MutationKind = 'silent' | 'missense' | 'nonsense' | 'frameshift';

export function classifySubstitution(
  originalDna: string,
  mutatedDna: string,
): MutationKind {
  if (originalDna.length !== mutatedDna.length) return 'frameshift';
  const origAa = translateDna(originalDna);
  const mutAa = translateDna(mutatedDna);
  let changed = false;
  for (let i = 0; i < origAa.length; i++) {
    if (origAa[i] !== mutAa[i]) {
      changed = true;
      if (STOP.has(mutatedDna.slice(i * 3, i * 3 + 3))) return 'nonsense';
    }
  }
  if (!changed) return 'silent';
  return 'missense';
}
