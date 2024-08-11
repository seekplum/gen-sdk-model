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
}

export enum VariableTypes {
    STRING = 'str',
    INT = 'int',
    FLOAT = 'float',
    BOOL = 'bool',
    OBJECT = 'object',
    LIST = 'list',
}

export enum ModelTypes {
    PARAM = 'param',
    RESPONSE = 'response',
    REQUEST = 'request',
    CHILD = 'child',
}

export enum Language {
    PYTHON = 'python',
}

export enum PartyName {
    PYDANTIC = 'pydantic',
}

export interface BaseModel {
    child: string;
    param: string;
    response: string;
    request: string;
}

export const REQUEST_LANGUAGE_MAP = {
    [Language.PYTHON]: {
        child: 'BaseModel',
        param: 'TopParamBase',
        response: 'TopResponseBase',
        request: 'TopRequestBase',
    } as BaseModel,
};
