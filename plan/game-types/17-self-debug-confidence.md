# 17 — Self-Debug Confidence

**One-liner**: Before each question, predict how likely *you* are to get it right; after, see your calibration curve over time — debug your own model of your own knowledge.

## Papert principles embodied

- **Debugging as a learning style**: Papert's central pedagogical move turned inward. The student's *own knowledge model* becomes the object-to-think-with. Bugs in the model — overconfidence, underconfidence, fragility — become visible and fixable.
- **Object-to-think-with**: the calibration curve is the object. It updates with each attempt, and the student carries it across the whole curriculum. It's *theirs*, persistent, inspectable.
- **Powerful idea: metacognition**. Knowing what you know — and knowing how you know what you know — is a powerful thinking skill. Papert and Kay both wanted students who could *think about their own thinking*. This is the explicit microworld for that.
- **Hard fun**: well-calibrated prediction is genuinely hard. The achievement of a tight calibration curve is its own reward.

## What the student does

1. Before each unit (or each *batch* of units, to avoid prediction fatigue), a thin slider appears: **"How likely are you to get this one right?"** with marks at 25%, 50%, 75%, 90%, 99%.
2. The student commits a confidence prediction. The slider hides; the question proceeds normally.
3. After the question is answered (right or wrong), the result is recorded — both *outcome* and *prediction*.
4. On the journeys page, a **calibration plot** displays the student's running history: confidence on the x-axis, actual accuracy on the y-axis, with the ideal diagonal as reference. Over-confident attempts plot below the line; under-confident above.
5. The plot updates in real time. The student can see, for example, "I'm well-calibrated above 75% but overconfident at the 50-70% range" — and adjust.
6. A small **bug catcher** panel surfaces specific miscalibrations: "You predicted 90%+ on the last 5 mitosis questions and got 60%. Your model of mitosis is overconfident."

## Biology examples

This game type doesn't have biology *content* of its own — it overlays on any other quiz template. But it has biology *adaptations*:

**Topic-level calibration**: separate calibration curves per Wing (Evolution, Cells, Genetics). The student sees their model is well-calibrated for genetics but wildly overconfident for cell biology — directs review.

**Pre-quiz "warm-up" prediction**: before starting a journey, predict your overall accuracy. After the journey, compare. Teaches student to anticipate their own performance.

**Subtopic detection**: the bug catcher learns to detect topic clusters where the student is consistently miscalibrated. "Your model of *enzyme inhibition* is fragile — you're 50/50 even at high confidence."

## Template data shape

This template is unusual — it *wraps* other templates rather than being one. It's enabled per-journey from the content management settings.

```ts
type CalibrationWrapperConfig = {
  enabled: boolean;
  granularity: 'per-question' | 'per-batch-of-3' | 'per-unit';
  confidenceMarks: number[];        // default [25, 50, 75, 90, 99]
  showBeforeAnswering: boolean;     // default true
};

type CalibrationRecord = {
  attemptId: string;
  knowledgeUnitId: string;
  topicPath: string[];              // for per-topic calibration
  templateKind: string;
  predictedConfidence: number;      // 0..1
  outcomeCorrect: boolean;
  ms: number;
  timestamp: number;
};
```

Storage: an append-only log in `evo-quest.v1.calibration`. Calibration curves are computed lazily from the log on view. Never deleted (except by the user explicitly clearing all progress).

## Reveal & feedback design

- **Slider commits invisibly**: once the student lets go of the slider, it animates away — no "are you sure?" friction.
- **Post-question note**: a one-line note after each question: "You predicted 75%, you got it right. Consistent with your calibration." or "You predicted 50%, but you actually have 80% accuracy on this kind of question — you're underconfident here."
- **Calibration plot on journeys page**: a scatter of (predicted, actual) bins with the diagonal reference line. Animated as new data arrives.
- **Bug catcher panel**: surfaces ≤3 specific miscalibrations the student should act on. Each links to a "Review this topic" journey.
- **No nagging**: if the student is well-calibrated, the system stops surfacing the slider after every question (uses a sampling schedule).

## Variations

- **Tournament mode**: at the end of a journey, the student gets a Brier score (proper scoring rule for probabilistic predictions). Lower is better. The score persists; the student can chase it.
- **Topic-confidence map**: a heatmap of the content tree colored by calibration tightness. Hot spots = topics where the student's self-knowledge is shaky.
- **Pre-commitment retrospective**: at the end of each journey, ask the student which questions they predicted *would be* hardest. Reveal whether they were right.

## Anti-patterns

- **Mandatory on every question**: prediction fatigue is real. Sample on every Nth question or batch.
- **Punishing miscalibration**: this game type *never* affects the student's "score" on the actual quizzes. It surfaces a *separate* metric. Tying confidence prediction to the main scoring incentivizes hedging (always-pick-50%).
- **Hiding the data**: the calibration log must be exportable as JSON. The student owns their own metacognitive history.
- **No actionable surfacing**: a calibration plot the student can't act on is decoration. The bug catcher panel is *required* — concrete miscalibrations get named.

## Authoring notes

- This game type doesn't require content authoring per unit — it's a system-level feature. Enable per-curriculum.
- The bug catcher's misconception clustering needs ≥20 attempts per topic to be useful. Don't surface bug catchers until enough data exists.
- The calibration plot should be visible from day one but only *meaningful* after ~50 attempts. Show a "more data needed" overlay until then.
- Pair well with predict-run-reflect (game type 04) — that pattern teaches *predicting outcomes*; this pattern teaches *predicting your own performance*. Both are pieces of mature scientific thinking.
