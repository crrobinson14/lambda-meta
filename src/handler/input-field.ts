export type ValidationCallback = (param: any, allParams: Record<string, any>) => Promise<any> | any;

export interface InputField {
    type?: string;
    description?: string;
    required?: boolean;
    validate?: ValidationCallback;
}
