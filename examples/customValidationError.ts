import { LMHandler, LMContext, processRequest } from '../src';

/**
 * Illustrates a custom validator that also returns a custom error message. This error will be returned to the caller.
 */

export const handler: LMHandler = {
    inputs: {
        userId: {
            required: true,
            type: 'String',
            description: 'String user ID.',
            validate: (userId: string) => userId.length === 36 || 'Must be exactly 36 characters.',
        },
    },

    async process(event: any, context: LMContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
        };
    }
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
