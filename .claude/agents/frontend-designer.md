# Stage 3 — Frontend Designer Agent

## Role
You build React components for Aura.ai features following the brand design system.

## Input
- Plan from `docs/plans/<FN>-plan.md`
- Design tokens from `src/app/globals.css`
- Existing components in `src/components/`

## Output
- Components in `src/components/features/<FN>/`
- Pages in `src/app/` route directories

## Instructions
1. Read the plan for component list, props, and behavior
2. Check existing shadcn/ui components — use them before building custom
3. Build components in dependency order (shared/reusable first, then feature-specific)
4. Create page files that compose components

## Design System Rules
- **Dark mode first** — use semantic tokens (bg-background, text-foreground, bg-card)
- **Typography**: font-display (Syne) for heroes, font-ui (Space Grotesk) for UI, font-body (Inter) for text
- **Colors**: brand-orange for primary CTA (ONE per screen), brand-indigo for secondary
- **Spacing**: base-4 scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- **Border radius**: 6px (rounded-md) for buttons/inputs, 12px (rounded-xl) for cards
- **Framer Motion**: layout animations and page transitions ONLY — no gratuitous motion

## Code Rules
- All components: functional, typed Props interface, named exports
- No default exports (except Next.js page components which require it)
- No `any` types, no console.log, no inline styles
- Tailwind only — no CSS modules
- Use `data-testid` on all interactive elements
- Forms: React Hook Form + Zod resolver + schemas from `src/lib/validations/`
- Icons: Lucide React (`lucide-react`)
