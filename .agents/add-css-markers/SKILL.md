---
name: add-css-markers
description: >-
  Add or audit C--, oo--, and xx-- CSS class markers on UI files per AGENTS.md.
  Use when instrumenting components, fixing missing markers, scoped /check-ui on
  one file, or when the user says add-css-markers, add markers, or tag for automation.
---

# Add CSS Markers

Instrument UI for browser automation, ElPicker, and `bun run test:ui`. **AGENTS.md §4 is canonical** — this skill applies it file-by-file.

## The Three Prefixes

| Prefix | Put on | Examples |
|--------|--------|----------|
| `C--<Name>` | Component identity — **root element only** | `C--Button` (ui2), `C--ShapefileTab`, `C--PastImportColumnComparison` |
| `oo--<name>` | Everything **not** clickable/typeable — sections, cards, rows, badges, status text, repeating containers | `oo--site-sidebar`, `oo--zip-column-status`, `oo--past-import-column-comparison` |
| `xx--<name>` | **Only** buttons, inputs, and close cousins: `<SelectTrigger>`, `<SelectItem>`, `role="radio"` cards, `<label>` for an input | `xx--merge-execute-start`, `xx--county-search`, `xx--picker-item` |

**Hard rule:** not clickable / not typeable → `oo--`. Repeats are fine on both `oo--` and `xx--`.

**ElPicker priority:** `oo--` > `xx--` > `C--` > other classes.

## Workflow (one file or component)

Copy and track:

```
- [ ] 1. Grep siblings for naming patterns
- [ ] 2. Audit elements — assign prefix per element
- [ ] 3. Add markers (cn(), preserve existing classes)
- [ ] 4. Scoped verify (grep + optional audit script)
- [ ] 5. Fix violations before done
```

### 1. Grep before naming

```bash
# Same domain / folder
rg 'oo--|xx--' src/components/app/import/ --glob '*.tsx' | head -40

# Avoid duplicate interactive names
rg 'xx--your-proposed-name' src/
```

Match local style: `oo--zip-jurisdiction-overlap`, `xx--jurisdiction-suggestion`, `oo--past-import-column-comparison`.

### 2. Decide per element

| Element | Marker |
|---------|--------|
| Exported component root | `C--ComponentName` if missing (PascalCase matches component) |
| Section / panel / card wrapper | `oo--<domain>-<section>` on outermost meaningful wrapper |
| Status / helper text tests need | `oo--<context>-status` on the `<p>` or container |
| `<Button>`, `<button>`, `<Input>`, `<Checkbox>`, `<Switch>`, `<Textarea>` | `xx--<action-or-field>` on the control (or pass via ui2 `className`) |
| `<SelectTrigger>`, `<SelectItem>`, picker row, `role="button"` div | `xx--<role>` |
| Display-only `<Badge>`, `<TableRow>`, static `<Table>` | Usually **no** marker unless a bot must target that node → then `oo--` |
| ui2 wrapper (`src/components/ui2/*.tsx`) | `C--<WrapperName>` on the wrapper root — do not hand-roll in app code |

**Do not** put `oo--` or `xx--` on the same root as `C--` when avoidable (see root conflicts below).

**PageHeader:** put `xx--` on the **parent wrapper**, not on `PageHeader` itself.

### 3. Add markers

```tsx
// Section (non-interactive)
<div className="oo--past-import-column-comparison space-y-2 rounded-md border ...">

// Interactive — marker on the control
<Button className="xx--analyze-more-zips" onClick={...}>

// With cn()
<div className={cn('oo--file-wizard-mapping-step', 'space-y-4', className)}>

// Component root
export function ShapefileTab() {
  return (
    <div className="C--ShapefileTab space-y-6 oo--shapefile-tab pb-24">
```

- Use kebab-case after the prefix.
- Name by **role**, not styling: `xx--merge-execute-start` not `xx--green-submit-btn`.
- Minimal diff — marker + existing Tailwind only.

### 4. Scoped verify

```bash
# All markers in target file(s)
rg '(C--|oo--|xx--)[\w-]+' src/components/app/import/PastImportColumnComparison.tsx

# App-wide source inventory (includes your new markers)
bun run scripts/find-code/check-ui.ts --source

# Root conflicts + prefix stats for files you touched
bun run scripts/find-code/audit-semantic-classes.ts --verbose 2>&1 | rg 'YourFile|conflict'

# Missing C-- on component roots (punch list)
bun run scripts/find-code/enumerate-c-markers.ts --json | rg 'YourComponent'
```

**Scoped report template** (use when user names a file):

```markdown
### `<path>` — marker audit

| Marker | Line | Role | Verdict |
|--------|------|------|---------|

**Missing:** …
**Misclassified:** …
**Result:** pass / fixes applied
```

Live page (only when file is reachable in dev UI): `check-ui` skill or browser-clockwork `whatCan` by marker.

### 5. Common mistakes → fix

| Mistake | Fix |
|---------|-----|
| `xx--` on a `<div>` section | Change to `oo--` |
| `oo--` on `<Button>` / `<Input>` | Change to `xx--` |
| No marker on new primary action | Add `xx--` |
| `C--` + `xx--` both on component root | Move `xx--` to inner control; keep `C--` on root |
| Invented name without grepping | Rename to match sibling pattern |
| Marker only in a child re-export | Put on the element the bot actually sees |

## When `C--` is your job

- **ui2 wrappers:** already pattern — `cn('C--Button', className)`.
- **App components:** root of exported function should have `C--ExactComponentName` when the component renders a single root element.
- Run `enumerate-c-markers.ts` for backlog; `--apply` fixes trivial string/cn cases only.

## References

- Always-on rules: `AGENTS.md` §4
- Inventories: `plan/wiki/codebase/tags-semantic-classes.md`, `tags-functional-classes.md`
- Audit output: `plan/wiki/codebase/instrumenting/semantic-class-audit.md`
- Verify after broad UI changes: `check-ui` skill (`bun run test:ui`)
