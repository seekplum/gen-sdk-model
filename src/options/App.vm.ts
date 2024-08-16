import { action, makeObservable, observable, runInAction } from 'mobx';

import { Platform } from '@/constants';
import type { IExtensionConfig, IModelConfig } from '@/typings';
import { Extension } from '@/utils';

class OptionsSettingsVM {
    constructor() {
        makeObservable(this);
        this.init();
    }

    @action
    init = () => {
        this.fetchConfig();
    };

    @observable
    initialized = false;

    @observable
    platform = Platform.DOUDIAN;

    @observable
    config: IExtensionConfig | null = null;

    @observable
    modelConfig: IModelConfig | null = null;

    @action
    fetchConfig = async (): Promise<void> => {
        const config = await Extension.getConfig();
        runInAction(() => {
            this.initialized = true;
            this.config = config;
            this.modelConfig = config.modelConfig;
        });
    };

    @action
    onChangePlatform = (value: Platform): void => {
        this.platform = value;
    };

    @action
    saveConfig = () => {
        if (!this.config || !this.modelConfig) {
            return;
        }
        const newConfig = { ...this.config, modelConfig: this.modelConfig };
        Extension.setConfig(newConfig);
    };

    @action
    handleSubmit = (values: Record<string, any>): void => {
        if (!this.config || !this.modelConfig || !values || Object.keys(values).length === 0) {
            return;
        }
        this.config = { ...this.config, modelConfig: this.modelConfig, ...values };
        this.saveConfig();
    };

    @action
    handleModelConfig = (platform: Platform, values: Record<string, any>): void => {
        if (!this.config || !this.modelConfig || !values || Object.keys(values).length === 0) {
            return;
        }
        this.modelConfig = { ...this.modelConfig, [platform]: values };
    };
}

export default OptionsSettingsVM;
