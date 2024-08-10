export interface IExtensionConfig {
    isExpanded: boolean;

    needRemoved: boolean;
    needDeprecated: boolean;
    needExample: boolean;
    needDescription: boolean;

    language: string;
    partyName: string;

    childBaseType: string;
    paramBaseType: string;
    responseBaseType: string;
    requestBaseType: string;
}
