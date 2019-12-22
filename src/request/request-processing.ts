import { uuid } from 'uuidv4';
import { LMHandler, LMContext, logInfo, validateParameters, respondWithError, respondWithSuccess } from '..';

/** Any call my include a query string with decoded parameters */
export async function parseQueryString(context: LMContext, event: any) {
    if (event.queryStringParameters !== undefined) {
        Object.assign(context.params, event.queryStringParameters);
    }

    return true;
}

/** Any call may include positional path parameters in the URI */
export async function parsePath(context: LMContext, event: any) {
    if (event.pathParameters !== undefined) {
        Object.assign(context.params, event.pathParameters);
    }

    return true;
}

/** POST calls (may) get a body with decoded parameters */
export async function parseBody(context: LMContext, event: any) {
    if (typeof event.body === 'string' && event.body[0] === '{') {
        try {
            Object.assign(context.params, JSON.parse(event.body));
        } catch (e) {
            // NOP
        }
    }

    return true;
}

/** Any call may include custom headers. Note that we lowercase the keys so developers don't need to worry about it. */
export async function parseHeaders(context: LMContext, event: any) {
    if (event.headers !== undefined) {
        context.headers = {};
        Object.entries(event.headers).forEach(([key, value]: [string, any]) => {
            context.headers[key.toLowerCase()] = value;
        });
    }

    return true;
}

// HTTP calls (may) get a query string with decoded parameters
export async function parseRawEvent(context: LMContext, event: any) {
    // Direct calls include the params in the "event" as a string
    if (typeof event === 'object' && event.queryStringParameters === undefined && event.pathParameters === undefined) {
        Object.assign(context.params, event);
    }

    // Data can also arrive as a string in some circumstances, but it may be a JSON string. Decode if we can.
    if (typeof event === 'string' && event[0] === '{') {
        try {
            Object.assign(context.params, JSON.parse(event));
        } catch (e) {
            // NOP
        }
    }

    return true;
}

/**
 * Set up event handlers for commonly used patterns:
 *   1. Turning off wait-for-empty-loop,
 *   2. Parse query string and body parameters in order of GET -> POST -> POST (multipart).
 *   3. Log an entry with some helpful tracing metadata (e.g. the request ID)
 */
export async function parseParameters(handler: LMHandler, event: any, context: LMContext) {
    context.params = {};
    context.headers = {};

    await parseHeaders(context, event);
    await parseRawEvent(context, event);
    await parsePath(context, event);
    await parseQueryString(context, event);
    await parseBody(context, event);

    return true;
}

/** Wrapper for processing requests. */
export async function processRequest(handler: LMHandler, event: any, inputContext: LMContext | any, callback: Function) {
    let context = inputContext;
    context.callbackWaitsForEmptyEventLoop = false;

    /* istanbul ignore next */
    if (Object.prototype.toString.call(context) !== '[object Object]') {
        /** This can happen if we directly invoke the function via certain methods */
        context = {
            params: {},
            headers: {},
        };
    }

    /* istanbul ignore next */
    if (!context.awsRequestId) {
        context.awsRequestId = uuid();
    }

    logInfo(`${(handler.name || 'Unknown')}(): Processing request ${context.awsRequestId || ''}`);

    // @see https://github.com/FidelLimited/serverless-plugin-warmup
    if (event.source === 'serverless-plugin-warmup') {
        logInfo('WarmUP Plugin - Lambda is warm!');

        if (callback) {
            return callback(null, 'Lambda is warm!');
        } else {
            // We should always have a callback because "warmup" calls don't have manual handlers, so they bypass
            // that logic. This is just in case the developer calls us directly for some reason.
            return null;
        }
    }

    try {
        await parseParameters(handler, event, context);
        await validateParameters(handler, event, context);

        if (handler.preprocess) {
            await handler.preprocess(event, context);
        }

        const result = await handler.process(event, context, callback);
        if (!handler.skipResponse) {
            respondWithSuccess(handler, result, callback);
        }
    } catch (e) {
        if (!handler.skipResponse) {
            respondWithError(handler, e, callback);
        }
    }
}
