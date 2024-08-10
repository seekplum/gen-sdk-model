import { action, makeObservable, observable, runInAction } from 'mobx';

import type { IExtensionConfig } from '@/typings';
import { Extension } from '@/utils';

class IndexVM {
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
        runInAction(() => {
            this.initialized = true;
            this.config = config;
        });
    };
}

export default IndexVM;
