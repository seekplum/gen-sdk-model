import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

interface IParam {
    name: string;
    type: string;
    description: string;
    demoValue: string;
    required: boolean;
    structureId: number;

    subParams?: IParam[];
}

interface RequestParam extends IParam {}

interface RequestResponse extends IParam {}

const TYPE_MAP = {
    Long: VariableTypes.INT,
    Integer: VariableTypes.INT,
    Number: VariableTypes.INT,
    String: VariableTypes.STRING,
    byte: VariableTypes.STRING,
    JSON: VariableTypes.STRING,
    Boolean: VariableTypes.BOOL,
    Double: VariableTypes.FLOAT,
    Date: VariableTypes.DATE,
} as Record<string, string>;

function isModel(param: IParam): boolean {
    return !!param.subParams && param.subParams.length > 0;
}

function isList(param: IParam): boolean {
    return param.type.includes('[]') || param.type.includes('List');
}

function isListModel(param: IParam): boolean {
    const tmpName = utils.parseArrayName(param.type);
    return isList(param) && !TYPE_MAP[tmpName] && tmpName.toLowerCase() !== 'list';
}

function parseType(param: IParam): [string, string | null] {
    if (isList(param)) {
        const type = utils.parseArrayName(param.type);
        return [VariableTypes.LIST, TYPE_MAP[type] || type];
    }
    if (isModel(param)) {
        return [utils.parseArrayName(param.type), null];
    }

    return [TYPE_MAP[param.type], null];
}

function buildParams(
    modelType: ModelTypes,
    param: IParam,
    models: [string, ModelTypes, IParam[]][],
): void {
    if (!isModel(param) && !isListModel(param)) {
        return;
    }
    const pathName = utils.buildParentPathName(param.type, param.name);
    for (const c of param.subParams || []) {
        if (!isModel(c) && !isListModel(c)) {
            continue;
        }

        c.type = utils.buildParentPathName(c.type, pathName, c.name);
        buildParams(modelType, c, models);
    }
    const childParams = param.subParams || [];
    models.push([
        utils.buildParentPathName(
            utils.parseObjectName(utils.parseArrayName(param.type)),
            pathName,
        ),
        modelType,
        childParams,
    ]);
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
            const [typeName, childType] = parseType(param);
            childParams.push({
                name: param.name,
                type: typeName,
                childType,
                description: utils.removeSpecialCharacters(param.description),
                example: utils.removeSpecialCharacters(param.demoValue),
                required: param.required,
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
    if (!responseJson.success) {
        return {
            comments: ['请求失败，未正常返回接口文档数据'],
        } as RequestTypes.RequestData;
    }
    const { data: dataJson } = responseJson;
    if (!dataJson) {
        return {
            comments: ['接口文档数据为空，请检查接口文档是否正确'],
        } as RequestTypes.RequestData;
    }
    const { requestParams, responseParams, name: requestName } = dataJson;

    const methodName = utils.snake2pascal(requestName);
    return genModels([location.href], requestName, methodName, requestParams, responseParams);
}
