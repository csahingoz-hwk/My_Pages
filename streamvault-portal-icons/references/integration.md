# Integration — swapping portal text for icons

Search the project first so nothing is missed:

```bash
cd /Users/caglar/Desktop/StreamVaultTV && grep -rn -i "3b\|tuga\|portal.name\|preset.name\|\.name +" js/screens js/app.js | grep -v presets.js
```

Every hit that prints a portal name into the UI gets swapped. Typical spots below.

## 1. index.html — load the module

```html
<script src="js/storage.js"></script>
<script src="js/portal-badges.js"></script>   <!-- NEW: before screens -->
<script src="js/screens/onboarding.js"></script>
```

## 2. api.js — stamp the source on every item

Wherever live streams / VOD / series are returned, before the round-robin merge:

```js
for (var i = 0; i < list.length; i++) { list[i].portal = preset.id; }
```

## 3. onboarding.js — preset cards

```js
// BEFORE: '<div class="preset-logo">' + p.name.charAt(0) + '</div><div class="preset-name">' + p.name + '</div>'
// AFTER:
'<div class="preset-logo">' + SVPortalBadge.html(p, 'lg') + '</div>'
```

## 4. home.js — portal switcher pill

```js
var pill = '<div class="sv-portal-pill">';
for (var i = 0; i < presets.length; i++) {
  pill += SVPortalBadge.html(presets[i], 'md', presets[i].id === activeId ? 'is-active' : '');
}
pill += '</div>';
```

## 5. live-tv.js — channel rows + player OSD

```js
// Row
'<div class="channel-row">' + SVPortalBadge.html(ch.portal, 'xs') +
'<span class="sv-pbadge-text">' + ch.name + '</span></div>'

// OSD — replaces "3b • BBC One" style text
SVPortalBadge.html(currentPortal, 'md') + '<span class="sv-pbadge-text">' + ch.name + '</span>'
```

Remove any `[3b]` / `(Tuga)` text prefixes or suffixes added to channel names during the merge.

## 6. Movies / Series tiles + detail

```js
// Tile (tile already position:relative)
'<div class="poster-tile">' + SVPortalBadge.corner(item.portal, 'sm') + '<img class="poster" src="' + poster + '">...'

// Detail header
'<h1>' + SVPortalBadge.html(item.portal, 'md') + '<span class="sv-pbadge-text">' + item.name + '</span></h1>'
```

## 7. settings.js — accounts list

Replace the portal name label with `SVPortalBadge.html(p, 'lg')`; keep username/expiry text beside it.

## 8. Anything rendered from templates

Mark the spot instead of calling the API:

```html
<span data-portal="tuga" data-portal-size="xs"></span>
```

Then after mounting the screen: `SVPortalBadge.swap(container);`

## Copy + deploy one-liner

```bash
cp -R ~/Downloads/streamvault-portal-icons/assets/portals /Users/caglar/Desktop/StreamVaultTV/assets/ && cp ~/Downloads/streamvault-portal-icons/code/js/portal-badges.js /Users/caglar/Desktop/StreamVaultTV/js/ && cat ~/Downloads/streamvault-portal-icons/code/css/portal-badges.css >> /Users/caglar/Desktop/StreamVaultTV/css/main.css
```

Then rebuild + reinstall with the one-liner from the streamvault-tv skill (`references/build-and-install.md`).

Watch out: run the `cat >>` part only once, or the CSS is appended twice (harmless but messy).
