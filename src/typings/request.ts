export interface IParam {
    name: string;
    type: string;
    childType?: string;
    description: string;
    example?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    deprecated?: boolean;
    removed?: boolean;
}

export interface RequestParam extends IParam {
    required: boolean;
}

export interface RequestResponse extends IParam {
    tag?: string;
}

export interface RequestModel {
    className: string;
    parentModelType: string;
    childParams: IParam[];
}

export interface RequestData {
    methodName?: string;
    params?: RequestModel[];
    responses?: RequestModel[];
    comments?: string[];
    requestName?: string;
}
