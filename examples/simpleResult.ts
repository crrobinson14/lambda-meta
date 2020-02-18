import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates a simple scalar (string) return result.
 */

export const handler: LMHandler = {
    name: 'simpleResult',
    events: [{
        http: {
            path: 'simple-result',
            method: 'get',
            cors: true,
        }
    }],

    async process(event: any, context: LMContext) {
        return 'test';
    },
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
