'use client';

import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ReaderQuiz } from '@/components/reader/ReaderQuiz';
import type { ReaderQuestion } from '@/components/reader/reader-types';
import { T1_QUIZ, T1_QUIZ_TITLE } from './-t1-quiz-data';

export const Route = createFileRoute('/t1')({
  component: T1Page,
});

/** Standard mRNA codon chart, supplied for questions whose source had only an image. */
const CODON_CHART = `mRNA CODON CHART  (read 1st -> 2nd -> 3rd base)
      U          C          A          G
  +----------+----------+----------+----------+
U | UUU Phe  | UCU Ser  | UAU Tyr  | UGU Cys  | U
  | UUC Phe  | UCC Ser  | UAC Tyr  | UGC Cys  | C
  | UUA Leu  | UCA Ser  | UAA STOP | UGA STOP | A
  | UUG Leu  | UCG Ser  | UAG STOP | UGG Trp  | G
  +----------+----------+----------+----------+
C | CUU Leu  | CCU Pro  | CAU His  | CGU Arg  | U
  | CUC Leu  | CCC Pro  | CAC His  | CGC Arg  | C
  | CUA Leu  | CCA Pro  | CAA Gln  | CGA Arg  | A
  | CUG Leu  | CCG Pro  | CAG Gln  | CGG Arg  | G
  +----------+----------+----------+----------+
A | AUU Ile  | ACU Thr  | AAU Asn  | AGU Ser  | U
  | AUC Ile  | ACC Thr  | AAC Asn  | AGC Ser  | C
  | AUA Ile  | ACA Thr  | AAA Lys  | AGA Arg  | A
  | AUG Met  | ACG Thr  | AAG Lys  | AGG Arg  | G
  +----------+----------+----------+----------+
G | GUU Val  | GCU Ala  | GAU Asp  | GGU Gly  | U
  | GUC Val  | GCC Ala  | GAC Asp  | GGC Gly  | C
  | GUA Val  | GCA Ala  | GAA Glu  | GGA Gly  | A
  | GUG Val  | GCG Ala  | GAG Glu  | GGG Gly  | G
  +----------+----------+----------+----------+
DNA -> mRNA: A->U, T->A, C->G, G->C (template strand).`;

const PEPTIDE_BOND_ART = `A peptide bond links two amino acids: the carboxyl
carbon of one bonds to the nitrogen of the next.

      H   O                 H   O
      |   ||                |   ||
  H - N - C - [ C - N ] - C - C - OH
      |        ||  |       |
      R        O   H       R
                 ^
        peptide bond (C - N)`;

/** Supplemental context for questions whose source document only had an image. */
const SUPPLEMENT: Record<number, { ascii?: string; figureNotes?: string[] }> = {
  1: { ascii: CODON_CHART },
  7: {
    ascii: CODON_CHART,
    figureNotes: [
      'Transcribe the DNA to mRNA, then read the chart: TAC->AUG (Met), CCC->GGG (Gly), GCA->CGU (Arg), AGT->UCA (Ser).',
    ],
  },
  33: {
    figureNotes: [
      'The diagram shows two homologous chromosomes lying side by side and swapping matching segments — this is crossing-over during prophase I of meiosis.',
    ],
  },
  41: { ascii: CODON_CHART },
  48: {
    figureNotes: [
      'Bacterial transformation steps: Step 1 — a plasmid and the source DNA are each cut open. Step 2 — the gene is inserted into the plasmid. Step 3 — the plasmid is taken up by a bacterium. Step 4 — the bacteria are grown and selected. The cutting in Step 1 is done by restriction enzymes.',
    ],
  },
  49: {
    figureNotes: [
      'The bacterial cell diagram labels Structure I as the large main chromosome and Structure II as a small, separate circular loop of DNA floating in the cytoplasm.',
    ],
  },
  50: {
    figureNotes: [
      'DNA similarity to Bird 1 — Bird 2: 96%, Bird 3: 90%, Bird 4: 74%, Bird 5: 41%. The least similar DNA means least related.',
    ],
  },
  55: {
    figureNotes: [
      'Steps to modify a bacterium with animal DNA: Step 1 — cut the animal DNA. Step 2 — cut the bacterial plasmid. Step 3 — join the animal gene into the plasmid (this combined molecule is recombinant DNA). Step 4 — insert the plasmid into the bacterium.',
    ],
  },
  70: {
    figureNotes: [
      'The diagram shows a mixed bacteria population; after antibiotics, only a few resistant cells survive; those few then reproduce into a new, mostly-resistant population.',
    ],
  },
  89: {
    ascii: CODON_CHART,
    figureNotes: [
      'Serine (Ser) codons on the chart are UCU, UCC, UCA, UCG, AGU, and AGC. Work back to the DNA coding strand to match an answer.',
    ],
  },
  96: { ascii: PEPTIDE_BOND_ART },
  98: {
    figureNotes: [
      'The structure shows a glycerol head joined to long hydrocarbon (fatty-acid) chains — a lipid. Remember "like dissolves like": nonpolar lipids dissolve best in a nonpolar solvent.',
    ],
  },
  101: {
    figureNotes: [
      'Three pathways across the membrane — X: molecules drift down their gradient straight through the bilayer (simple diffusion). Y: molecules move down their gradient through a channel protein (facilitated diffusion). Z: a protein pump pushes molecules UP their gradient using ATP. Active transport is the one that uses ATP against the gradient.',
    ],
  },
  115: {
    figureNotes: [
      'The word equation shown is: glucose + oxygen -> carbon dioxide + water + energy (ATP).',
    ],
  },
  116: {
    figureNotes: [
      'Option A: carbon dioxide + water + light energy -> glucose + oxygen. (The other options show respiration or unbalanced equations.)',
    ],
  },
  121: {
    figureNotes: [
      'Cell 1 is large with a true nucleus and membrane-bound organelles; Cell 2 is much smaller with no nucleus — just a cell membrane, cytoplasm, and free-floating ribosomes.',
    ],
  },
};

function T1Page() {
  const questions = useMemo<ReaderQuestion[]>(
    () =>
      T1_QUIZ.map((q) => {
        const extra = SUPPLEMENT[q.n];
        return {
          id: `t1-q${q.n}`,
          label: String(q.n),
          stem: q.prompt,
          ...(extra?.ascii ? { ascii: extra.ascii } : {}),
          ...(extra?.figureNotes ? { figureNotes: extra.figureNotes } : {}),
          kind: 'choice',
          multi: false,
          choices: q.choices.map((c) => ({
            label: c.letter,
            text: c.text,
            correct: c.letter === q.answer,
          })),
        };
      }),
    [],
  );

  return (
    <ReaderQuiz
      storageKey="t1"
      eyebrow="Test as Reader · T1"
      title={T1_QUIZ_TITLE}
      intro="Tap a question to hear it. With Auto on it plays straight through — reads the question, counts 3 · 2 · 1, then reads and highlights the answer. Tap a choice any time to answer early: wrong turns red, green is the way forward. Use Pause (left) to think. Turn Auto off to go fully by tap."
      questions={questions}
    />
  );
}
