import { ModelTypes, type Platform } from '@/constants';
import type { IExtensionConfig } from '@/typings';

export function getParentModelName(
    platform: Platform,
    modelType: string,
    config: IExtensionConfig,
): string {
    const requestConfig = config.modelConfig[platform];
    switch (modelType) {
        case ModelTypes.PARAM:
            return requestConfig.param;
        case ModelTypes.RESPONSE:
            return requestConfig.response;
        case ModelTypes.REQUEST:
            return requestConfig.request;
        case ModelTypes.CHILD:
            return requestConfig.child;
        default:
            throw new Error(
                `Unsupported parent model type: ${modelType} for platform: ${platform}`,
            );
    }
}
