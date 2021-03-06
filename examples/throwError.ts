import { LMHandler, LMContext, processRequest, TooManyRequestsError } from '../src';

/**
 * Illustrates how to throw a custom error. Lambda Meta provides headers for common API situations that pre-set
 * response error codes for you, e.g. NotFoundError sets statusCode to 404. You do not need to use these - they
 * are just a convenience.
 */

export const handler: LMHandler = {
    async process(event: any, context: LMContext) {
        throw new TooManyRequestsError('Invalid XYZ.');
    },
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
