// ==UserScript==
// @name        HRRR Windy
// @description Default to 'HRRR' on windy.com to show 3km HRRR forecast
// @namespace   ludios
// @author      ludios
// @license     AGPL-3.0; https://www.gnu.org/licenses/agpl-3.0.en.html
// @grant       none
// @version     1.0.0
// ==/UserScript==

// These functions were copied from Expand Everything

function queryElements(selector, callback) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => callback(element));
}

const logPrefix = "HRRR Windy: ";
let mutations = 0;
let observer = null;

// Observe some selectors and run a callback for each selected element.
function observe(maxMutations, selectors, callback) {
  if (observer !== null) {
    throw new Error(`observe(...) called more than once`);
  }

  observer = new MutationObserver(() => {
    mutations++;
    if (mutations >= maxMutations) {
      console.log(`${logPrefix}disconnecting MutationObserver after ${mutations} mutations to avoid slowing down the page`);
      observer.disconnect();
    }
    for (const selector of selectors) {
      queryElements(selector, callback);
    }
  });

  function reobserve() {
    // Process elements that were present before MutationObserver
    for (const selector of selectors) {
      queryElements(selector, callback);
    }

    // Start observing
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  reobserve();
}

let alreadyClicked;
function resetAlreadyClicked() {
  alreadyClicked = new WeakMap();
}
resetAlreadyClicked();

// Click on something if it hasn't already been clicked.
function clickIfUnclicked(el) {
  if (alreadyClicked.get(el)) {
    return;
  }
  alreadyClicked.set(el, true);
  el.click();
}

// 

observe(100, [
  'div.switch__item.tooltip--up[data-tooltip="3km"]'
], el => {
  clickIfUnclicked(el);
});
