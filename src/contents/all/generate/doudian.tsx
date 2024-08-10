import { ModelTypes, VariableTypes } from '@/constants';
import type { IParam, RequestParam, RequestResponse } from '@/typings/doudian';
import type * as RequestTypes from '@/typings/request';
import { snake2pascal } from '@/utils/utils';

const TYPE_MAP = {
    0: VariableTypes.INT,
    1: VariableTypes.INT,
    2: VariableTypes.STRING,
    3: VariableTypes.LIST,
    4: VariableTypes.BOOL,
    5: VariableTypes.OBJECT,
    7: VariableTypes.INT,
    9: VariableTypes.FLOAT,
    99: VariableTypes.INT,
} as Record<number, string>;

function isModel(param: IParam): boolean {
    return (
        !!param.children &&
        (TYPE_MAP[param.type] === VariableTypes.LIST ||
            TYPE_MAP[param.type] === VariableTypes.OBJECT)
    );
}

function isRequired(param: IParam) {
    return param.mustNeed || !param.description.includes('【可选】');
}

function isDeprecated(param: IParam): boolean {
    return !!param.description && param.description.includes('【即将废弃】');
}
function isRemoved(param: IParam): boolean {
    return !!param.description && param.description.includes('【已废弃】');
}

function parseName(param: IParam): string {
    return param.requestName || param.responseName || 'unknown';
}

function parseType(param: IParam): string {
    const typeName = isModel(param) ? snake2pascal(parseName(param)) : TYPE_MAP[param.type];
    return isRequired(param) ? typeName : `Optional[${typeName}]`;
}

function buildParams(
    modelType: ModelTypes,
    param: IParam,
    models: [string, ModelTypes, IParam[]][],
): void {
    if (isModel(param)) {
        for (const c of param.children || []) {
            buildParams(modelType, c, models);
        }
        const childParams = param.children || [];
        models.push([snake2pascal(parseName(param)), modelType, childParams]);
    }
}

function buildModels(
    baseClassName: string,
    modelType: ModelTypes,
    params: IParam[],
): [string, ModelTypes, IParam[]][] {
    const models: [string, ModelTypes, IParam[]][] = [];
    for (const param of params) {
        buildParams(ModelTypes.CHILD, param, models);
    }
    models.push([baseClassName, modelType, params]);
    return models;
}

function convertModel(models: [string, ModelTypes, IParam[]][]): RequestTypes.RequestModel[] {
    const requestModels: RequestTypes.RequestModel[] = [];
    for (const values of models) {
        const [className, parentModelType, params] = values;
        const childParams: RequestTypes.IParam[] = [];
        for (const param of params) {
            childParams.push({
                name: parseName(param),
                type: parseType(param),
                description: param.description,
                example: param.example,
                required: isRequired(param),
                deprecated: isDeprecated(param),
                removed: isRemoved(param),
            } as RequestTypes.IParam);
        }

        requestModels.push({
            className,
            parentModelType,
            childParams,
        } as RequestTypes.RequestModel);
    }
    return requestModels;
}
function genModels(
    methodName: string,
    requestParams: RequestParam[],
    responseData: RequestResponse[],
): RequestTypes.RequestData {
    const paramModels = buildModels(`${methodName}Param`, ModelTypes.PARAM, requestParams);
    const responseModels = buildModels(`${methodName}Response`, ModelTypes.RESPONSE, responseData);
    return {
        methodName,
        params: convertModel(paramModels),
        responses: convertModel(responseModels),
    } as RequestTypes.RequestData;
}

export function generate(response: string): RequestTypes.RequestData {
    const responseJson = JSON.parse(response);
    const methodName = snake2pascal(responseJson.data.article.info.title);
    const content = JSON.parse(responseJson.data.article.content);
    return genModels(
        methodName,
        content.request.requestParam || [],
        content.response.responseData || [],
    );
}
