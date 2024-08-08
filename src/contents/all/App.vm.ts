import { action, makeObservable, observable } from 'mobx';

import { defaultExtensionConfig, Extension } from '@/utils';

class AppVM {
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
        this.isCollapsed = config.isCollapsed || defaultExtensionConfig.isCollapsed;
    };
}

export default AppVM;
