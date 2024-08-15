/// <reference path="index.d.ts" />

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
    const targetOrigin = utils.getTargetOrigin(data.data.platform);
    if (!targetOrigin) {
        return;
    }
    window.postMessage(
        {
            origin: CRX_NAME,
            module: MessageModules.INJECT,
            eventName,
            data,
        } as InjectionMessageData<ContentMessageData>,
        targetOrigin,
    );
}

function sendResponseToContent(
    source: string,
    method: string,
    url: string,
    responseText: string,
): void {
    const platform = utils.getRequestPlatform(window.location.host, method, url);
    if (!platform) {
        return;
    }
    const data = {
        platform,
        response: responseText,
    } as PlatformResponseData;
    printer.consoleLog('injected chrome extension data1:', source, data);
    sendMessageToContent(EventNames.XHR_RESPONSE, {
        module: MessageModules.INJECT,
        data,
    } as ContentMessageData<PlatformResponseData>);
}

(function (xhr) {
    const XHR = xhr.prototype;

    const originalOpen = XHR.open;
    const originalSend = XHR.send;

    XHR.open = function (
        method: string,
        url: string | URL,
        async?: boolean,
        user?: string,
        password?: string,
    ) {
        this._method = method;
        this._url = typeof url === 'string' ? url : url.href;
        // eslint-disable-next-line unicorn/prefer-reflect-apply
        return originalOpen.apply(this, [method, url, async || true, user, password]);
    };

    XHR.send = function (...sendArgs) {
        this.addEventListener('load', () => {
            this.mySendResponse();
        });
        this.addEventListener('readyStateChange', () => {
            if (this.readyState === 4) {
                this.mySendResponse();
            }
        });
        return originalSend.apply(this, sendArgs);
    };

    XHR.mySendResponse = function () {
        const url = this._url;
        if (!url) {
            return;
        }
        if (!(this.responseType !== 'blob' && this.responseText)) {
            return;
        }
        const method = this._method;

        sendResponseToContent('XHR', method, url, this.responseText);
    };
})(XMLHttpRequest);

const originalFetch = window.fetch;

window.fetch = function (...args) {
    const [url, options, ..._] = args;
    const fch = originalFetch(...args);

    fch.then((resp: Response) => {
        if (resp && resp.ok && resp.status === 200) {
            return resp.text();
        }
        return null;
    }).then((res: string | null) => {
        if (!res) {
            return;
        }
        sendResponseToContent('Fetch', options?.method || 'GET', url.toString(), res);
    });
    return originalFetch(...args);
};

export default undefined;
