import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  CRX_NAME,
  EventNames,
  type Language,
  MessageModules,
  Platform,
} from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type {
  ContentMessageData,
  InjectionMessageData,
  PlatformResponseData,
} from '@/utils';
import { Extension } from '@/utils';
import * as utils from '@/utils/utils';

async function fetchAlibabaModelInfo(
    namespace: string,
    apiname: string,
    typeName: string,
): Promise<any[]> {
    const params = {
        _input_charset: 'utf8',
        apiname,
        namespace,
        version: '1',
        type: '2',
        typeName,
    };
    const url = new URL('https://open.1688.com/api/data/getModelInfo.json');
    url.search = new URLSearchParams(params).toString();
    const resp = await fetch(url.toString(), {
        headers: {},
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    if (resp.status !== 200) {
        throw new Error(`Failed to fetch ${url.toString()}`);
    }
    const json = await resp.json();
    if (!json.success) {
        throw new Error(`Failed to json parse ${url.toString()}`);
    }
    return json.result;
}

async function fetchAlibabaModels(data: PlatformResponseData): Promise<PlatformResponseData> {
    const responseJson = JSON.parse(data.response);
    if (!responseJson.success) {
        return data;
    }
    const { result } = responseJson;
    const { name, namespace, apiAppParamVOList: params, apiReturnParamVOList: responses } = result;
    const stack = [...params, ...responses];
    while (stack.length > 0) {
        const param = stack.pop();

        if (param.complexTypeFlag) {
            const children = await fetchAlibabaModelInfo(
                namespace,
                name,
                utils.parseArrayName(param.typeName),
            );
            stack.push(...children.filter((child) => child.complexTypeFlag));
            param.children = children;
        }
    }
    return {
        platform: data.platform,
        response: JSON.stringify(responseJson),
    } as PlatformResponseData;
}

class AppVM {
    constructor() {
        makeObservable(this);
        this.init();
    }

    @action
    init = () => {
        window.addEventListener('message', this.handleMessage);
        this.fetchConfig();
        this.platform = utils.parsePlatform(location.host);
        setTimeout(() => {
            runInAction(() => {
                this.initialized = true;
            });
        }, 5 * 1000);
    };

    @observable
    initialized = false;

    @observable
    config: IExtensionConfig | null = null;

    @observable
    platform: Platform | null = null;

    @observable
    platformResponse: PlatformResponseData | null = null;

    @action
    fetchConfig = async (): Promise<void> => {
        const config = await Extension.getConfig();
        runInAction(() => {
            this.config = config;
        });
    };

    @action
    toggleCollapsed = async () => {
        if (!this.config) {
            return;
        }

        this.config.isExpanded = !this.config.isExpanded;
        await Extension.setConfig({
            isExpanded: this.config.isExpanded,
        });
    };

    @action
    toggleLanguage = async (language: Language) => {
        if (!this.config) {
            return;
        }

        this.config.language = language;
        await Extension.setConfig({
            language: this.config.language,
        });
    };

    @action
    handleMessage = async (
        event: MessageEvent<InjectionMessageData<ContentMessageData<PlatformResponseData>>>,
    ) => {
        if (event.origin !== location.origin) {
            return;
        }

        const { data: eventData } = event;

        if (eventData.origin !== CRX_NAME) {
            return;
        }

        if (eventData.module !== MessageModules.INJECT) {
            return;
        }

        if (![EventNames.XHR_RESPONSE, EventNames.FETCH_RESPONSE].includes(eventData.eventName)) {
            return;
        }
        const { data: contentData } = eventData;
        let { data } = contentData;
        if (data && data.platform === Platform.ALIBABA) {
            data = await fetchAlibabaModels(data);
        }
        runInAction(() => {
            this.platformResponse = data;
        });
    };
}

export default AppVM;
