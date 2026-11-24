/*
 * CalcCraftScope — ads setup
 * This file loads in the <head> of EVERY page. Edit only this file to change ad code site-wide.
 *
 * 1) Add your ad scripts (GPT, Prebid, Mowplayer, AdSense...) to `scripts` below.
 * 2) Put any extra inline setup inside `setup()`.
 * 3) Set `enabled: true` to show the ad slots on the page.
 *
 * Ad slot containers available (div ids):
 *   ccs-home-leaderboard   (home, 728x90)
 *   ccs-calc-incontent  (calculator pages, 300x250, below the calculator)
 *   ccs-calc-sidebar    (calculator pages, 300x600, sidebar)
 */
window.CCS_ADS = {
  enabled: false,
  scripts: [
    'https://ejs2.mowplayer.com/469064433350/mow.js',
    'https://ejs.mowplayer.com/js/player/mhRq2ktQdU.js',
    // 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    // 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX',
  ],
  setup: function () {
    // Inline ad setup goes here (e.g. googletag.cmd.push(...), Prebid config).
  }
};

(function (cfg) {
  cfg.scripts.forEach(function (src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (src.indexOf('adsbygoogle') > -1) s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  });
  if (cfg.enabled) document.documentElement.classList.add('ads-on');
  try { cfg.setup(); } catch (e) { console.error('CCS_ADS setup error', e); }
})(window.CCS_ADS);
