import type { ComponentType } from 'react';
import type { z } from 'zod';

export type RendererProps<TData, TResultDetails = unknown> = {
  data: TData;
  /** Plain text for coordinated read-aloud (QuestionSpeakProvider desc slot). */
  descText?: string;
  onResult: (result: {
    correct: boolean;
    ms: number;
    details?: TResultDetails;
  }) => void;
  onMicroEvent?: (event: { kind: string; payload?: unknown }) => void;
  resumeFromSnapshot?: unknown;
  saveSnapshot?: (snapshot: unknown) => void;
};

export type TemplateRegistration<TData = unknown, TResultDetails = unknown> = {
  kind: string;
  schema: z.ZodSchema<TData>;
  exemplar: TData;
  classifications: {
    fastLane: boolean;
    microworld: boolean;
    constructionist: boolean;
    bodySyntonic: boolean;
    debugStyle: boolean;
  };
  Renderer: ComponentType<RendererProps<TData, TResultDetails>>;
  Briefing?: ComponentType<{ data: TData }>;
  describePrompt: (data: TData) => string;
  estimateMs?: (data: TData) => number;
  defaultConfidenceMs?: number;
};

export const REGISTRY: Record<string, TemplateRegistration> = {};
