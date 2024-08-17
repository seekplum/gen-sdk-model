import type { BaseModel, Language, Platform } from '@/constants';

export interface IModelConfig {
    [Platform.DOUDIAN]: BaseModel;
    [Platform.WEIXIN]: BaseModel;
    [Platform.ALIPAY]: BaseModel;
    [Platform.ALIBABA]: BaseModel;
    [Platform.KUAISHOU]: BaseModel;
    [Platform.TAOBAO]: BaseModel;
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
