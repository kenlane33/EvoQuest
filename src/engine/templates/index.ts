import { REGISTRY, type TemplateRegistration } from '@/engine/templates/registry';

const modules = import.meta.glob('./*.tsx', { eager: true });
const kindSources: Record<string, string> = {};

for (const path of Object.keys(modules)) {
  if (path.endsWith('registry.ts') || path.endsWith('index.ts')) continue;
  const mod = modules[path] as { default?: TemplateRegistration };
  const reg = mod.default;
  if (!reg?.kind) continue;

  const previousPath = kindSources[reg.kind];
  if (previousPath && previousPath !== path) {
    throw new Error(
      `Duplicate template kind: ${reg.kind} (${previousPath} and ${path})`,
    );
  }

  kindSources[reg.kind] = path;
  REGISTRY[reg.kind] = reg;
}

export { REGISTRY };
export type { TemplateRegistration };
