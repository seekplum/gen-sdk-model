import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  EXTENSION_CONFIG_NAME,
  Language,
  Platform,
  REQUEST_PLATFORM_MAP,
} from '@/constants';
import type { IExtensionConfig, IRequestConfig } from '@/typings';

import pkg from '../../package.json';

export const VERSION = pkg.version;

export const defaultLanguage = Language.PYTHON;

export const defaultDoudianRequestConfig = {
    childBaseType: REQUEST_PLATFORM_MAP[Platform.DOUDIAN].child,
    paramBaseType: REQUEST_PLATFORM_MAP[Platform.DOUDIAN].param,
    responseBaseType: REQUEST_PLATFORM_MAP[Platform.DOUDIAN].response,
    requestBaseType: REQUEST_PLATFORM_MAP[Platform.DOUDIAN].request,
} as IRequestConfig;

export const defaultWeixinRequestConfig = {
    childBaseType: REQUEST_PLATFORM_MAP[Platform.WEIXIN].child,
    paramBaseType: REQUEST_PLATFORM_MAP[Platform.WEIXIN].param,
    responseBaseType: REQUEST_PLATFORM_MAP[Platform.WEIXIN].response,
    requestBaseType: REQUEST_PLATFORM_MAP[Platform.WEIXIN].request,
} as IRequestConfig;

export const defaultExtensionConfig = {
    isExpanded: true,

    needRemoved: false,
    needDeprecated: false,
    needExample: true,
    needDescription: true,

    language: defaultLanguage,

    modelConfig: {
        [Platform.DOUDIAN]: defaultDoudianRequestConfig,
        [Platform.WEIXIN]: defaultWeixinRequestConfig,
    },
} as IExtensionConfig;

export class Extension {
    static getConfig = async (): Promise<IExtensionConfig> => {
        const data = await chrome.storage.local.get(EXTENSION_CONFIG_NAME);
        return {
            ...defaultExtensionConfig,
            ...data[EXTENSION_CONFIG_NAME],
        };
    };

    static setConfig = async (record: Partial<IExtensionConfig>) => {
        const config = await Extension.getConfig();
        await chrome.storage.local.set({
            [EXTENSION_CONFIG_NAME]: {
                ...config,
                ...record,
            },
        });
    };

    @observable
    initialized = false;

    @observable
    config: IExtensionConfig | null = null;

    constructor() {
        makeObservable(this);
        this.init();
    }

    @action
    private init = async () => {
        const config = await Extension.getConfig();
        runInAction(() => {
            this.config = config;
            this.initialized = true;
        });
        chrome.storage.local.onChanged.addListener((changes) => {
            if (changes.extensionConfig) {
                runInAction(() => {
                    this.config = changes.extensionConfig.newValue;
                });
            }
        });
    };
}
