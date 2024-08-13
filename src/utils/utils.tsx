import { Platform } from '@/constants';

export function snake2pascal(name: string): string {
    const camelCase = name.replace(/[./_]([a-z])/g, (_, char) => char.toUpperCase());
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

export function parsePlatform(host: string): Platform | null {
    switch (host) {
        case 'op.jinritemai.com':
            return Platform.DOUDIAN;
        case 'developers.weixin.qq.com':
            return Platform.WEIXIN;
        default:
            return null;
    }
}

export function removeSpecialCharacters(value: string): string {
    return value.replaceAll('\n', '').replaceAll('\\"', '').replaceAll('"', '');
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
