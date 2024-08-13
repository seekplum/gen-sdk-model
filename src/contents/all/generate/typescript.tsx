import { type Platform, VariableTypes } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';

import { getParentModelName } from './utils';

const VariableTypesMap: Record<string, string> = {
    [VariableTypes.STRING]: 'string',
    [VariableTypes.INT]: 'number',
    [VariableTypes.FLOAT]: 'number',
    [VariableTypes.BOOL]: 'boolean',
    [VariableTypes.LIST]: 'Array',
    [VariableTypes.OBJECT]: 'object',
};

function generateByTypescript(
    platform: Platform,
    param: RequestTypes.RequestModel,
    config: IExtensionConfig,
): string[] {
    const rawCodes: string[] = [];

    rawCodes.push(
        `interface ${param.className} extends ${getParentModelName(platform, param.parentModelType, config)} {`,
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
            args.push(`description: ${childParam.description}`);
        }
        if (config.needExample) {
            args.push(`example: ${childParam.example}`);
        }
        const defaultVal = childParam.required ? '' : '?';
        const fieldArgs = args.length > 0 ? ` /** ${args.join(', ')} */` : '';

        const variableType = VariableTypesMap[childParam.type] || childParam.type;
        const originChildType =
            VariableTypesMap[childParam.childType || ''] || childParam.childType || '';
        const childType =
            originChildType === VariableTypes.OBJECT ? childParam.childType : originChildType;
        const typeName = childParam.childType ? `${variableType}<${childType}>` : variableType;
        rawCodes.push(`    ${childParam.name}${defaultVal}: ${typeName}${fieldArgs};`);
    }
    rawCodes.push('}', '    ', '    ');
    return rawCodes;
}

export function generate(
    platform: Platform,
    requestData: RequestTypes.RequestData,
    config: IExtensionConfig,
): string[] {
    const rawCodes: string[] = [];
    for (const param of requestData.params) {
        rawCodes.push(...generateByTypescript(platform, param, config));
    }
    for (const param of requestData.responses) {
        rawCodes.push(...generateByTypescript(platform, param, config));
    }

    rawCodes.push(
        `type ${requestData.methodName}Request = ${config.modelConfig[platform].requestBaseType} & {`,
        `    method: "${requestData.methodName}",`,
        `    param: ${requestData.params[requestData.params.length - 1].className},`,
        '}',
        '    ',
    );
    return rawCodes;
}
