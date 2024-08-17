import { Language, Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';
import * as printer from '@/utils/printer';
import * as utils from '@/utils/utils';

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

function getParamKey(param: RequestTypes.RequestModel): string {
    const res = [utils.parseParentPathName(param.className)];
    for (const childParam of param.childParams) {
        res.push(
            childParam.name,
            childParam.type,
            childParam.childType || '',
            childParam.required ? '1' : '0',
        );
    }
    return res.join('_');
}

function restoreModels(
    params: RequestTypes.RequestModel[],
    keyNamePairs: Record<string, string>,
    deleteClassNames: Set<string>,
    existsNames: Set<string>,
): RequestTypes.RequestModel[] {
    const models = [];
    for (const param of params) {
        const { className, childParams } = param;
        if (deleteClassNames.has(className)) {
            continue;
        }
        if (existsNames.has(className)) {
            continue;
        }
        existsNames.add(className);
        param.className =
            keyNamePairs[className] || utils.parseObjectName(utils.parseParentPathName(className));
        for (const childParam of childParams) {
            const pathName = utils.buildParentPathName(childParam.type, childParam.name);
            childParam.type = keyNamePairs[pathName] || utils.parseParentPathName(childParam.type);
            if (childParam.childType) {
                const pathChildName = utils.buildParentPathName(
                    childParam.childType || '',
                    childParam.name,
                );
                childParam.childType =
                    keyNamePairs[pathChildName] || utils.parseParentPathName(childParam.childType);
            }
        }
        models.push(param);
    }
    return models;
}

function removeDuplicates(
    params: RequestTypes.RequestModel[],
    responses: RequestTypes.RequestModel[],
): [RequestTypes.RequestModel[], RequestTypes.RequestModel[]] {
    if (params.length === 0 && responses.length === 0) {
        return [params, responses];
    }
    // 重复的models
    const duplicateModels: Record<string, RequestTypes.RequestModel[]> = {};
    for (const param of [...params, ...responses]) {
        const { className } = param;
        const originName = utils.parseParentPathName(className);
        if (duplicateModels[originName]) {
            duplicateModels[originName].push(param);
        } else {
            duplicateModels[originName] = [param];
        }
    }
    // 所有都未重复
    if (Object.values(duplicateModels).every((v) => v.length > 1)) {
        return [params, responses];
    }
    const someKeys = new Set<string>(); // 属性名一致的key
    const keyNamePairs: Record<string, string> = {}; // 类名和key的映射
    const keyNumPairs: Record<string, number> = {}; // 重名后的key和数量的映射
    const deleteClassNames = new Set<string>(); // 需要删除的类名
    for (const originName of Object.keys(duplicateModels)) {
        // 未重复
        if (duplicateModels[originName].length <= 1) {
            continue;
        }
        const models = duplicateModels[originName];
        for (const model of models) {
            const key = utils.encrypt(getParamKey(model));
            keyNamePairs[model.className] = originName;
            let dupNum = keyNumPairs[originName] || 0;
            // 重复后才需要记录重名数量
            if (!someKeys.has(key) && model.className !== originName) {
                dupNum += 1;
                deleteClassNames.add(model.className);
            }
            someKeys.add(key);
            keyNumPairs[originName] = dupNum;
            if (dupNum > 1) {
                keyNamePairs[model.className] = `${originName}${dupNum}`;
            }
        }
    }
    const existsNames = new Set<string>();
    params = restoreModels(params, keyNamePairs, deleteClassNames, existsNames);
    responses = restoreModels(responses, keyNamePairs, deleteClassNames, existsNames);
    return [params, responses];
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
        if (requestData) {
            const [params, responses] = removeDuplicates(
                requestData.params || [],
                requestData.responses || [],
            );
            requestData.params = params;
            requestData.responses = responses;
        } else {
            requestData = {
                comments: [`Unsupported platform: ${platform}`],
            } as RequestTypes.RequestData;
        }
    } catch (error) {
        printer.consoleError(error);
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
