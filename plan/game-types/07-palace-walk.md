# 07 — Palace Walk

**One-liner**: Walk a grid-shaped Room of the memory palace — each totem you bump into launches a question, each item you collect is a topic-shaped power-up.

## Papert principles embodied

- **Microworld**: a literal, spatial little world. The room IS the topic.
- **Body syntonic**: arrow keys / WASD make the student a moving body in the space. The classical memory-palace technique works because spatial cognition is older than verbal cognition; this leverages that.
- **Bricolage**: the student picks their *own path* through the room. Different paths produce different question orderings — same content, different lived experience.
- **Powerful idea**: knowledge has *neighborhoods*. Concepts that share a room *are* related. The spatial layout teaches the conceptual taxonomy without ever stating it.

## What the student does

1. A small grid (15×15 or similar) renders as the floor plan of a topic-themed room. The student-avatar (mage emoji, or topic-themed sprite) starts in a doorway.
2. The room contains:
   - **Concept totems** (icons of topic-relevant objects — a mitochondrion sprite, a Punnett tile, a Cambrian fossil)
   - **Power-up items** (hearts for retries, focus tokens for streak-saving)
   - **Walls** that define passageways
3. The student moves with arrow keys / WASD / touch. Bumping into a totem launches a quiz (typically a `speed-reveal-mnemonic` or `match` template tied to that totem's concept).
4. Correctly answering removes the totem and reveals its loot — usually a topic-shaped trinket that fills a slot in the **palace inventory** (the achievement grid).
5. Picking up all the trinkets in a room completes the room. The "ceiling" parts open to reveal the next room.
6. Wrong answers cost a heart; running out of hearts boots the student to a "Rest Room" where they re-read mnemonics until they breathe out and try again.

## Biology examples

**Wing: Cell Biology / Room: Mitochondrion** — totems for *cristae*, *matrix*, *outer membrane*, *electron transport chain*, *ATP synthase*. Each is a totem the student bumps into. Picking them all up unlocks a glowing mitochondrion as the room's achievement.

**Wing: Evolution / Room: Galápagos** — totems for *finch*, *tortoise*, *iguana*, *Darwin's notebook*, *HMS Beagle*. Concepts: adaptive radiation, allopatric speciation, observational science.

**Wing: Genetics / Room: Mendel's Garden** — totems for *pea plant*, *Punnett tile*, *F₁*, *F₂*, *3:1 ratio*. Each totem launches a Punnett-builder or fill quiz.

**Wing: Origin of Life / Room: Primordial Pool** — totems for *Miller-Urey apparatus*, *amino acid*, *RNA strand*, *liposome*. Eerie ambient pulse on the tiles.

## Template data shape

```ts
type PalaceWalkData = {
  roomId: string;
  layout: number[][];               // 0 = floor, 1 = wall
  spawn: { x: number; y: number };
  totems: Array<{
    x: number; y: number;
    icon: string;
    knowledgeUnitId: string;        // launches THIS unit's quiz when bumped
    label: string;                  // hover-shown
  }>;
  items: Array<{
    x: number; y: number;
    kind: 'heart' | 'focus' | 'reveal-token' | 'lore';
    icon?: string;
  }>;
  doors: Array<{
    x: number; y: number;
    toRoomId: string;
    requiresAllTotems?: boolean;
  }>;
};
```

Correctness: a room is "completed" when all its totems are exhausted. Per-totem correctness composes from the nested quiz template's result.

## Reveal & feedback design

- **In-room ambient reveal**: hovering over a totem (before bumping) shows its label and a single etymology root. Discovery rewarded.
- **On bump → quiz overlay**: the quiz template renders as a modal. Same `speed-reveal-mnemonic` pattern applies inside.
- **On totem cleared**: the floor tile under the totem lights up with the achievement icon. The student walks across their own progress.
- **On room cleared**: the floor pattern resolves into a constellation shape — the "powerful idea" of the room rendered as a connected graph of all its totems. This persists as a saved postcard on the journeys page.

## Variations

- **Procedurally generated layouts**: same totems and items, randomized room shape per visit. Replay value without re-authoring.
- **NPC concept-guides**: rare characters (sprite of Darwin, Mendel, Margulis) who block a doorway with a contextually harder question.
- **Hidden lore items**: ~3 per room, off the obvious path, that fill the lore log (Inheritance Protocol-style narrative fragments).
- **Boss totems**: at the end of a Wing, a large totem that launches a multi-template question chain.

## Anti-patterns

- **The space is just decoration**: if the room's layout doesn't matter (totems randomly placed, every order equivalent), it's a regular quiz with chrome. Use real walls and corridors to *make the student commit to a path*.
- **Walking is slow**: avatar must respond in <50ms to keypress. Movement at 8-10 tiles/second.
- **Hearts that punish hesitation**: hearts should refill on room transitions. The Rest Room is a soft retry, not a game over.
- **Quiz overlay that loses position**: if the player closes a quiz, they must return to the *exact* tile they bumped from. Camera persistence is mandatory.

## Authoring notes

- Use ≤10 totems per room. More creates visual noise and ambiguity about completion.
- Lay out walls to *suggest* a narrative path even if the player can take alternates — e.g., the Galápagos room has a central spine with island side-pockets.
- Each room must have a unique tile aesthetic (color palette, ambient detail) so the student forms a vivid spatial memory.
- Items (hearts, focus tokens) should be sparse but reliable — ~2 hearts per room is a good baseline.
