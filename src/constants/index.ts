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
    DOUDIAN = 'doudian',
    WEIXIN = 'weixin',
    ALIPAY = 'alipay',
    ALIBABA = 'alibaba',
    KUAISHOU = 'kuaishou',
    TAOBAO = 'taobao',
}

export const PlatformNames = {
    [Platform.DOUDIAN]: '抖店',
    [Platform.WEIXIN]: '微信',
    [Platform.ALIPAY]: '支付宝',
    [Platform.ALIBABA]: '阿里巴巴',
    [Platform.KUAISHOU]: '快手',
    [Platform.TAOBAO]: '淘宝',
};

export enum VariableTypes {
    STRING = 'str',
    INT = 'int',
    FLOAT = 'float',
    BOOL = 'bool',
    OBJECT = 'object',
    DICT = 'dict',
    LIST = 'list',
    DATE = 'datetime',
}

export enum ModelTypes {
    PARAM = 'param',
    RESPONSE = 'response',
    REQUEST = 'request',
    CHILD = 'child',
}

export enum Language {
    PYTHON = 'Python',
    TYPESCRIPT = 'TypeScript',
}

export interface BaseModel {
    child: string;
    param: string;
    response: string;
    request: string;
}

export const REQUEST_PLATFORM_MAP = {
    [Platform.DOUDIAN]: {
        child: 'BaseModel',
        param: 'TopParamBase',
        response: 'TopResponseBase',
        request: 'TopRequestBase',
    } as BaseModel,
    [Platform.WEIXIN]: {
        child: 'BaseModel',
        param: 'WopParamBase',
        response: 'WopResponseBase',
        request: 'WopRequestBase',
    } as BaseModel,
    [Platform.ALIPAY]: {
        child: 'BaseModel',
        param: 'TopParamBase',
        response: 'TopResponseBase',
        request: 'TopRequestBase',
    } as BaseModel,
    [Platform.ALIBABA]: {
        child: 'BaseModel',
        param: 'TopParamBase',
        response: 'TopResponseBase',
        request: 'TopRequestBase',
    } as BaseModel,
    [Platform.KUAISHOU]: {
        child: 'BaseModel',
        param: 'KopParamBase',
        response: 'KopResponseBase',
        request: 'KopRequestBase',
    } as BaseModel,
    [Platform.TAOBAO]: {
        child: 'BaseModel',
        param: 'TopParamBase',
        response: 'TopResponseBase',
        request: 'TopRequestBase',
    } as BaseModel,
};
