import { action, makeObservable, observable } from 'mobx';

import { MessageModules } from '@/constants';
import { type ContentMessageData } from '@/utils';

class ControlListVM {
    constructor() {
        makeObservable(this);
        this.init();
    }

    @action
    init = () => {};

    @observable
    initialized = false;

    @action
    handleAdvanced = () => {
        chrome.runtime.sendMessage({
            module: MessageModules.POPUP,
            data: {
                cmd: 'popup.advanced',
            },
        } as ContentMessageData);
    };
}

export default ControlListVM;
