import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

interface IParam {
    type: number;
    subType?: number;
    example: string;
    description: string;

    requestName?: string;
    responseName?: string;
    mustNeed?: boolean;
    children?: IParam[];

    customType?: string;
}

interface RequestParam extends IParam {
    requestName: string;
    mustNeed: boolean;
    deprecated?: boolean;
    removed?: boolean;
    children?: RequestParam[];
}

interface RequestResponse extends IParam {
    responseName: string;
    tagId?: number;
    children?: RequestResponse[];
}

const TYPE_MAP = {
    0: VariableTypes.INT,
    1: VariableTypes.INT,
    2: VariableTypes.STRING,
    3: VariableTypes.LIST,
    4: VariableTypes.BOOL,
    5: VariableTypes.OBJECT,
    7: VariableTypes.INT,
    8: VariableTypes.DICT,
    9: VariableTypes.FLOAT,
    99: VariableTypes.INT,
} as Record<number, string>;

function isModel(param: IParam): boolean {
    return !!param.children && TYPE_MAP[param.type] === VariableTypes.OBJECT;
}

function isList(param: IParam): boolean {
    return !!param.children && TYPE_MAP[param.type] === VariableTypes.LIST;
}

function isListModel(param: IParam): boolean {
    return isList(param) && !!param.subType && TYPE_MAP[param.subType] === VariableTypes.OBJECT;
}

function isRequired(param: IParam) {
    if (param.mustNeed !== undefined) {
        return param.mustNeed;
    }
    return !param.description.includes('【可选】');
}

function isDeprecated(param: IParam): boolean {
    return (
        !!param.description &&
        (param.description.includes('【即将废弃】') ||
            (param.description.startsWith('【该字段将在') && param.description.includes('下线')))
    );
}
function isRemoved(param: IParam): boolean {
    return !!param.description && param.description.includes('【已废弃】');
}

function parseName(param: IParam): string {
    return param.requestName || param.responseName || 'unknown';
}

function parseType(param: IParam): [string, string | null] {
    if (isListModel(param)) {
        const originChildType =
            param.customType || (param.subType ? TYPE_MAP[param.subType] : null);
        const childType =
            originChildType === VariableTypes.OBJECT
                ? utils.snake2pascal(parseName(param))
                : originChildType;
        return [VariableTypes.LIST, childType];
    }
    if (isList(param)) {
        return [VariableTypes.LIST, null];
    }
    if (isModel(param)) {
        return [param.customType || utils.snake2pascal(parseName(param)), null];
    }
    return [TYPE_MAP[param.type], param.subType ? TYPE_MAP[param.subType] : null];
}

function buildParams(
    rootType: ModelTypes,
    modelType: ModelTypes,
    param: IParam,
    models: [string, ModelTypes, IParam[]][],
): void {
    if (!isModel(param) && !isListModel(param)) {
        return;
    }
    const [typeName, childType] = parseType(param);

    const pathName = utils.buildParentPathName(
        utils.parseObjectName(utils.parseArrayName(childType || typeName)),
        parseName(param),
    );
    for (const c of param.children || []) {
        if (!isModel(c) && !isListModel(c)) {
            continue;
        }
        const [childTypeName, childChildType] = parseType(c);
        c.customType = utils.buildParentPathName(
            childChildType || childTypeName,
            pathName,
            parseName(c),
        );
        buildParams(rootType, modelType, c, models);
    }
    const childParams = param.children || [];
    models.push([pathName, modelType, childParams]);
}

function buildModels(
    baseClassName: string,
    modelType: ModelTypes,
    params: IParam[],
): [string, ModelTypes, IParam[]][] {
    const models: [string, ModelTypes, IParam[]][] = [];
    for (const param of params) {
        buildParams(modelType, ModelTypes.CHILD, param, models);
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
            const [typeName, childType] = parseType(param);
            childParams.push({
                name: parseName(param),
                type: typeName,
                childType,
                description: utils.removeSpecialCharacters(param.description),
                example: utils.removeSpecialCharacters(param.example),
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
    comments: string[],
    requestName: string,
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
        comments,
        requestName,
    } as RequestTypes.RequestData;
}

export function generate(response: string): RequestTypes.RequestData {
    const responseJson = JSON.parse(response);
    if (responseJson.code !== 0) {
        return {
            comments: ['请求失败，未正常返回接口文档数据'],
        } as RequestTypes.RequestData;
    }
    if (!responseJson.data) {
        return {
            comments: ['接口文档数据为空，请检查接口文档是否正确'],
        } as RequestTypes.RequestData;
    }
    const pathname = responseJson.data.article.info.title;
    const methodName = utils.snake2pascal(pathname);
    const requestName = utils.pathname2requestName(pathname);
    const content = JSON.parse(responseJson.data.article.content);
    return genModels(
        [location.href],
        requestName,
        methodName,
        content.request.requestParam || [],
        content.response.responseData || [],
    );
}
