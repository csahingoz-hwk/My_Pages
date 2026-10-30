---
name: streamvault-portal-icons
description: Portal source icons for StreamVault TV (Caglar's Samsung Tizen IPTV app). Use whenever a StreamVault screen shows which IPTV portal a channel, movie, series, episode, search result or account comes from — or when the user mentions portal logos, portal names, portal badges, source icons, "which portal is this from", the portal switcher pill, onboarding preset cards, or adding a new portal. Replaces every text portal name ("3b", "Tuga") with its icon. Works alongside the streamvault-tv skill (read that one for build/install and Tizen gotchas).
---

# StreamVault TV — Portal Source Icons

**Rule: never render a portal name as text. Always render its icon.** Text names survive only as `alt`/`title` on the `<img>`.
Think of it like football kits: you know the team from the colour before you read the name.

## Icon map (fixed — do not reshuffle)

| Icon id | Look | Portal | Accent |
|---|---|---|---|
| `3b` | Blue galaxy TV, side buttons | **3b** | `#00D4FF` |
| `tuga` | Gold/amber TV with orbit ring | **Tuga** | `#F59E0B` |
| `p3` | Green tilted TV | Spare — next new portal | `#22E07A` |
| `p4` | Purple TV with arch gate | Spare — 4th new portal | `#C84BFF` |
| `p5` | Red TV in stone portal | Spare — 5th new portal | `#FF2D55` |

New portals get the next free spare automatically (remembered in localStorage key `sv_portal_icon_map`). To force one, add `icon: 'p4'` to that preset in `js/presets.js`.

## Files in this skill

| Skill path | Copy to project | Purpose |
|---|---|---|
| `assets/portals/*-64/128/256.png` | `assets/portals/` | Transparent icons (2x density for TV) |
| `code/js/portal-badges.js` | `js/portal-badges.js` | `SVPortalBadge` module, ES5 |
| `code/css/portal-badges.css` | **append** to `css/main.css` | Badge sizes, corner badge, glow, pill |
| `references/integration.md` | — | Exact swap points per screen |
| `preview.html` | — | Visual reference of every placement |

## API (ES5 — matches api.js style)

```js
SVPortalBadge.html(portal, size)      // '<img ...>' string. portal = preset object or id/name string
SVPortalBadge.corner(portal, size)    // absolute top-left badge for posters/tiles (parent position:relative)
SVPortalBadge.el(portal, size)        // DOM node
SVPortalBadge.swap(root)              // turns every [data-portal="3b"] text into its icon
SVPortalBadge.accent(portal)          // hex colour for focus glow / pill border
SVPortalBadge.name(portal)            // readable name (for alt text, logs)
```

Sizes on the 1920×1080 canvas: `xs` 28 · `sm` 40 · `md` 56 · `lg` 120 · `xl` 200.

## Where each size goes

| Place | Size | Call |
|---|---|---|
| Live TV channel row (merged round-robin list) | `xs` | `html(ch.portal,'xs')` before channel name |
| Channel tile / movie & series poster | `sm` | `corner(item.portal,'sm')` |
| Detail page header, next to title | `md` | `html(item.portal,'md')` |
| Player overlay (OSD) | `md` | `html(currentPortal,'md')` |
| Search / PowerSearch results | `xs` | per row, left of title |
| Portal switcher pill (home top bar) | `md` | one per portal, active gets `is-active` |
| Onboarding preset cards / Settings accounts | `lg` | replaces the old logo + name text |
| Splash "connecting to…" | `xl` | centre |

## Hard rules

1. **Every content item must carry its portal.** When `api.js` fetches streams, stamp `item.portal = preset.id` before merging. No portal = no badge = bug.
2. **Use `<img>`, never CSS `background-image`** (Tizen gotcha #11).
3. **CSS lives in `css/main.css`**, not injected `<style>` (gotcha #12).
4. **No `inset`, `gap`, `aspect-ratio`** in any badge CSS (gotcha #10).
5. Load order in `index.html`: `storage.js` → `portal-badges.js` → `screens/*.js`.
6. Keep `alt`/`title` = portal name so text search and debugging still work.
7. `portal-badges.js` holds **no hostnames or credentials** — safe to commit. Matching is by preset `id`/`name`.

## Workflow

1. Read `references/integration.md` for the per-screen edits.
2. Give the user complete replacement files (never partial snippets) plus one `cp` one-liner from `~/Downloads/` and the rebuild/reinstall one-liner from the streamvault-tv skill.
3. Open `preview.html` in a browser if the user wants to see the look before installing.
