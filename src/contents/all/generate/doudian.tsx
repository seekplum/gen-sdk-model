import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import { removeSpecialCharacters, snake2pascal } from '@/utils/utils';

interface IParam {
    type: number;
    subType?: number;
    example: string;
    description: string;

    requestName?: string;
    responseName?: string;
    mustNeed?: boolean;
    children?: IParam[];
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
    8: VariableTypes.OBJECT,
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
    const originType = TYPE_MAP[param.type];
    let typeName = isModel(param) ? snake2pascal(parseName(param)) : originType;
    let childType = null;
    if (originType === VariableTypes.LIST) {
        const originChildType = param.subType ? TYPE_MAP[param.subType] : null;
        childType = originChildType === VariableTypes.OBJECT ? typeName : originChildType;
        typeName = originType;
    }
    return [isRequired(param) ? typeName : `Optional[${typeName}]`, childType];
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
            const [typeName, childType] = parseType(param);
            childParams.push({
                name: parseName(param),
                type: typeName,
                childType,
                description: removeSpecialCharacters(param.description),
                example: removeSpecialCharacters(param.example),
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
    } as RequestTypes.RequestData;
}

export function generate(response: string): RequestTypes.RequestData {
    const responseJson = JSON.parse(response);
    const methodName = snake2pascal(responseJson.data.article.info.title);
    const content = JSON.parse(responseJson.data.article.content);
    return genModels(
        [location.href],
        methodName,
        content.request.requestParam || [],
        content.response.responseData || [],
    );
}
