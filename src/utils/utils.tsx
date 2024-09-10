import * as CryptoJS from 'crypto-js';

import { Platform } from '@/constants';

export function toFirstUpperCase(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function toFirstLowerCase(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1);
}

export function snake2pascal(name: string): string {
    const camelCase = name.replace(/[./_]([A-Za-z])/g, (_, char) => char.toUpperCase());
    return toFirstUpperCase(camelCase);
}

export function pascal2snake(name: string): string {
    let snake = name.replace(/([A-Z]+)([A-Z][a-z])/g, (_, p1, p2) => `${p1}_${p2}`);
    snake = snake.replace(/([a-z])([A-Z])/g, (_, p1, p2) => `${p1}_${p2}`);
    snake = snake.replace(/(\d)([A-Z])/g, (_, p1, p2) => `${p1}_${p2}`);
    // snake = snake.replace(/([a-z])(\d)/g, (_, p1, p2) => `${p1}_${p2}`);
    return snake.toLowerCase();
}

export function pascal2pathname(name: string): string {
    const pathname = name.replace(/(\/[A-Za-z]|[a-z][A-Z])/g, (_, char) => {
        const first = char.charAt(0);
        const second = char.charAt(1).toLowerCase();
        if (first === '/') {
            return `.${second}`;
        }
        return `${first}.${second}`;
    });
    return toFirstLowerCase(pathname);
}

export function pathname2requestName(pathname: string): string {
    return pathname
        .split('/')
        .filter((v) => !!v)
        .join('.');
}

export function parseArrayName(name: string): string {
    const tmpName = parseObjectName(name);
    if (tmpName.toLowerCase() === 'list') {
        return tmpName;
    }
    if (name.toLowerCase().includes('list') || name.toLowerCase().includes('array')) {
        const match = name.match(/[Ll]ist<(.+)>|[Aa]rray<(.+)>/);
        if (match) {
            return match[1];
        }
    }
    return name.replace(/[<>[\]]/g, '');
}

export function parseObjectName(name: string): string {
    const values = name.split('.');
    let tmpName = values[values.length - 1];
    const match = tmpName.match(/(\w+)$/);
    if (match) {
        tmpName = match[1];
    }
    return snake2pascal(tmpName);
}

export function parsePlatform(host: string): Platform | null {
    switch (host) {
        case 'op.jinritemai.com':
            return Platform.DOUDIAN;
        case 'developers.weixin.qq.com':
            return Platform.WEIXIN;
        case 'opendocs.alipay.com':
        case 'ideservice.alipay.com':
            return Platform.ALIPAY;
        case 'open.1688.com':
            return Platform.ALIBABA;
        case 'open.kwaixiaodian.com':
            return Platform.KUAISHOU;
        case 'open.taobao.com':
            return Platform.TAOBAO;
        default:
            return null;
    }
}

export function removeSpecialCharacters(value: string): string {
    return value.replace(/[\n\r"\\]/g, '').trim();
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildParentPathName(name: string, ...args: string[]): string {
    const parentPathName = args.join('#');
    return `${parentPathName}@${name}`;
}

export function parseParentPathName(name: string): string {
    const values = name.split('@');
    return values[values.length - 1];
}

export function encrypt(data: string): string {
    const encrypted = CryptoJS.MD5(data);
    return encrypted.toString();
}
