import type { Platform } from '@/constants';

export interface IRequestConfig {
    childBaseType: string;
    paramBaseType: string;
    responseBaseType: string;
    requestBaseType: string;
}

export interface IModelConfig {
    [Platform.DOUDIAN]: IRequestConfig;
    [Platform.WEIXIN]: IRequestConfig;
}

export interface IExtensionConfig {
    isExpanded: boolean;

    needRemoved: boolean;
    needDeprecated: boolean;
    needExample: boolean;
    needDescription: boolean;

    language: string;

    modelConfig: IModelConfig;
}
