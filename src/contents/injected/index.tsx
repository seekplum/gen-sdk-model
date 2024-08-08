import * as printer from '@/utils/printer';

function injectCustomJs() {
    printer.consoleLog('inject custom js');
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('js/inject.js');
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    s.onload = function () {
        s.remove();
    };
    (document.head || document.documentElement).append(s);
}

// 注入自定义JS
injectCustomJs();
