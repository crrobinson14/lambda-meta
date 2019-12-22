import { Handler, MetaContext } from '../src';

const handler: Handler = {
    name: 'preprocessor',
    description: 'Example preprocessor usage.',
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

    // Since we're async, we could do things like load a user's session record from a DB/cache.
    async preprocess(event: any, context: MetaContext) {
        context.session = {
            valid: false
        };
    },

    async process(event: any, context: MetaContext) {
        // Note that we can rely on context.params being defined and being an object. And context.params.userId will
        // be defined and be a string.
        if (process.env.NODE_ENV !== 'test') {
            console.log('Got a request for user ' + context.params.userId, event);
        }

        // The return result from our handler will be the result passed back to the caller.
        return { userIdRequested: context.params.userId };
    }
};

module.exports = handler;
