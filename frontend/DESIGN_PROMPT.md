# Mallakhamb AI — Frontend Design Prompt

Use this prompt to regenerate or extend the frontend with consistent styling.

---

## Design Theme

Build a **premium, formal, deceptively fancy** sports AI interface using a **deep navy-blue dark theme**. The UI should feel research-grade and hackathon-demo ready — polished but not flashy.

### Color Palette (strict)

| Purpose              | Color            | Hex       |
| -------------------- | ---------------- | --------- |
| Main Background      | Near Black Navy  | `#030711` |
| Secondary Background | Deep Navy        | `#071426` |
| Card Background      | Dark Blue        | `#0A1B30` |
| Elevated Card        | Slate Navy       | `#10243D` |
| Primary Accent       | Electric Blue    | `#087BEA` |
| Bright Accent        | Cyan Blue        | `#00B8F5` |
| Glow Effect          | Azure Blue       | `#009DFF` |
| Primary Text         | Soft White       | `#F1F5F9` |
| Secondary Text       | Blue Gray        | `#94A3B8` |
| Muted Text           | Dark Gray Blue   | `#64748B` |
| Border               | Subtle Navy Blue | `#1A365D` |

### Typography (formal, not overly bold)

- **Font:** Inter (weights 300, 400, 500, 600 only — avoid 700/bold)
- **Body:** 15px (`0.9375rem`), weight 400
- **Lead/subtitle:** 17px (`1.0625rem`), weight 400
- **H1 (page title):** 36px (`2.25rem`), weight 600, letter-spacing -0.02em
- **H2 (section):** 28px (`1.75rem`), weight 600
- **H3:** 22px (`1.375rem`), weight 500
- **H4:** 18px (`1.125rem`), weight 500
- **Small/labels:** 13–14px, weight 400–500
- **Buttons:** 14px, weight 500

### Visual Style

- Glassmorphism-style cards with navy surfaces (not white glass)
- Soft shadows: `0 4px 24px rgba(0,0,0,0.4)`
- Glow on hover: `0 0 40px rgba(8,123,234,0.12)`
- Rounded corners: 16px cards, 10px buttons/inputs
- Subtle grid overlay on hero section
- Radial gradient orbs (electric blue / cyan) at low opacity
- Gradient CTA buttons: `#087BEA` → `#00B8F5`
- Thin glowing divider lines between sections
- Framer Motion: fade-in, slide-up, subtle hover scale (1.02 max)

### Do NOT use

- Saffron, coral, gold, or Indian tricolor accents
- Pure white `#FFFFFF` backgrounds
- Font weight 700 or `fw-bold` on headings
- Oversized display text (`display-3`, `display-4`)
- Harsh neon colors outside the palette

---

## Tech Stack

React (Vite), Bootstrap 5, React Router DOM, Axios, React Icons, Framer Motion, Recharts, react-circular-progressbar.

Frontend only — dummy JSON data and placeholder API calls.

---

## Component Color Rules

| Element            | Color                                      |
| ------------------ | ------------------------------------------ |
| Page background    | `#030711`                                  |
| Section alt bg     | `#071426`                                  |
| Cards              | `#0A1B30` border `#1A365D`                 |
| Elevated panels    | `#10243D`                                  |
| Primary button     | Gradient `#087BEA` → `#00B8F5`             |
| Outline button     | Border `#1A365D`, hover accent blue        |
| Active nav link    | `#00B8F5` with underline dot               |
| Chart series       | `#087BEA`, `#00B8F5`, `#009DFF`, `#94A3B8` |
| Success/accuracy   | `#00B8F5`                                  |
| Error              | `#F87171`                                  |
| Warning            | `#FBBF24`                                  |
| Skeleton overlay   | `#00B8F5` lines, `#087BEA` joints          |

---

## Pages

Home, About, Pose Library, Image Detection, Live Detection, Video Detection, Dashboard, Research, Contact, 404.

Each page uses `.page-header` with `.page-title` and `.page-subtitle`. Cards use `.glass-card`. Stat values use `.stat-value` / `.stat-label`.

---

## Fancy Effects Checklist

- [ ] Hero radial gradients + grid pattern overlay
- [ ] Floating glow orbs behind hero image
- [ ] Card hover glow border
- [ ] Stats section top gradient line
- [ ] Workflow steps with circular elevated cards
- [ ] Navbar blur + sticky
- [ ] Smooth page transitions (Framer Motion)
- [ ] Live badge pulse glow animation
