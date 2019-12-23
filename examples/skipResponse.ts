import { LMHandler, LMContext, processRequest, BadRequestError } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
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

module.exports = handler;
