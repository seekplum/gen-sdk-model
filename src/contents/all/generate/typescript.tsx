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

function buildFieldArgs(childParam: RequestTypes.IParam, config: IExtensionConfig): string {
    const args = [];
    if (config.needDescription) {
        args.push(`description: ${childParam.description}`);
    }
    if (config.needExample && childParam.example !== undefined) {
        args.push(`example: ${childParam.example}`);
    }
    return args.length > 0 ? ` /** ${args.join(', ')} */` : '';
}

function buildTypeArgs(childParam: RequestTypes.IParam): string {
    const variableType = VariableTypesMap[childParam.type] || childParam.type;
    const originChildType =
        VariableTypesMap[childParam.childType || ''] || childParam.childType || '';
    const childType =
        originChildType === VariableTypes.OBJECT ? childParam.childType : originChildType;
    return childParam.childType ? `${variableType}<${childType}>` : variableType;
}

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
        const defaultVal = childParam.required ? '' : '?';
        const typeName = buildTypeArgs(childParam);
        const fieldArgs = buildFieldArgs(childParam, config);
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
    if (requestData.comments) {
        rawCodes.push(...requestData.comments.map((comment) => `/** ${comment} */`));
    }
    const params = requestData.params || [];
    const responses = requestData.responses || [];
    for (const param of params) {
        rawCodes.push(...generateByTypescript(platform, param, config));
    }
    for (const param of responses) {
        rawCodes.push(...generateByTypescript(platform, param, config));
    }

    if (requestData.methodName && requestData.requestName && params.length > 0) {
        rawCodes.push(
            `type ${requestData.methodName}Request = ${config.modelConfig[platform].requestBaseType} & {`,
            `    method: "${requestData.requestName}",`,
            `    param: ${params[params.length - 1].className},`,
            '}',
            '    ',
        );
    }
    return rawCodes;
}
