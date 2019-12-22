import { NodeCallbackAny, Handler, logInfo, logError, OkResponse, ErrorResponse } from '..';

export class AnnotatedError extends Error {
    httpResponseCode = 500;
}

export class AnnotatedResult {
    httpResponseCode = 200;

    [key: string]: any;
}

/** End the request with an error result. */
export function respondWithError(handler: Handler, err: Error | AnnotatedError, callback: NodeCallbackAny) {
    logError(err);

    const response: ErrorResponse = {
        status: 'ERROR',
        error: err.message,
    };

    let statusCode = 500;
    if (err instanceof AnnotatedError) {
        statusCode = err.httpResponseCode || 500;
    }

    callback(null, {
        statusCode,
        isBase64Encoded: false,
        headers: { ...(handler.responseHeaders || {}) },
        body: JSON.stringify(response),
    });
}

/** End the request with a success result. */
export function respondWithSuccess(handler: Handler, result: any | AnnotatedResult, callback: NodeCallbackAny) {
    logInfo('Success!', result);

    let statusCode = 200;
    if (result instanceof AnnotatedResult) {
        statusCode = result.httpResponseCode || 200;
    }

    const response: OkResponse = {
        status: 'OK',
        result,
    };

    callback(null, {
        statusCode,
        isBase64Encoded: false,
        headers: { ...(handler.responseHeaders || {}) },
        body: JSON.stringify(response),
    });
}
