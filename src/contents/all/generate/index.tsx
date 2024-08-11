import { Language, ModelTypes, PartyName, Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';

import { generate as generateDoudian } from './doudian';

function getParentModelName(modelType: string, config: IExtensionConfig): string {
    switch (modelType) {
        case ModelTypes.PARAM:
            return config.paramBaseType;
        case ModelTypes.RESPONSE:
            return config.responseBaseType;
        case ModelTypes.REQUEST:
            return config.requestBaseType;
        case ModelTypes.CHILD:
            return config.childBaseType;
        default:
            throw new Error(`Unsupported parent model type: ${modelType}`);
    }
}

function generateByPydantic(param: RequestTypes.RequestModel, config: IExtensionConfig): string[] {
    const rawCodes: string[] = [];

    rawCodes.push(
        `class ${param.className}(${getParentModelName(param.parentModelType, config)}):`,
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
    if (config.partyName !== PartyName.PYDANTIC) {
        throw new Error(`Unsupported party: ${config.partyName}`);
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
        if (config.partyName === PartyName.PYDANTIC) {
            rawCodes.push(...generateByPydantic(param, config));
        }
    }
    for (const param of requestData.responses) {
        if (config.partyName === PartyName.PYDANTIC) {
            rawCodes.push(...generateByPydantic(param, config));
        }
    }

    rawCodes.push(
        `class ${requestData.methodName}Request(${config.requestBaseType}):`,
        `    method: str = "${requestData.methodName}"`,
        `    param: ${requestData.params[requestData.params.length - 1].className}`,
        '    ',
    );
    return rawCodes;
}
