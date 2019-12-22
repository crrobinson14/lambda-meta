import { Context } from 'aws-lambda';
import { LMContext, InputField } from '..';

export abstract class LMHandler {
    /** Handler name, passed through to generated documentation */
    name?: string;

    /** Optional handler description, passed through to generated documentation */
    description?: string;

    /** Optional inputs. See [https://www.npmjs.com/package/type-check] for usage examples. */
    inputs?: {
        [fieldName: string]: InputField,
    };

    /** If set to true, "standard" responses will not be emitted. The handler should emit its own. */
    skipResponse?: boolean;

    /** If set to true, the serverless-plugin-warmup option will be emitted to enable warming up this function. */
    warmup?: boolean;

    /** Optional timeout specifically for the function. Overrides the global value. */
    timeout?: number;

    /** Optional memory size specifically for the function. Overrides the global value. */
    memorySize?: number;

    /** Optional schedule to pass through to Serverless. */
    schedule?: any;

    /** Methods for triggering the function */
    events?: any[];

    /** If set to true and an object is returned, its properties will be spread out to the top-level response object. */
    expandResults?: boolean;

    /** Optional custom headers to be added to the response */
    responseHeaders?: {
        [header: string]: string,
    };

    /**
     * Required AWS Lambda entry callback. Should generally not be set by the developer - the RequestHandler decorator
     * sets this automaticlaly.
     */
    entry?: (event: any, context: Context, callback: Function) => any;

    /** Optional pre-processing function for tasks like authentication checks. */
    async preprocess?(event: any, context: LMContext): Promise<any> {
    }

    /**
     * Required processing function. Typically expected to be async and return a value to be passed back to the caller
     * in a standard wrapper. May optionally call callback() to provide its own response if `skipResponse` is set.
     */
    async process(event: any, context: LMContext, callback?: Function): Promise<any> {
        return undefined;
    }

    /** Allow defining additional properties */
    [fieldName: string]: any;
}
