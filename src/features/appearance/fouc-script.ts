/**
 * Inline FOUC guard — runs before paint so stored theme/font prefs apply
 * without a flash of the default dark Inter look.
 * Keep in sync with `features/appearance/types.ts` defaults + storage key.
 */
export const APPEARANCE_FOUC_SCRIPT = `(function(){try{var k='portfolio-appearance';var raw=localStorage.getItem(k);var p=raw?JSON.parse(raw):{};var theme=p.theme||'dark';var resolved=theme;if(theme==='system'){resolved=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var root=document.documentElement;root.setAttribute('data-theme',resolved);root.setAttribute('data-font',p.fontFamily||'sans');var sizes={sm:'0.925',md:'1',lg:'1.075',xl:'1.15'};var track={tight:'-0.02em',normal:'0em',wide:'0.03em'};var lead={compact:'1.45',normal:'1.6',relaxed:'1.8'};root.style.setProperty('--font-scale',sizes[p.fontSize]||'1');root.style.setProperty('--letter-spacing',track[p.letterSpacing]||'0em');root.style.setProperty('--line-height',lead[p.lineHeight]||'1.6');root.style.colorScheme=resolved;}catch(e){}})();`
