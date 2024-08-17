import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  EXTENSION_CONFIG_NAME,
  Language,
  Platform,
  REQUEST_PLATFORM_MAP,
} from '@/constants';
import type { IExtensionConfig } from '@/typings';

import pkg from '../../package.json';

export const VERSION = pkg.version;

export const defaultLanguage = Language.PYTHON;

export const defaultExtensionConfig = {
    isExpanded: true,

    needRemoved: false,
    needDeprecated: false,
    needExample: true,
    needDescription: true,

    language: defaultLanguage,

    modelConfig: {
        [Platform.DOUDIAN]: REQUEST_PLATFORM_MAP[Platform.DOUDIAN],
        [Platform.WEIXIN]: REQUEST_PLATFORM_MAP[Platform.WEIXIN],
        [Platform.ALIPAY]: REQUEST_PLATFORM_MAP[Platform.ALIPAY],
        [Platform.ALIBABA]: REQUEST_PLATFORM_MAP[Platform.ALIBABA],
        [Platform.KUAISHOU]: REQUEST_PLATFORM_MAP[Platform.KUAISHOU],
        [Platform.TAOBAO]: REQUEST_PLATFORM_MAP[Platform.TAOBAO],
    },
} as IExtensionConfig;

export class Extension {
    static getConfig = async (): Promise<IExtensionConfig> => {
        const data = await chrome.storage.local.get(EXTENSION_CONFIG_NAME);
        if (!data || !data[EXTENSION_CONFIG_NAME]) {
            return defaultExtensionConfig;
        }
        const { modelConfig: defaultModelConfig, ...defaultExtra } = defaultExtensionConfig;
        const { modelConfig, ...extra } = data[EXTENSION_CONFIG_NAME];
        return {
            ...defaultExtra,
            ...extra,
            modelConfig: {
                ...defaultModelConfig,
                ...modelConfig,
            },
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
