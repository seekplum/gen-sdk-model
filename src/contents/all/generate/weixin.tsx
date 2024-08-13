import { ModelTypes, VariableTypes } from '@/constants';
import type * as RequestTypes from '@/typings/request';
import { removeSpecialCharacters, snake2pascal } from '@/utils/utils';

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

function parseMethodName(product: Product): string | null {
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
    return snake2pascal(new URL(url).pathname);
}

function parseType(type: string): string {
    if (type.includes('array')) {
        return VariableTypes.LIST;
    }

    if (type.toLowerCase().includes('object') || type.toLowerCase().includes('objct')) {
        return VariableTypes.OBJECT;
    }
    return TYPE_MAP[type] || type;
}

function parseParams(elementID: string, isResponse = false): RequestTypes.IParam[] | null {
    let element = document.querySelector(`#${elementID}`);
    while (element && element.tagName !== 'TABLE') {
        element = element.nextElementSibling;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (element?.firstChild?.tagName === 'TABLE') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            element = element.firstChild;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
        } else if (element?.lastChild?.tagName === 'TABLE') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            element = element.lastChild;
        }
    }
    if (!element) {
        return null;
    }
    const rows = [...element.querySelectorAll('tr')];
    const childParams: RequestTypes.IParam[] = [];
    for (const row of rows) {
        const cells = [...row.querySelectorAll('td')];
        if (cells.length === 0) {
            continue;
        }
        const name = removeSpecialCharacters(cells[0].textContent || '');
        const type = parseType(cells[1].textContent || '');
        const required = isResponse ? false : cells[2].textContent === '是';
        const description = isResponse ? cells[2].textContent || '' : cells[3].textContent || '';
        childParams.push({
            name,
            type,
            required,
            description,
            example: '',
        } as RequestTypes.IParam);
    }
    return childParams;
}

function buildModels(
    className: string,
    parentModelType: ModelTypes,
    elementID: string,
    isResponse = false,
): RequestTypes.RequestModel[] {
    const childParams = parseParams(elementID, isResponse) || [];
    return [
        {
            className,
            parentModelType,
            childParams,
        } as RequestTypes.RequestModel,
    ];
}

function genModels(methodName: string, product: Product): RequestTypes.RequestData {
    const requestId = PRODUCT_REQUEST_ID_MAP[product];
    const params = buildModels(`${methodName}Param`, ModelTypes.PARAM, requestId.param);
    const responses = buildModels(
        `${methodName}Response`,
        ModelTypes.RESPONSE,
        requestId.response,
        true,
    );
    return {
        methodName,
        params,
        responses,
    } as RequestTypes.RequestData;
}

export function generate(): RequestTypes.RequestData {
    const product = parseProduct();
    if (!product) {
        throw new Error('未找到产品类型');
    }
    const methodName = parseMethodName(product);
    if (!methodName) {
        throw new Error('未找到接口名称');
    }
    return genModels(methodName, product);
}
