import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from '@/components/content/MarkdownContent';

describe('MarkdownContent', () => {
  it('renders markdown tables with accessible structure', () => {
    render(
      <MarkdownContent
        content={'| A | B |\n| --- | --- |\n| 1 | 2 |'}
      />,
    );
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('renders figures from markdown images with alt text', () => {
    render(
      <MarkdownContent
        content={'![Enzyme graph](/content/biochemistry/figures/p02_enzyme_activity_graph.svg)'}
        figures={[
          {
            id: 'p02_enzyme_activity_graph',
            alt: 'Bell curve of enzyme activity versus temperature',
            caption: 'Optimum near 45°C',
          },
        ]}
      />,
    );
    const img = screen.getByRole('img', {
      name: 'Bell curve of enzyme activity versus temperature',
    });
    expect(img.getAttribute('src')).toContain('p02_enzyme_activity_graph.svg');
    expect(screen.getByText('Optimum near 45°C')).toBeTruthy();
  });
});
