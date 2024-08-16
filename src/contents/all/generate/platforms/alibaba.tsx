import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

interface IParam {
    name: string;
    type: string;
    description: string;
    exampleValue: string;
    defaultValue?: string;
    required?: boolean;
    complexTypeFlag: boolean;

    children?: IParam[];
}

interface RequestParam extends IParam {}

interface RequestResponse extends IParam {}

const TYPE_MAP = {
    Long: VariableTypes.INT,
    Integer: VariableTypes.INT,
    String: VariableTypes.STRING,
    Boolean: VariableTypes.BOOL,
    Double: VariableTypes.FLOAT,
    Date: VariableTypes.DATE,
} as Record<string, string>;

function isModel(param: IParam): boolean {
    return param.complexTypeFlag;
}

function parseType(param: IParam): [string, string | null] {
    if (param.type.includes('[]')) {
        const type = utils.parseObjectName(utils.parseArrayName(param.type));
        return [VariableTypes.LIST, TYPE_MAP[type] || type];
    }
    if (isModel(param)) {
        return [utils.parseObjectName(param.type), null];
    }

    return [TYPE_MAP[param.type], null];
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
        models.push([
            utils.parseObjectName(utils.parseArrayName(param.type)),
            modelType,
            childParams,
        ]);
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
                name: param.name,
                type: typeName,
                childType,
                description: utils.removeSpecialCharacters(param.description),
                example: utils.removeSpecialCharacters(param.exampleValue),
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
    const result = responseJson.result;
    const requestName = result.name;
    if (!requestName) {
        return {
            comments: ['解析请求名称失败'],
        } as RequestTypes.RequestData;
    }
    const methodName = utils.snake2pascal(requestName);
    const requestParamList = result.apiAppParamVOList;
    const responseParamList = result.apiReturnParamVOList;
    return genModels([location.href], requestName, methodName, requestParamList, responseParamList);
}
