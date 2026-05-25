import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TeachPanel } from '@/components/content/TeachPanel';
import type { TeachBlock } from '@/types';

const teach: TeachBlock = {
  headline: 'Temperature and pH Shape Enzyme Function',
  body: `Two factors affect enzymes.

![Effect of temperature on enzyme activity](/content/biochemistry/figures/p02_enzyme_activity_graph.svg)

| Factor | Effect |
| --- | --- |
| Temperature | Changes reaction rate |
| pH | Alters active site shape |`,
  figures: [
    {
      id: 'p02_enzyme_activity_graph',
      alt: 'Bell curve of enzyme activity versus temperature',
      caption: 'Optimum near 45°C',
    },
  ],
  poweredIdea: 'Enzymes work best at an optimum temperature.',
};

describe('TeachPanel', () => {
  it('renders headline, markdown body, table, and figure', () => {
    render(<TeachPanel teach={teach} compact />);
    expect(
      screen.getByRole('heading', { name: teach.headline }),
    ).toBeTruthy();
    expect(screen.getByRole('table')).toBeTruthy();
    expect(
      screen.getByRole('img', {
        name: 'Bell curve of enzyme activity versus temperature',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Optimum near 45°C')).toBeTruthy();
  });

  it('hides body in compact mode when includeBody is false', () => {
    render(<TeachPanel teach={teach} compact includeBody={false} />);
    expect(screen.queryByTestId('teach-body')).toBeNull();
    expect(screen.getByRole('heading', { name: teach.headline })).toBeTruthy();
  });
});
