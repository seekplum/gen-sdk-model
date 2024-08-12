import { Platform } from '@/constants';
import { parsePlatform } from '@/utils/utils';

function checkRequestRequired(platform: Platform, method: string, url: string): boolean {
    return (
        platform === Platform.DOUDIAN &&
        method === 'GET' &&
        url.includes('/doc/external/open/queryDocArticleDetail')
    );
}

export function getRequestPlatform(host: string, method: string, url: string): Platform | null {
    const platform = parsePlatform(host);
    if (!platform) {
        return null;
    }
    if (checkRequestRequired(platform, method, url)) {
        return platform;
    }
    return null;
}
