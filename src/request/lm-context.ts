import { Context } from 'aws-lambda';

export interface LMContext extends Context {
    params: Record<string, any>;
    headers: Record<string, string>;
    [fieldName: string]: any;
}
