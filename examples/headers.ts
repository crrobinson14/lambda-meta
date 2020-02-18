import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Ilustrates processing of incoming headers, made available on context.headers. These are particularly useful in
 * authentication preprocessors.
 */

export const handler: LMHandler = {
    name: 'headers',
    description: 'Sample method that echoes back headers.',

    async process(event: any, context: LMContext) {
        return {
            headers: context.headers,
        };
    }
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
