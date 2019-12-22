import { LMHandler, LMContext, processRequest } from '../src';

const handler: LMHandler = {
    entry: (event, context, callback) => processRequest(module.exports, event, context, callback),
    name: 'customValidationError',
    description: 'Input validation with custom error messages.',
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

module.exports = handler;
