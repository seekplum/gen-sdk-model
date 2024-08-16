import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import * as utils from '@/utils/utils';

const TYPE_MAP = {
    'number': VariableTypes.INT,
    'string': VariableTypes.STRING,
    'string(uint64)': VariableTypes.STRING,
    'bool': VariableTypes.BOOL,
    'array': VariableTypes.LIST,
    'array(string)': VariableTypes.LIST,
    'array[string]': VariableTypes.LIST,
    'Object': VariableTypes.OBJECT,
    'Objct': VariableTypes.OBJECT,
} as Record<string, string>;

interface IRequestId {
    url: string;
    param: string;
    response: string;
}

interface IParam extends RequestTypes.IParam {
    children: IParam[];
}

enum Product {
    CHANNELS = 'channels',
    MINI_STORE = 'mini_store',
    MINI_PROGRAM = 'mini_program',
}

const PRODUCT_REQUEST_ID_MAP = {
    [Product.CHANNELS]: {
        url: '接口调用请求说明',
        param: '请求参数说明',
        response: '返回参数说明',
    } as IRequestId,
    [Product.MINI_STORE]: {
        url: '接口调用请求说明',
        param: '请求参数说明',
        response: '回包参数说明',
    } as IRequestId,
    [Product.MINI_PROGRAM]: {
        url: '接口调用请求说明',
        param: '请求参数说明',
        response: '回包参数说明',
    } as IRequestId,
};

function parseProduct(): Product | null {
    const url = window.location.href;
    if (url.includes('/doc/channels/')) {
        return Product.CHANNELS;
    }
    if (url.includes('/doc/ministore/')) {
        return Product.MINI_STORE;
    }
    if (url.includes('/miniprogram/dev/')) {
        return Product.MINI_PROGRAM;
    }
    return null;
}

function parseUrl(product: Product): URL | null {
    const requestId = PRODUCT_REQUEST_ID_MAP[product];
    let element = document.querySelector(`#${requestId.url}`);
    while (element && element.tagName !== 'DIV') {
        element = element.nextElementSibling;
    }
    const url = element?.textContent
        ?.split(/[\n ]/)
        .find((line) => line.includes('https://api.weixin.qq.com/'));
    if (!url) {
        return null;
    }
    return new URL(url);
}

function parseArrayChildType(type: string): string {
    const tmpType = type
        .trim()
        .toLowerCase()
        .replace(/array|[()<>[\]]/g, '')
        .trim();
    return TYPE_MAP[tmpType] || tmpType;
}

function parseName(name: string): string {
    return name.replace('[]', '');
}

function parseNameByOject(name: string): string {
    return name.toLowerCase().replace(/object|objct|[()]/g, '');
}

function isObject(lowerType: string): boolean {
    return lowerType.includes('object') || lowerType.includes('objct');
}

function parseTypeByType(type: string): [string, string] {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('array')) {
        return [VariableTypes.LIST, parseArrayChildType(lowerType)];
    }
    if (lowerType.includes('[]')) {
        return [VariableTypes.LIST, utils.snake2pascal(lowerType.replace('[]', ''))];
    }

    if (isObject(lowerType)) {
        return [utils.snake2pascal(parseNameByOject(lowerType)), ''];
    }
    return [TYPE_MAP[type] || type, ''];
}

function parseTypeByName(name: string): [string, string] {
    if (name.includes('[]')) {
        return [VariableTypes.LIST, utils.snake2pascal(parseName(name))];
    }
    return [utils.snake2pascal(name), ''];
}

function removeChildren(children: IParam[]) {
    const res = [...children];
    while (res.length > 0) {
        const child = res.pop();
        if (!child) {
            continue;
        }
        // res.push(...child.children);
        child.children = [];
    }
    return children;
}

function buildParams(
    className: string,
    parentModelType: ModelTypes,
    childParams: IParam[],
): RequestTypes.RequestModel[] {
    const models: RequestTypes.RequestModel[] = [];
    const childrenArrays: IParam[] = [];
    const childParamsArrays: IParam[] = [...childParams];
    while (childParamsArrays.length > 0) {
        const childParam = childParamsArrays.pop();
        if (!childParam) {
            continue;
        }
        if (childParam.children.length > 0) {
            childrenArrays.push(
                ...childParam.children.filter((child) => child.children.length > 0),
                childParam,
            );
            childParamsArrays.push(...childParam.children);
        }
    }
    const exitsNames = new Set();
    for (let i = childrenArrays.length - 1; i >= 0; i--) {
        const child = childrenArrays[i];
        const childClassName = utils.snake2pascal(child.name);
        if (exitsNames.has(childClassName)) {
            continue;
        }
        const childrenParams = removeChildren(child.children);
        exitsNames.add(childClassName);
        models.push({
            className: childClassName,
            parentModelType: ModelTypes.CHILD,
            childParams: childrenParams,
        } as RequestTypes.RequestModel);
    }
    models.push({
        className,
        parentModelType,
        childParams: removeChildren(childParams),
    } as RequestTypes.RequestModel);
    return models;
}

function convertModels(
    params: RequestTypes.IParam[],
    className: string,
    parentModelType: ModelTypes,
): RequestTypes.RequestModel[] {
    const childParams: IParam[] = [];
    for (const param of params) {
        // 复杂类型
        if (param.name.includes('.')) {
            const names = param.name.split('.');
            const baseName = parseName(names[0]);
            let rootChild = childParams.find((item) => item.name === baseName);
            if (!rootChild) {
                // 说明文档中没有该类型
                const [rootType, rootChildType] = parseTypeByName(names[0]);
                rootChild = {
                    name: baseName,
                    type: rootType,
                    childType: rootChildType,
                    required: false,
                    description: '缺少类型描述，请自行补充',
                    children: [],
                } as IParam;
                childParams.push(rootChild);
            }

            let rootChildren = rootChild.children;
            for (let j = 1; j < names.length; j++) {
                const tmpName = names[j];

                let tmpType2 = param.type;
                let tmpChildType2 = '';
                const isNoLast = j !== names.length - 1;
                if (isNoLast) {
                    if (tmpName.includes('[]')) {
                        [tmpType2, tmpChildType2] = parseTypeByName(tmpName);
                    } else {
                        tmpType2 = utils.snake2pascal(parseName(tmpName));
                        tmpChildType2 = '';
                    }
                } else {
                    [tmpType2, tmpChildType2] = parseTypeByType(param.type);
                    if (tmpType2 === VariableTypes.LIST && !tmpChildType2) {
                        tmpChildType2 = utils.snake2pascal(parseName(tmpName));
                    }
                }
                const tmpName2 = parseName(tmpName);

                const tmpChild = {
                    name: tmpName2,
                    type: tmpType2,
                    childType: tmpChildType2,
                    required: param.required,
                    description: param.description,
                    children: [],
                } as IParam;
                const tmpChildren = rootChildren.find((item) => item.name === tmpName2);
                if (tmpChildren) {
                    rootChildren = tmpChildren.children;
                } else {
                    rootChildren.push(tmpChild);
                    rootChildren = tmpChild.children;
                }
            }
        } else {
            let tmpType1 = param.type;
            let tmpChildType1 = '';
            if (param.name.includes('[]')) {
                [tmpType1, tmpChildType1] = parseTypeByName(param.name);
            } else {
                [tmpType1, tmpChildType1] = parseTypeByType(param.type);
            }
            childParams.push({
                name: parseName(param.name),
                type: tmpType1,
                childType: tmpChildType1,
                required: param.required,
                description: param.description,
                children: [],
            } as IParam);
        }
    }

    return buildParams(className, parentModelType, childParams);
}

function getModels(
    rows: string[][],
    className: string,
    parentModelType: ModelTypes,
): RequestTypes.RequestModel[] {
    const params: RequestTypes.IParam[] = [];
    for (const cells of rows) {
        if (cells.length === 0) {
            continue;
        }
        const name = cells[0];
        const type = cells[1];
        const required = cells.length === 3 ? true : cells[2] === '是';
        const description = cells.length === 3 ? cells[2] : cells[3];
        params.push({
            name,
            type,
            required,
            description: utils.removeSpecialCharacters(description),
        } as RequestTypes.IParam);
    }
    return convertModels(params, className, parentModelType);
}

function getElement(elementID: string): Element | null {
    if (!elementID) {
        return null;
    }
    let element = document.querySelector(`#${elementID}`);
    while (element && element.tagName !== 'TABLE') {
        element = element.nextElementSibling;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (element?.firstChild?.tagName === 'TABLE') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return element.firstChild;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (element?.lastChild?.tagName === 'TABLE') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return element.lastChild;
        }
        if (element?.nextElementSibling?.tagName === 'TABLE') {
            return element.nextElementSibling;
        }
    }
    return element;
}

function getDataByDocument(elementID: string): string[][] {
    const element = getElement(elementID);
    if (!element) {
        return [];
    }
    const rows = [...element.querySelectorAll('tr')];
    const data = [];
    const exitsNames = new Set();
    for (const row of rows) {
        const cells = [...row.querySelectorAll('td')].map((cell) => cell.textContent || '');
        if (cells.length === 0) {
            continue;
        }
        data.push(cells);
        const dataType = cells[1].toLowerCase();
        if (cells.length === 3 && isObject(dataType)) {
            const nameId = parseNameByOject(dataType);
            if (exitsNames.has(nameId)) {
                continue;
            }
            const dataElem = getElement(nameId);
            if (dataElem) {
                exitsNames.add(nameId);
                const dataRows = [...dataElem.querySelectorAll('tr')];
                for (const dataRow of dataRows) {
                    const dataCells = [...dataRow.querySelectorAll('td')].map(
                        (cell) => cell.textContent || '',
                    );
                    if (dataCells.length === 0) {
                        continue;
                    }
                    const [name, ...extra] = dataCells;
                    data.push([`${nameId}.${name}`, ...extra]);
                }
            } else {
                throw new Error(`未找到 ${elementID} 中的 ${nameId} 数据`);
            }
        }
    }
    return data;
}
function buildModels(
    className: string,
    parentModelType: ModelTypes,
    elementID: string,
): RequestTypes.RequestModel[] {
    const data = getDataByDocument(elementID);
    return getModels(data, className, parentModelType);
}

function genModels(
    comments: string[],
    requestName: string,
    methodName: string,
    product: Product,
): RequestTypes.RequestData {
    const requestId = PRODUCT_REQUEST_ID_MAP[product];
    const params = buildModels(`${methodName}Param`, ModelTypes.PARAM, requestId.param);
    const responses = buildModels(`${methodName}Response`, ModelTypes.RESPONSE, requestId.response);
    return {
        methodName,
        params,
        responses,
        comments,
        requestName,
    } as RequestTypes.RequestData;
}

export function generate(): RequestTypes.RequestData {
    const product = parseProduct();
    if (!product) {
        return {
            comments: ['未找到产品类型'],
        } as RequestTypes.RequestData;
    }
    const url = parseUrl(product);
    if (!url) {
        return {
            comments: ['解析 URL 失败'],
        } as RequestTypes.RequestData;
    }
    const methodName = utils.snake2pascal(url.pathname);
    const requestName = utils.pathname2requestName(url.pathname);

    return genModels([location.href], requestName, methodName, product);
}
