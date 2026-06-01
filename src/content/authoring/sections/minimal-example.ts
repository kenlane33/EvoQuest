export function minimalExampleSection(): string {
  const example = {
    id: 'mod.example.user',
    title: 'Example: Macromolecules',
    description: 'One sample unit showing the expected JSON shape.',
    authorRef: 'example',
    schemaVersion: 1,
    appVersionAtAuthoring: '0.1.0',
    source: 'user-import',
    createdAt: 1716595200000,
    tree: [
      {
        id: 'example',
        slug: 'example',
        title: 'Example Wing',
        emoji: '🧪',
        children: [
          {
            id: 'example.review',
            slug: 'review',
            title: 'Review',
            emoji: '📋',
            children: [
              {
                id: 'example.review.core',
                slug: 'core',
                title: 'Core',
                children: [
                  {
                    id: 'example.review.core.carbs',
                    slug: 'carbs',
                    title: 'Carbohydrate Monomers',
                    emoji: '🍬',
                    shortLabel: 'Carbs',
                    longLabel: 'Carbohydrate Monomers',
                    teach: {
                      headline: 'Sugars Are the Carb Monomer',
                      body: 'Carbohydrates are built from monosaccharides — single sugar units like glucose.',
                      poweredIdea: 'Monosaccharides are the building blocks of carbohydrates.',
                    },
                    quizzes: [
                      {
                        kind: 'fill',
                        id: 'quiz.example.review.carbs.monomer',
                        preferred: true,
                        data: {
                          prompt: 'The monomer of carbohydrates is a _____.',
                          acceptable: ['monosaccharide', 'monosaccharides'],
                          hint: 'Single sugar',
                        },
                      },
                    ],
                    achievement: {
                      id: 'ach.example.review.core.carbs',
                      emoji: '🍬',
                      shortLabel: 'Carbs',
                      longLabel: 'Carbohydrate Monomers',
                      flavor: 'Glucose links into chains that store and release energy.',
                      wingId: 'example',
                    },
                    difficulty: 'intro',
                    enabled: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return `# Minimal worked example

Use this as a structural reference (replace all IDs and content):

\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\``;
}
