/* StreamVault TV — Portal Badges (ES5, Tizen 5.0 safe)
 * Replaces portal text names ("3b", "Tuga", ...) with the portal icon so every
 * channel, movie, series and search result shows where it comes from.
 * Load AFTER storage.js and BEFORE any screens/*.js in index.html.
 */
var SVPortalBadge = (function () {
  'use strict';

  var BASE = 'assets/portals/';
  var STORE_KEY = 'sv_portal_icon_map';

  // Fixed icons. "match" = lowercase words found in the preset id or name.
  // Hostnames are deliberately NOT stored here (this file may be committed).
  var ICONS = {
    '3b':   { file: '3b',   label: '3b',       accent: '#00D4FF', match: ['3b'] },
    'tuga': { file: 'tuga', label: 'Tuga',     accent: '#F59E0B', match: ['tuga'] },
    'p3':   { file: 'p3',   label: 'Portal 3', accent: '#22E07A', match: [] },
    'p4':   { file: 'p4',   label: 'Portal 4', accent: '#C84BFF', match: [] },
    'p5':   { file: 'p5',   label: 'Portal 5', accent: '#FF2D55', match: [] }
  };
  var SPARES = ['p3', 'p4', 'p5'];

  // Pixel sizes for each badge size name (1920x1080 TV canvas)
  var SIZES = { xs: 28, sm: 40, md: 56, lg: 120, xl: 200 };

  var assigned = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(assigned)); } catch (e) {}
  }

  // Accepts a preset object ({id, name, icon}) or a plain string id/name
  function keyOf(portal) {
    if (!portal) return '';
    if (typeof portal === 'string') return portal.toLowerCase();
    return String(portal.id || portal.name || portal.url || '').toLowerCase();
  }

  function resolve(portal) {
    var key = keyOf(portal);
    if (!key) return null;

    // 1. Explicit icon set in presets.js wins: { id:'x', icon:'p3' }
    if (portal && portal.icon && ICONS[portal.icon]) return portal.icon;

    // 2. Known names
    var text = key + ' ' + (portal && portal.name ? String(portal.name).toLowerCase() : '');
    for (var id in ICONS) {
      if (!ICONS.hasOwnProperty(id)) continue;
      for (var i = 0; i < ICONS[id].match.length; i++) {
        if (text.indexOf(ICONS[id].match[i]) !== -1) return id;
      }
    }

    // 3. Previously auto-assigned (stable across restarts)
    if (assigned[key]) return assigned[key];

    // 4. First free spare icon, remembered forever
    var used = {};
    for (var k in assigned) { if (assigned.hasOwnProperty(k)) used[assigned[k]] = true; }
    for (var s = 0; s < SPARES.length; s++) {
      if (!used[SPARES[s]]) {
        assigned[key] = SPARES[s];
        save();
        return SPARES[s];
      }
    }
    return SPARES[SPARES.length - 1];
  }

  function src(id, px) {
    var file = px <= 32 ? 64 : (px <= 64 ? 128 : 256); // 2x density for crisp TV edges
    return BASE + ICONS[id].file + '-' + file + '.png';
  }

  function nameOf(portal) {
    if (portal && typeof portal === 'object' && portal.name) return portal.name;
    var id = resolve(portal);
    return id ? ICONS[id].label : '';
  }

  /** HTML string: <img> badge. size = xs | sm | md | lg | xl */
  function html(portal, size, extraClass) {
    var id = resolve(portal);
    if (!id) return '';
    size = SIZES[size] ? size : 'sm';
    var label = nameOf(portal);
    return '<img class="sv-pbadge sv-pbadge--' + size + ' sv-pbadge--' + id +
      (extraClass ? ' ' + extraClass : '') + '"' +
      ' src="' + src(id, SIZES[size]) + '"' +
      ' width="' + SIZES[size] + '" height="' + SIZES[size] + '"' +
      ' alt="' + label + '" title="' + label + '"' +
      ' data-portal-icon="' + id + '">';
  }

  /** DOM element version of html() */
  function el(portal, size, extraClass) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html(portal, size, extraClass);
    return wrap.firstChild;
  }

  /** Corner badge for a poster / channel tile. Parent needs position:relative. */
  function corner(portal, size) {
    return html(portal, size || 'sm', 'sv-pbadge-corner');
  }

  /**
   * Swap every element with data-portal="<id or name>" so its text becomes the icon.
   * Optional data-portal-size="xs|sm|md|lg|xl". Safe to call repeatedly.
   */
  function swap(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-portal]:not([data-portal-swapped])');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var badge = html(n.getAttribute('data-portal'), n.getAttribute('data-portal-size') || 'sm');
      if (!badge) continue;
      n.innerHTML = badge;
      n.setAttribute('data-portal-swapped', '1');
    }
  }

  function accent(portal) {
    var id = resolve(portal);
    return id ? ICONS[id].accent : '#00D4FF';
  }

  return {
    html: html,
    el: el,
    corner: corner,
    swap: swap,
    resolve: resolve,
    accent: accent,
    name: nameOf,
    ICONS: ICONS,
    SIZES: SIZES
  };
})();
