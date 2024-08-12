import { Language, ModelTypes, Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';

import { generate as generateDoudian } from './doudian';

function getParentModelName(
    platform: Platform,
    modelType: string,
    config: IExtensionConfig,
): string {
    const requestConfig = config.modelConfig[platform];
    switch (modelType) {
        case ModelTypes.PARAM:
            return requestConfig.paramBaseType;
        case ModelTypes.RESPONSE:
            return requestConfig.responseBaseType;
        case ModelTypes.REQUEST:
            return requestConfig.requestBaseType;
        case ModelTypes.CHILD:
            return requestConfig.childBaseType;
        default:
            throw new Error(
                `Unsupported parent model type: ${modelType} for platform: ${platform}`,
            );
    }
}

function generateByPython(
    platform: Platform,
    param: RequestTypes.RequestModel,
    config: IExtensionConfig,
): string[] {
    const rawCodes: string[] = [];

    rawCodes.push(
        `class ${param.className}(${getParentModelName(platform, param.parentModelType, config)}):`,
    );
    for (const childParam of param.childParams) {
        if (childParam.removed && !config.needRemoved) {
            continue;
        }
        if (childParam.deprecated && !config.needDeprecated) {
            continue;
        }
        const args = [];
        if (config.needDescription) {
            args.push(`description="${childParam.description.replaceAll('\n', '')}"`);
        }
        if (config.needExample) {
            args.push(`json_schema_extra={"example": "${childParam.example}"}`);
        }
        const defaultVal = childParam.required ? '...' : 'default=None';
        const fieldArgs = args.length > 0 ? ` = Field(${defaultVal}, ${args.join(', ')})` : '';
        rawCodes.push(`    ${childParam.name}: ${childParam.type}${fieldArgs}`);
    }
    if (param.childParams.length === 0) {
        rawCodes.push('    pass');
    }
    rawCodes.push('    ', '    ');
    return rawCodes;
}

export function generate(platform: Platform, response: string, config: IExtensionConfig): string[] {
    if (config.language !== Language.PYTHON) {
        throw new Error(`Unsupported language: ${config.language}`);
    }
    const rawCodes: string[] = [];
    let requestData: RequestTypes.RequestData | null = null;
    if (platform === Platform.DOUDIAN) {
        requestData = generateDoudian(response);
    }
    if (!requestData) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    for (const param of requestData.params) {
        rawCodes.push(...generateByPython(platform, param, config));
    }
    for (const param of requestData.responses) {
        rawCodes.push(...generateByPython(platform, param, config));
    }

    rawCodes.push(
        `class ${requestData.methodName}Request(${config.modelConfig[platform].requestBaseType}):`,
        `    method: str = "${requestData.methodName}"`,
        `    param: ${requestData.params[requestData.params.length - 1].className}`,
        '    ',
    );
    return rawCodes;
}
