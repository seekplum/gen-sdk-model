import { type Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';
import type * as RequestTypes from '@/typings/request';
import { pascal2pathname } from '@/utils/utils';

import { getParentModelName } from './utils';

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
            args.push(`description="${childParam.description}"`);
        }
        if (config.needExample && childParam.example !== undefined) {
            args.push(`json_schema_extra={"example": "${childParam.example}"}`);
        }
        const defaultVal = childParam.required ? '...' : 'default=None';
        const fieldArgs = args.length > 0 ? ` = Field(${defaultVal}, ${args.join(', ')})` : '';
        let typeName = childParam.childType
            ? `${childParam.type}[${childParam.childType}]`
            : childParam.type;
        if (!childParam.required) {
            typeName = `Optional[${typeName}]`;
        }
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

    if (requestData.methodName && params.length > 0) {
        rawCodes.push(
            `class ${requestData.methodName}Request(${config.modelConfig[platform].requestBaseType}):`,
            `    method: str = "${pascal2pathname(requestData.methodName)}"`,
            `    param: ${params[params.length - 1].className}`,
            '    ',
        );
    }
    return rawCodes;
}
