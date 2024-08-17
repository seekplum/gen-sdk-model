import * as CryptoJS from 'crypto-js';

import { Platform } from '@/constants';

export function snake2pascal(name: string): string {
    const camelCase = name.replace(/[./_]([a-z])/g, (_, char) => char.toUpperCase());
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
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
    return pathname.charAt(0).toLowerCase() + pathname.slice(1);
}

export function pathname2requestName(pathname: string): string {
    return pathname.split('/').join('.');
}

export function parseArrayName(name: string): string {
    if (name === 'List') {
        return name;
    }
    if (name.includes('List') || name.toLowerCase().includes('array')) {
        const match = name.match(/List<(.+)>|[Aa]rray<(.+)>/);
        if (match) {
            return match[1];
        }
    }
    return name.replace(/[<>[\]]/g, '');
}

export function parseObjectName(name: string): string {
    const values = name.split('.');
    return values[values.length - 1];
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
    return value.replace(/[\n\r"\\]/g, '');
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
