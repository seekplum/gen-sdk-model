export interface IParam {
    type: number;
    example: string;
    description: string;

    requestName?: string;
    responseName?: string;
    mustNeed?: boolean;
    children?: IParam[];
}

export interface RequestParam extends IParam {
    requestName: string;
    mustNeed: boolean;
    deprecated?: boolean;
    removed?: boolean;
    children?: RequestParam[];
}

export interface RequestResponse extends IParam {
    responseName: string;
    tagId?: number;
    children?: RequestResponse[];
}
