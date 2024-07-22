// ==UserScript==
// @name        HRRR Windy
// @description Always click 'HRRR' on windy.com to show 3km HRRR forecast
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
let pageCounter = 0;
let mutations = 0;
let observer = null;
let lastHref = location.href;
let locationInterval = null;

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

  function navigated() {
    console.log(`${logPrefix}navigated, resetting alreadyClicked and MutationObserver`);
    observer.disconnect();
    resetAlreadyClicked();
    mutations = 0;
    pageCounter = 0;
    reobserve();
  }

  function startPollingLocation() {
    if (locationInterval !== null) {
      throw new Error(`locationInterval already exists: ${locationInterval}`);
    }
    locationInterval = setInterval(
      () => {
        if (location.href !== lastHref) {
          lastHref = location.href;
          navigated();
        }
      },
      1000
    );
  }

  function stopPollingLocation() {
    if (locationInterval === null) {
      throw new Error(`locationInterval === null`);
    }
    clearInterval(locationInterval);
    locationInterval = null;
  }

  // So far, only Chromium-based browsers have Navigation API: https://caniuse.com/mdn-api_navigation
  if (window.navigation && navigation.addEventListener) {
    console.log(`${logPrefix}using Navigation API to detect location changes`);
    navigation.addEventListener('navigate', (_ev) => {
      navigated();
    });
  } else {
    // https://stackoverflow.com/questions/34999976/detect-changes-on-the-url
    // suggests that setInterval is the best way to do it when we lack Navigation API.
    console.log(`${logPrefix}using setInterval(..., 1000) to detect location changes`);
    startPollingLocation();
    // Not necessary for correctness, but to save power, kill our setInterval when the page isn't visible.
    document.addEventListener("visibilitychange", function() {
      if (document.hidden) {
        console.log(`${logPrefix}page has become hidden, stopping setInterval`);
        stopPollingLocation();
      } else {
        console.log(`${logPrefix}page has become visible, starting setInterval`);
        startPollingLocation();
      }
    });
  }
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
