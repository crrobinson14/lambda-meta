import { LMHandler, LMContext, processRequest } from '../src';

/**
 * This is not a useful example of anything. It's only here to support the test suite. Here we are asking Lambda Meta
 * to merge our results into the main response body, but not actually providing a result to do that with. This should
 * be tolerated.
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(handler, event, context, callback),
    name: 'mergeNothing',
    mergeResult: true,

    async process(event: any, context: LMContext) {
        // Returning nothing here to ensure mergeResult doesn't break on that condition
    },
};

export default handler;
