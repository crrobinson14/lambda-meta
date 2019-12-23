import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates some more options for input parameters and validation.
 */

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'useParameters',
    description: 'Sample method that requires a parameter, with input validation.',
    inputs: {
        userId: {
            required: true,
            type: 'String',
            description: 'String user ID to retrieve.',
            validate: (userId: string) => userId.length === 36
        },
        optionalField: {
            description: 'Optional field with no validation.',
        },
    },

    async process(event: any, context: LMContext) {
        // Note that we can rely on context.params being defined and being an object. And context.params.userId will
        // be defined and be a string.
        if (process.env.NODE_ENV !== 'test') {
            console.log('Got a request for user ' + context.params.userId, event);
        }

        // The return result from our handler will be the result passed back to the caller.
        return { userIdRequested: context.params.userId };
    },
};

module.exports = handler;
