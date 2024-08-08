export const CRX_NAME = 'plum-crx';
export const EXTENSION_CONFIG_NAME = 'extensionConfig';

export enum MessageModules {
    CONTENT = 'content',
    INJECT = 'inject',
    POPUP = 'popup',
    DEVTOOLS = 'devtools',
    BACKGROUND = 'background',
}

export enum EventNames {
    XHR_REQUEST = 'xhr-interceptor:request',
    XHR_RESPONSE = 'xhr-interceptor:response',
    FETCH_REQUEST = 'fetch-interceptor:request',
    FETCH_RESPONSE = 'fetch-interceptor:response',
}

export enum Platform {
    GITHUB = 'github',
}
