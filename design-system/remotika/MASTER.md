# Remotika Design System

## Page structure and writing

- The directory starts with a compact introduction followed immediately by search and company rows. Rows expose evidence, vacancies, and check dates in comparable columns.
- Company profiles put vacancies first, public evidence second, and directory facts in a side column. Sharing and README badges live in disclosures.
- Source and contribution guides use an index and prose sections. Technical setup is expandable.
- Verification uses a single-column form with persistent labels and a separate help column.
- Readiness assessment presents statements as a list and results as three score rows. Sharing is secondary.
- Use specific, qualified claims. Public membership is a signal, not proof of employment status or remote policy. Avoid guarantees, hype, and repeated promotional headings.
- Use sentence case and neutral monograms. Color communicates actions and state; it does not decorate every section.

## Product character

Remotika should feel calm, credible, direct, and human. The interface supports research and decision-making; it must not resemble a generic SaaS landing page.

## Foundations

- Use the platform system font stack with optical sizing.
- Prefer hierarchy through spacing, alignment, weight, and content order.
- Use neutral surfaces (`#f5f5f7`, `#ffffff`) and primary text (`#1d1d1f`).
- Use blue (`#0071e3`) only for primary actions and links.
- Avoid decorative gradients, oversized hero typography, floating metric showcases, and excessive pills.
- A container should exist only when it communicates grouping or elevation.

## Typography

| Role | Guidance |
| --- | --- |
| Display / page title | `clamp(2rem, 3.6vw, 2.875rem)`, 600 weight, `-0.025em`, 1.22 line-height |
| Section title | 1.5–1.875rem, 600 weight, `-0.012em`, 1.35 line-height |
| Body | 15–16px, 1.7 line-height, neutral tracking |
| Metadata | At least 12px; never use this size for explanatory paragraphs |
| Form input | 16px minimum to support reading and prevent mobile focus zoom |

## Materials and depth

- The global navigation may use a translucent material because it floats above scrolling content.
- Content cards should normally be opaque white with a subtle border.
- Do not stack translucent cards inside translucent cards.
- Reserve deep shadows and dimming scrims for blocking dialogs.

## Components

- Interactive targets are at least 44×44px.
- Buttons respond on press with `scale(0.97)` for 100–160ms.
- Use native controls and visible focus indicators.
- Status badges communicate status with text and an icon, not color alone.
- Directory results use restrained rows/cards optimized for scanning.
- Advanced filters use progressive disclosure when the number of controls grows.

## Motion

- Motion must explain state, spatial origin, or direct feedback.
- No animated backgrounds, page entrance effects, logo rotation, or card lift on hover. Use quiet color feedback and short dialog transitions.
- Use transform and opacity only for interface motion.
- Entering surfaces use a short ease-out or critically damped spring with no bounce.
- Reversible interactions must remain interruptible.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Accessibility

- Normal text contrast is at least 4.5:1.
- Controls have accessible names and expose pressed/expanded state.
- Decorative icons are hidden from assistive technology.
- Layout must reflow at 375px without horizontal scrolling.
- Forms use persistent labels, inline status, and clear errors.

## Avoid

- Emoji as structural icons.
- Purple/pink AI gradients.
- A pill around every label.
- Every section presented as a rounded card.
- Infinite pulse, bounce, or attention-seeking animation.
- Huge headings that push the primary task below the fold.
- Generic claims such as “100% verified” without qualification.
