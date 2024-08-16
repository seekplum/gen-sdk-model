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
    return pathname.replaceAll('/', '.');
}

export function parseArrayName(name: string): string {
    return name.replace(/List|[<>[\]]/g, '');
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
