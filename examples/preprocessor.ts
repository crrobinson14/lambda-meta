import { LMHandler, LMContext, processRequest } from '../src';

/**
 * This function includes a preprocessor. In this case the code is synchronous, but async operation is supported, making
 * preprocessors an easy way to implement authentication, quota, and other checks.
 *
 * For a session handler, a common pattern would be to define that as a function in a lib shared by all functions, then
 * import it into each one and just set `preprocess: requireValidUser` or similar.
 *
 * Note the reference to context. Context is shared by both preprocessor and processor, and has an option-ended type
 * definition that allows new data to be added to it. It's a convenient place to store information meant to be passed
 * from the preprocessor to the processor.
 *
 * If the preprocessor throws, processing will stop (process will not be called). This is again a convenience for
 * authentication middleware. If authentication is required and not provided, just throw an error in preprocess. You do
 * not need to check "is session is valid?" in the process function itself - execution won't arrive there unless it is.
 */

export const handler: LMHandler = {
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
    async preprocess(event: any, context: LMContext) {
        context.session = {
            valid: false
        };
    },

    async process(event: any, context: LMContext) {
        // Note that we can rely on context.params being defined and being an object. And context.params.userId will
        // be defined and be a string.
        if (process.env.NODE_ENV !== 'test') {
            console.log('Got a request for user ' + context.params.userId, event);
        }

        // The return result from our handler will be the result passed back to the caller.
        return { userIdRequested: context.params.userId, session: context.session };
    }
};

export const entry = (event: any, context: any, callback: any) => processRequest(handler, event, context, callback);
