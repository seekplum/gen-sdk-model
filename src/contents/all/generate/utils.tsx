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
            return requestConfig.paramBaseType;
        case ModelTypes.RESPONSE:
            return requestConfig.responseBaseType;
        case ModelTypes.REQUEST:
            return requestConfig.requestBaseType;
        case ModelTypes.CHILD:
            return requestConfig.childBaseType;
        default:
            throw new Error(
                `Unsupported parent model type: ${modelType} for platform: ${platform}`,
            );
    }
}
