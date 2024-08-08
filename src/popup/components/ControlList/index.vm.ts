import { action, makeObservable, observable } from 'mobx';

import { MessageModules } from '@/constants';
import { type ContentMessageData, Extension } from '@/utils';

class ControlListVM {
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
    setIsCollapsed = async () => {
        this.isCollapsed = !this.isCollapsed;
        await Extension.setConfig({
            isCollapsed: this.isCollapsed,
        });
    };

    @action
    handleAdvanced = () => {
        chrome.runtime.sendMessage({
            module: MessageModules.POPUP,
            data: {
                cmd: 'popup.advanced',
            },
        } as ContentMessageData);
    };

    @action
    fetchConfig = async () => {
        const config = await Extension.getConfig();
        this.initialized = true;
        this.isCollapsed = config.isCollapsed;
    };
}

export default ControlListVM;
