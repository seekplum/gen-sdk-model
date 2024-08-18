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
    long: VariableTypes.INT,
    Integer: VariableTypes.INT,
    String: VariableTypes.STRING,
    boolean: VariableTypes.BOOL,
    Boolean: VariableTypes.BOOL,
    List: VariableTypes.LIST,
    Double: VariableTypes.FLOAT,
    MAP: VariableTypes.DICT,
    Map: VariableTypes.DICT,
    Date: VariableTypes.DATE,
} as Record<string, string>;

function isModel(param: IParam): boolean {
    return param.complexTypeFlag;
}

function isList(param: IParam): boolean {
    return param.type.includes('[]') || param.type.includes('List');
}

function isListModel(param: IParam): boolean {
    const tmpName = utils.parseArrayName(param.type);
    return isList(param) && !TYPE_MAP[tmpName] && tmpName.toLowerCase() !== 'list';
}

function parseType(param: IParam): [string, string | null] {
    const originType = utils.parseObjectName(utils.parseArrayName(param.type));

    if (originType.toLowerCase() === 'list') {
        return [VariableTypes.LIST, null];
    }
    if (isList(param)) {
        return [VariableTypes.LIST, TYPE_MAP[originType] || originType];
    }
    if (isModel(param)) {
        return [utils.parseObjectName(param.type), null];
    }

    return [TYPE_MAP[originType] || originType, null];
}

function buildParams(
    modelType: ModelTypes,
    param: IParam,
    models: [string, ModelTypes, IParam[]][],
): void {
    if (!isModel(param) && !isListModel(param)) {
        return;
    }

    const [typeName, childType] = parseType(param);
    const pathName = utils.buildParentPathName(
        childType || typeName,
        utils.parseObjectName(param.name),
    );
    for (const c of param.children || []) {
        if (isModel(c) || isListModel(c)) {
            const [childTypeName, childChildType] = parseType(c);
            c.type = utils.buildParentPathName(
                childChildType || childTypeName,
                pathName,
                utils.parseObjectName(c.name),
            );
        }
        buildParams(modelType, c, models);
    }
    if (!(typeName === VariableTypes.LIST && (!childType || childType === VariableTypes.DICT))) {
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
    const methodName = utils.parseObjectName(utils.snake2pascal(requestName));
    const requestParamList = result.apiAppParamVOList;
    const responseParamList = result.apiReturnParamVOList;
    return genModels([location.href], requestName, methodName, requestParamList, responseParamList);
}
