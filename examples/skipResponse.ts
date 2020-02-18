import { LMHandler, LMContext, processRequest, BadRequestError } from '../src';

/**
 * Sometimes a module may need to bypass Lambda Meta's "smart" response processing, e.g. if the caller cannot handle
 * JSON output. This can also be useful in some CDN and domain ownership checks where you are expected to return a
 * simple string from a call.
 *
 * Note that this function is more complex than it needs to be as a usage example. It's serving dual-purpose here to
 * show how to throw a custom error via the same path.
 */

export const handler: LMHandler = {
    name: 'skipResponse',
    skipResponse: true,
    inputs: {
        throwError: {
            description: 'If set to true, call will throw an error. Otherwise "OK" is returned as a raw string.',
            type: 'Boolean',
            required: true,
        }
    },

    async process(event: any, context: LMContext, callback: Function) {
        if (context.params.throwError) {
            callback(new BadRequestError('You asked for it...'), null);
        } else {
            callback(null, 'OK');
        }
    },
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
