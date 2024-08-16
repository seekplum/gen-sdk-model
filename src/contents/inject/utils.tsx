import { Platform } from '@/constants';
import { parsePlatform } from '@/utils/utils';

function checkRequestRequired(platform: Platform, method: string, url: string): boolean {
    if (
        platform === Platform.DOUDIAN &&
        method === 'GET' &&
        url.includes('/doc/external/open/queryDocArticleDetail')
    ) {
        return true;
    }
    if (
        platform === Platform.ALIPAY &&
        method === 'POST' &&
        url.includes('/cms/site/queryCatalogContent.json')
    ) {
        return true;
    }
    if (
        platform === Platform.ALIBABA &&
        method === 'GET' &&
        url.includes('/api/data/getApiDetail.json')
    ) {
        return true;
    }
    if (
        platform === Platform.KUAISHOU &&
        method === 'GET' &&
        url.includes('/rest/open/platform/doc/api/name/detail')
    ) {
        return true;
    }
    return false;
}

export function getTargetOrigin(platform: Platform): string {
    if (platform === Platform.DOUDIAN) {
        return 'https://op.jinritemai.com/docs/api-docs/*/*';
    }
    if (platform === Platform.ALIPAY) {
        return 'https://opendocs.alipay.com/solution/*';
    }
    if (platform === Platform.ALIBABA) {
        return 'https://open.1688.com/api/*';
    }
    if (platform === Platform.KUAISHOU) {
        return 'https://open.kwaixiaodian.com/zone/new/docs/*';
    }
    return '';
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
