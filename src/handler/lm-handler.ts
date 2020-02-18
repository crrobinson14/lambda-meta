import { Context } from 'aws-lambda';
import { LMContext, InputField } from '..';

export abstract class LMHandler {
    /** Inputs requiring validation. See [https://www.npmjs.com/package/type-check] for usage examples. */
    inputs?: {
        [fieldName: string]: InputField,
    };

    /** If set to true, "standard" responses will not be emitted. The handler should emit its own. */
    skipResponse?: boolean;

    /** Set to true to Object.assign() result objects to the root of the response object instead of response.result. */
    mergeResult?: boolean;

    /* istanbul ignore next */
    /** Optional pre-processing function for tasks like authentication checks. */
    async preprocess?(event: any, context: LMContext): Promise<any> {
    }

    /* istanbul ignore next */
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
