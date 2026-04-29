/**
  * Creates and returns a promise that will resolve
  * once the DOM is ready. Based on document readyState property.
  * @function DomReady
  * @returns {Promise} Promise object
  */
function DomReady() {
    return new Promise((resolve, reject) => {
        if (['interactive', 'complete'].includes(document.readyState)) {
            return resolve(document.readyState);
        }

        document.onreadystatechange = function () {
            if (['interactive', 'complete'].includes(document.readyState)) {
                resolve(document.readyState);
                document.onreadystatechange = null;
            }
        }
    });
}

/**
  * Switches themes by manipulating body's class list
  * @function toggleTheme
  */
function toggleTheme() {
    document.body.classList.toggle('arlight_dark');
    setSwitcherA11y();
}

/**
  * Sets aria-checked switcher's attribute
  * @function setSwitcherA11y
  */
function setSwitcherA11y() {
    const currentSwitchElement = document.getElementById('arlight__theme-switcher-switch');
    const currentSwitchState = currentSwitchElement.parentNode.getAttribute('aria-checked');

    currentSwitchElement.parentNode.setAttribute('aria-checked', currentSwitchState === 'false' ? 'true' : 'false');
}

/**
  * Render subscribers list
  * @function renderSubscribersList
  */
function initSubscribersList() {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    const button = document.getElementById('arlight__subscription-button');
    const list = document.getElementById('arlight__subscription-list');
    const input = document.getElementById('arlight__subscription-input');
    const subscribers = ['ivanov_a_e@yandex.ru', 'shadrin_v_n@mail.ru'];

    const renderList = function () {
        const html = subscribers.map((subscriber) => {
            return `<li>${subscriber}</li>`;
        }).reduce((accumulator, currentValue) => {
            return `${accumulator}${currentValue}`;
        }, '');

        list.nextElementSibling?.remove();
        list.insertAdjacentHTML('afterend', `<ul>${html}</ul>`);
    };

    const addSubscriber = function () {
        const value = input.value.toLowerCase().trim();

        if (!value) {
            return;
        }

        if (subscribers.includes(value)) {
            return;
        }

        const isValid = regex.test(value);

        if (isValid) {
            subscribers.push(value);
            input.value = '';
            renderList();
        } else {
            input.setCustomValidity('This value is not allowed.');
        }
    };

    const hideError = function () {
        input.setCustomValidity('');
    };

    button.addEventListener('click', addSubscriber);
    input.addEventListener('input', hideError);
    renderList();
}

/**
  * Updates tabs count
  * @function updateTabsCount
  * @param {Number} value Current tabs count
  */
function updateTabsCount(value) {
    const counter = document.getElementById('arlight__tab-counter-value');

    counter.textContent = value;
}

/**
 * Initiates a Shared Worker
 * @function initSharedWorker
 */
function initSharedWorker() {
  try {
    const handlers = {
        'UPDATE_TABS_COUNT': updateTabsCount,
        'TOGGLE_THEME': toggleTheme,
    };

    const myWorker = new SharedWorker('/js/worker.js');
    myWorker.port.start();

    myWorker.port.onmessage = (e) => {
        handlers[e.data.type](e.data.value);
    };

    document.getElementById('arlight__theme-switcher-switch').addEventListener('click', () => {
        myWorker.port.postMessage('toggle_theme');
    });

    window.addEventListener('beforeunload', () => {
        myWorker.port.postMessage('unload_tab');
    });
  } catch {
    alert('Shared Workers are not supported in your browser :(');
  }
}

DomReady()
    .then(() => {
        initSubscribersList();
        initSharedWorker();
    });

