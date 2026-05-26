import { Figure } from '@/components/content/Figure';
import type { QuizPlayFigure } from '@/lib/quiz-figures';

type QuizPlayFiguresProps = {
  figures: QuizPlayFigure[];
};

export function QuizPlayFigures({ figures }: QuizPlayFiguresProps) {
  if (figures.length === 0) return null;

  return (
    <div className="mb-4 space-y-3">
      {figures.map((figure) => (
        <Figure
          key={figure.id}
          src={figure.src}
          alt={figure.alt}
          className="my-0"
        />
      ))}
    </div>
  );
}
