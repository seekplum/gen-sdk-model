import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

interface IParam {
    paramName: string;
    paramType: string;
    description: string;
    example: string;
    required: boolean;
    structureId: number;

    children?: IParam[];
}

interface RequestParam extends IParam {}

interface RequestResponse extends IParam {}

const TYPE_MAP = {
    Long: VariableTypes.INT,
    Integer: VariableTypes.INT,
    Number: VariableTypes.INT,
    String: VariableTypes.STRING,
    JSON: VariableTypes.STRING,
    Boolean: VariableTypes.BOOL,
    Double: VariableTypes.FLOAT,
    Date: VariableTypes.DATE,
} as Record<string, string>;

function isModel(param: IParam): boolean {
    return !!param.structureId;
}

function isList(param: IParam): boolean {
    return param.paramType.includes('[]') || param.paramType.includes('List');
}

function isListModel(param: IParam): boolean {
    return isList(param) && !TYPE_MAP[param.paramType];
}

function parseType(param: IParam): [string, string | null] {
    if (isList(param)) {
        const type = utils.parseArrayName(param.paramType);
        return [VariableTypes.LIST, TYPE_MAP[type] || type];
    }
    if (isModel(param)) {
        return [utils.parseArrayName(param.paramType), null];
    }

    return [TYPE_MAP[param.paramType], null];
}

function buildParams(
    modelType: ModelTypes,
    param: IParam,
    models: [string, ModelTypes, IParam[]][],
): void {
    if (!isModel(param) && !isListModel(param)) {
        return;
    }
    const pathName = utils.buildParentPathName(
        utils.parseObjectName(utils.parseArrayName(param.paramType)),
        param.paramName,
    );
    for (const c of param.children || []) {
        if (!TYPE_MAP[utils.parseArrayName(c.paramType)]) {
            c.paramType = utils.buildParentPathName(
                utils.parseObjectName(utils.parseArrayName(c.paramType)),
                pathName,
                c.paramName,
            );
        }
        buildParams(modelType, c, models);
    }
    if (isModel(param)) {
        const childParams = param.children || [];
        models.push([pathName, modelType, childParams]);
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
            const [typeName, childType] = parseType(param);
            childParams.push({
                name: param.paramName,
                type: typeName,
                childType,
                description: utils.removeSpecialCharacters(param.description),
                example: utils.removeSpecialCharacters(param.example),
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
    if (responseJson.status !== 200) {
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
    const { inputParams, outputParams, name: requestName } = dataJson;

    const methodName = utils.snake2pascal(requestName);
    return genModels([location.href], requestName, methodName, inputParams, outputParams);
}
