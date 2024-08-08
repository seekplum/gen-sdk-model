import { action, makeObservable, observable } from 'mobx';

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
    isCollapsed = false;

    @action
    fetchConfig = async (): Promise<void> => {
        const config = await Extension.getConfig();
        this.initialized = true;
        this.isCollapsed = config.isCollapsed;
    };

    @action
    onChangeCollapsed = (value: boolean): void => {
        this.isCollapsed = value;
    };

    @action
    handleSubmit = (): void => {
        Extension.setConfig({
            isCollapsed: this.isCollapsed,
        });
    };
}

export default OptionsSettingsVM;
