import { LMHandler, LMContext, processRequest, TooManyRequestsError } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'throwError',
    description: 'Illustrates error handling.',

    async process(event: any, context: LMContext) {
        throw new TooManyRequestsError('Invalid XYZ.');
    },
};

module.exports = handler;
