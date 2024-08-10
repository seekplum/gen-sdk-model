import type { EventNames, MessageModules, Platform } from '@/constants';

export interface XHRInterceptorResponse {
    url: string;
    response: any;
    xhr?: any;
}

export interface FetchInterceptorResponse {
    url: string;
    response: any;
    xhr?: any;
}

export interface InjectionEventMapping {
    [EventNames.XHR_REQUEST]: Document | XMLHttpRequestBodyInit | null | undefined;
    [EventNames.XHR_RESPONSE]: XHRInterceptorResponse;
    [EventNames.FETCH_RESPONSE]: FetchInterceptorResponse;
}

export interface PlatformResponseData {
    platform: Platform;
    response: string;
}

export interface ContentMessageData<T = any> {
    module: MessageModules;
    data: T;
}

export interface InjectionMessageData<T = any> {
    origin: string;
    module: MessageModules;
    eventName: EventNames;
    data: T;
}
