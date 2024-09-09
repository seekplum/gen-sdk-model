import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

interface IParam {
    children: IParam[];
    value: {
        deprecated: boolean;
        description: string;
        exactType: string;
        example: string;
        fieldName: string;
        fieldType: string;
        mustType: string;
        listType: boolean;
        maxLength: number;
    };
}

interface RequestParam extends IParam {}

interface RequestResponse extends IParam {}

const TYPE_MAP = {
    Price: VariableTypes.FLOAT,
    Number: VariableTypes.INT,
    Boolean: VariableTypes.BOOL,
    String: VariableTypes.STRING,
} as Record<string, string>;

function isModel(param: IParam): boolean {
    return !!param.children && param.value.fieldType === 'COMPLEXTYPE';
}

function isList(param: IParam): boolean {
    return param.value.listType;
}

function isListModel(param: IParam): boolean {
    return isList(param) && !TYPE_MAP[param.value.exactType];
}

function parseType(param: IParam): [string, string | null] {
    if (param.value.listType) {
        return [VariableTypes.LIST, TYPE_MAP[param.value.exactType] || param.value.exactType];
    }
    if (isModel(param)) {
        return [param.value.exactType, null];
    }

    return [TYPE_MAP[param.value.exactType], null];
}

function buildParams(
    modelType: ModelTypes,
    param: IParam,
    models: [string, ModelTypes, IParam[]][],
): void {
    if (!isModel(param) && !isListModel(param)) {
        return;
    }
    const pathName = utils.buildParentPathName(param.value.exactType, param.value.fieldName);
    for (const c of param.children || []) {
        if (isModel(c) || isListModel(c)) {
            c.value.exactType = utils.buildParentPathName(
                c.value.exactType,
                pathName,
                c.value.fieldName,
            );
        }
        buildParams(modelType, c, models);
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
        buildParams(ModelTypes.CHILD, param, models);
    }
    models.push([baseClassName, modelType, params]);
    return models;
}

function parseMaxLength(param: IParam): number | null {
    const maxLength = param.value.maxLength;
    if (!maxLength) {
        return null;
    }
    const lowerType = param.value.exactType.toLowerCase();
    if (lowerType === 'price') {
        // 两个小数 + 一个小数点
        return 10 ** (maxLength - 3);
    }
    if (lowerType === 'number') {
        return maxLength <= 10 ? 10 ** maxLength : maxLength;
    }
    return maxLength;
}

function convertModel(models: [string, ModelTypes, IParam[]][]): RequestTypes.RequestModel[] {
    const requestModels: RequestTypes.RequestModel[] = [];
    for (const values of models) {
        const [className, parentModelType, params] = values;
        const childParams: RequestTypes.IParam[] = [];
        for (const param of params) {
            const [typeName, childType] = parseType(param);
            childParams.push({
                name: param.value.fieldName,
                type: typeName,
                childType,
                description: utils.removeSpecialCharacters(param.value.description),
                example: utils.removeSpecialCharacters(param.value.example),
                required: param.value.mustType === 'MUST',
                deprecated: param.value.deprecated,
                maxLength: parseMaxLength(param),
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
    if (responseJson.stat !== 'ok') {
        return {
            comments: ['请求失败，未正常返回接口文档数据'],
        } as RequestTypes.RequestData;
    }
    const content = JSON.parse(responseJson.data.content.text);
    const apiData = content.apiData || {};
    const requestName = apiData.name;
    if (!requestName) {
        return {
            comments: ['解析请求名称失败'],
        } as RequestTypes.RequestData;
    }
    const methodName = utils.snake2pascal(requestName);
    const requestParamList = JSON.parse(apiData.requestParamList || '[]');
    const responseParamList = JSON.parse(apiData.responseParamList || '[]');
    return genModels([location.href], requestName, methodName, requestParamList, responseParamList);
}
