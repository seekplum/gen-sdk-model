import type { Language, Platform } from '@/constants';

export interface IRequestConfig {
    childBaseType: string;
    paramBaseType: string;
    responseBaseType: string;
    requestBaseType: string;
}

export interface IModelConfig {
    [Platform.DOUDIAN]: IRequestConfig;
    [Platform.WEIXIN]: IRequestConfig;
    [Platform.ALIPAY]: IRequestConfig;
    [Platform.ALIBABA]: IRequestConfig;
    [Platform.KUAISHOU]: IRequestConfig;
}

export interface IExtensionConfig {
    isExpanded: boolean;

    needRemoved: boolean;
    needDeprecated: boolean;
    needExample: boolean;
    needDescription: boolean;

    language: Language;

    modelConfig: IModelConfig;
}
