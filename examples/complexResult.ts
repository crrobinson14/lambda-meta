import { LMHandler, LMContext, processRequest } from '../src';

/**
 * This example illustrates returning a more complex result than `simpleResult`, an object. We also set `mergeResult`
 * to true. This means instead of response.result.environment we will see response.environment returned.
 */

export const handler: LMHandler = {
    mergeResult: true,

    async process(event: any, context: LMContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
        };
    }
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
