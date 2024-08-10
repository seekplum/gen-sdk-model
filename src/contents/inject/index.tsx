import { CRX_NAME, EventNames, MessageModules } from '@/constants';
import type {
  ContentMessageData,
  InjectionMessageData,
  PlatformResponseData,
} from '@/utils';
import * as printer from '@/utils/printer';

import * as utils from './utils';

printer.consoleLog('injected chrome extension data0');

function sendMessageToContent(
    eventName: EventNames,
    data: ContentMessageData<PlatformResponseData>,
): void {
    window.postMessage(
        {
            origin: CRX_NAME,
            module: MessageModules.INJECT,
            eventName,
            data,
        } as InjectionMessageData<ContentMessageData>,
        'https://op.jinritemai.com/docs/api-docs/*/*',
    );
}

function sendResponseToContent(method: string, url: string, responseText: string): void {
    const platform = utils.getRequestPlatform(window.location.host, method, url);
    if (!platform) {
        return;
    }
    const data = {
        platform,
        response: responseText,
    } as PlatformResponseData;
    printer.consoleLog('injected chrome extension data1:', data);
    sendMessageToContent(EventNames.XHR_RESPONSE, {
        module: MessageModules.INJECT,
        data,
    } as ContentMessageData<PlatformResponseData>);
}

(function (xhr) {
    const XHR = xhr.prototype;

    const oldOpen = XHR.open;
    const oldSend = XHR.send;

    XHR.open = function (method, url) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this._method = method;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this._url = url;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return oldOpen.apply(this, arguments); // eslint-disable-line unicorn/prefer-reflect-apply, prefer-rest-params
    };

    XHR.send = function (_) {
        this.addEventListener('load', function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const url = this._url;
            if (!url) {
                return;
            }
            if (!(this.responseType !== 'blob' && this.responseText)) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const method = this._method;

            sendResponseToContent(method, url, this.responseText);
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return oldSend.apply(this, arguments); // eslint-disable-line unicorn/prefer-reflect-apply, prefer-rest-params
    };
})(XMLHttpRequest);

const originalFetch = window.fetch;

window.fetch = function (url, options) {
    const fch = originalFetch(url, options);

    fch.then((resp) => {
        if (resp && resp.ok && resp.status === 200) {
            return resp.text();
        }
        return null;
    }).then((res) => {
        if (!res) {
            return;
        }
        sendResponseToContent(options?.method || 'GET', url.toString(), res);
    });
    return fch;
};
export default undefined;
