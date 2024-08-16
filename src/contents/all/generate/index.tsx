import { Language, Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';

import { generateByPython, generateByTypescript } from './languages';
import {
  generateAlibaba,
  generateAlipay,
  generateDoudian,
  generateKuaishou,
  generateTaobao,
  generateWeixin,
} from './platforms';

function generateCodes(
    platform: Platform,
    language: Language,
    requestData: RequestTypes.RequestData,
    config: IExtensionConfig,
): string[] {
    if (language === Language.PYTHON) {
        return generateByPython(platform, requestData, config);
    }
    if (language === Language.TYPESCRIPT) {
        return generateByTypescript(platform, requestData, config);
    }
    throw new Error(`Unsupported language: ${language}`);
}

export function generate(
    platform: Platform,
    language: Language,
    response: string,
    config: IExtensionConfig,
): string[] {
    let requestData: RequestTypes.RequestData | null = null;
    try {
        // eslint-disable-next-line unicorn/prefer-switch
        if (platform === Platform.DOUDIAN) {
            requestData = generateDoudian(response);
        } else if (platform === Platform.ALIPAY) {
            requestData = generateAlipay(response);
        } else if (platform === Platform.ALIBABA) {
            requestData = generateAlibaba(response);
        } else if (platform === Platform.KUAISHOU) {
            requestData = generateKuaishou(response);
        } else if (platform === Platform.TAOBAO) {
            requestData = generateTaobao(response);
        }
        if (!requestData) {
            requestData = {
                comments: [`Unsupported platform: ${platform}`],
            } as RequestTypes.RequestData;
        }
    } catch (error) {
        requestData = {
            comments: [`未知错误: ${error}`],
        } as RequestTypes.RequestData;
    }
    return generateCodes(platform, language, requestData, config);
}

export function generateByDocument(
    platform: Platform,
    language: Language,
    config: IExtensionConfig,
): string[] {
    let requestData: RequestTypes.RequestData | null = null;
    if (platform === Platform.WEIXIN) {
        requestData = generateWeixin();
    }
    if (!requestData) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    return generateCodes(platform, language, requestData, config);
}
