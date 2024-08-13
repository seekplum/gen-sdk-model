import { Language, Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';

import { generate as generateDoudian } from './doudian';
import { generate as generateByPython } from './python';
import { generate as generateByTypescript } from './typescript';

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
    if (platform === Platform.DOUDIAN) {
        requestData = generateDoudian(response);
    }
    if (!requestData) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    return generateCodes(platform, language, requestData, config);
}

export function generateByDocument(
    platform: Platform,
    language: Language,
    config: IExtensionConfig,
): string[] {
    const requestConfig = config.modelConfig[platform];
    return [
        `platform: ${platform}`,
        `language: ${language}`,
        `child_base_type: ${requestConfig.childBaseType}`,
        `param_base_type: ${requestConfig.paramBaseType}`,
        `response_base_type: ${requestConfig.responseBaseType}`,
        `request_base_type: ${requestConfig.requestBaseType}`,
    ];
}
