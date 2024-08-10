import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  EXTENSION_CONFIG_NAME,
  Language,
  PartyName,
  REQUEST_LANGUAGE_MAP,
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
    partyName: PartyName.PYDANTIC,

    childBaseType: REQUEST_LANGUAGE_MAP[defaultLanguage].child,
    paramBaseType: REQUEST_LANGUAGE_MAP[defaultLanguage].param,
    responseBaseType: REQUEST_LANGUAGE_MAP[defaultLanguage].response,
    requestBaseType: REQUEST_LANGUAGE_MAP[defaultLanguage].request,
} as IExtensionConfig;

export class Extension {
    static getConfig = async (): Promise<IExtensionConfig> => {
        const data = await chrome.storage.local.get(EXTENSION_CONFIG_NAME);
        return {
            ...defaultExtensionConfig,
            ...data.extensionConfig,
        };
    };

    static setConfig = async (record: Partial<Record<string, any>>) => {
        const config = await Extension.getConfig();

        await chrome.storage.local.set({
            extensionConfig: {
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

    setConfig = (record: Partial<Record<string, any>>) => {
        return Extension.setConfig(record);
    };

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
