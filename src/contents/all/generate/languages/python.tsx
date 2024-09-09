import { type Platform, VariableTypes } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

import { getParentModelName } from '../utils';

function buildFieldArgs(childParam: RequestTypes.IParam, config: IExtensionConfig): string {
    const args = [];
    if (config.needDescription) {
        args.push(`description="${childParam.description}"`);
    }
    if (config.needExample && childParam.example !== undefined) {
        args.push(`json_schema_extra={"example": "${childParam.example}"}`);
    }
    if (childParam.maxLength !== undefined) {
        let maxLenVal = '';
        switch (childParam.type) {
            case VariableTypes.STRING:
            case VariableTypes.LIST:
                maxLenVal = `max_length=${childParam.maxLength}`;
                break;
            case VariableTypes.INT:
            case VariableTypes.FLOAT:
                maxLenVal = `le=${childParam.maxLength}`;
                break;
        }
        if (maxLenVal) {
            args.push(maxLenVal);
        }
    }
    if (childParam.minLength !== undefined) {
        let minLenVal = '';
        switch (childParam.type) {
            case VariableTypes.STRING:
            case VariableTypes.LIST:
                minLenVal = `min_length=${childParam.minLength}`;
                break;
            case VariableTypes.INT:
            case VariableTypes.FLOAT:
                minLenVal = `ge=${10 ** childParam.minLength}`;
                break;
        }
        if (minLenVal) {
            args.push(minLenVal);
        }
    }
    const defaultVal = childParam.required ? '...' : 'default=None';
    const snakeName = utils.pascal2snake(childParam.name);
    if (childParam.name !== snakeName) {
        args.push(`alias="${childParam.name}"`);
        childParam.name = snakeName;
    }
    return args.length > 0 ? ` = Field(${defaultVal}, ${args.join(', ')})` : '';
}

function buildTypeArgs(childParam: RequestTypes.IParam): string {
    let typeName = childParam.childType
        ? `${childParam.type}[${childParam.childType}]`
        : childParam.type;
    if (!childParam.required) {
        typeName = `Optional[${typeName}]`;
    }
    return typeName;
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
        const typeName = buildTypeArgs(childParam);
        const fieldArgs = buildFieldArgs(childParam, config);
        rawCodes.push(`    ${childParam.name}: ${typeName}${fieldArgs}`);
    }
    if (param.childParams.length === 0) {
        rawCodes.push('    pass');
    }
    rawCodes.push('    ', '    ');
    return rawCodes;
}

export function generate(
    platform: Platform,
    requestData: RequestTypes.RequestData,
    config: IExtensionConfig,
): string[] {
    const rawCodes: string[] = [];
    if (requestData.comments) {
        rawCodes.push(...requestData.comments.map((comment) => `# ${comment}`));
    }
    const params = requestData.params || [];
    const responses = requestData.responses || [];
    for (const param of params) {
        rawCodes.push(...generateByPython(platform, param, config));
    }
    for (const param of responses) {
        rawCodes.push(...generateByPython(platform, param, config));
    }

    if (requestData.methodName && requestData.requestName && params.length > 0) {
        rawCodes.push(
            `class ${requestData.methodName}Request(${config.modelConfig[platform].request}):`,
            `    method: str = "${requestData.requestName}"`,
            `    param: ${params[params.length - 1].className}`,
            '    ',
        );
    }
    return rawCodes;
}
