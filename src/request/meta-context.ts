import { Context } from 'aws-lambda';

export interface MetaContext extends Context {
    params: Record<string, any>;
    headers: Record<string, string>;
    [fieldName: string]: any;
}
