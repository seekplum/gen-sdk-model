import { action, makeObservable, observable } from 'mobx';

import type { IExtensionConfig } from '@/typings';
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
    config: IExtensionConfig | null = null;

    @action
    fetchConfig = async (): Promise<void> => {
        const config = await Extension.getConfig();
        this.initialized = true;
        this.config = config;
    };

    @action
    onChangeFields = (field: string, value: any): void => {
        if (!this.config) {
            return;
        }
        this.config = {
            ...this.config,
            [field]: value,
        };
    };

    @action
    handleSubmit = (values: Record<string, any>): void => {
        if (!this.config) {
            return;
        }
        Extension.setConfig({ ...this.config, ...values });
    };
}

export default OptionsSettingsVM;
