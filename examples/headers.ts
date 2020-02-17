import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Ilustrates processing of incoming headers, made available on context.headers. These are particularly useful in
 * authentication preprocessors.
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(handler, event, context, callback),
    name: 'headers',
    description: 'Sample method that echoes back headers.',

    async process(event: any, context: LMContext) {
        return {
            headers: context.headers,
        };
    }
};

export default handler;
