import { LMHandler, LMContext, processRequest, TooManyRequestsError } from '../src';

/**
 * Illustrates how to throw a custom error. Lambda Meta provides headers for common API situations that pre-set
 * response error codes for you, e.g. NotFoundError sets statusCode to 404. You do not need to use these - they
 * are just a convenience.
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'throwError',
    description: 'Illustrates error handling.',

    async process(event: any, context: LMContext) {
        throw new TooManyRequestsError('Invalid XYZ.');
    },
};

module.exports = handler;
