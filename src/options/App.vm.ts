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
    submitting = false;

    @observable
    platform = Platform.DOUDIAN;

    @observable
    config: IExtensionConfig | null = null;

    @observable
    modelConfig: IModelConfig | null = null;

    @action
    toggleSubmitting = (submitting: boolean): void => {
        this.submitting = submitting;
    };

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
    saveConfig = async () => {
        if (!this.config || !this.modelConfig) {
            return;
        }
        const newConfig = { ...this.config, modelConfig: this.modelConfig };
        await Extension.setConfig(newConfig);
    };

    @action
    handleSubmit = async (values: Record<string, any>): Promise<void> => {
        if (!this.config || !this.modelConfig || !values || Object.keys(values).length === 0) {
            this.toggleSubmitting(false);
            return;
        }
        this.config = { ...this.config, modelConfig: this.modelConfig, ...values };
        await this.saveConfig();
        this.toggleSubmitting(false);
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
