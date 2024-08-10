import { Platform } from '@/constants';

function getPlatform(host: string): Platform | null {
    switch (host) {
        case 'op.jinritemai.com':
            return Platform.DOUDIAN;
        default:
            return null;
    }
}

function checkRequestRequired(platform: Platform, method: string, url: string): boolean {
    return (
        platform === Platform.DOUDIAN &&
        method === 'GET' &&
        url.includes('/doc/external/open/queryDocArticleDetail')
    );
}

export function getRequestPlatform(host: string, method: string, url: string): Platform | null {
    const platform = getPlatform(host);
    if (!platform) {
        return null;
    }
    if (checkRequestRequired(platform, method, url)) {
        return platform;
    }
    return null;
}
