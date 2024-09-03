// ==UserScript==
// @name        Hide reddit homepage, /r/all et al, without blocking comments pages
// @namespace   hide_reddit_trash
// @author      ludios
// @license     AGPL-3.0; https://www.gnu.org/licenses/agpl-3.0.en.html
// @grant       none
// @version     1.0.0
// @match       https://old.reddit.com/*
// @grant       GM_addStyle
// @run-at      document-start
// ==/UserScript==

// This assumes you have the `Old Reddit Redirect` extension installed,
// which redirects all www.reddit.com to old.reddit.com

const loc = window.location.href;

const TRASH_RE    = /^https:\/\/old\.reddit\.com\/r\/(all|politics|videos)[\/\+-]/;
const COMMENTS_RE = /^https:\/\/old\.reddit\.com\/r\/[^\/]+\/comments\//;
const HOMEPAGE_RE = /^https:\/\/old\.reddit\.com\/($|[\?&]|(new|rising|controversial|top)\/)/;

if ((TRASH_RE.test(loc) && !COMMENTS_RE.test(loc)) || HOMEPAGE_RE.test(loc)) {
  GM_addStyle(`
    #siteTable { display: none !important; }
  `);
}
