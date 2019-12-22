import { Handler, MetaContext } from '../src';

const handler: Handler = {
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

    async process(event: any, context: MetaContext) {
        return {
            environment: process.env.NODE_ENV || 'development',
        };
    }
};

module.exports = handler;
