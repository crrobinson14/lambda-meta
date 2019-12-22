import { LMHandler, logInfo, logError, OkResponse, ErrorResponse } from '..';

export class AnnotatedError extends Error {
    responseHttpCode = 500;
}

export class AnnotatedResult {
    responseHttpCode = 200;
    [key: string]: any;
}

/** End the request with an error result. */
export function respondWithError(handler: LMHandler, err: any | Error, callback: Function) {
    logError(err);

    const response: ErrorResponse = {
        status: 'ERROR',
        code: err.name,
        error: err.message,
    };

    const statusCode = err.responseHttpCode || 500;

    callback(null, {
        statusCode,
        isBase64Encoded: false,
        headers: { ...(handler.responseHeaders || {}) },
        body: JSON.stringify(response),
    });
}

/** End the request with a success result. */
export function respondWithSuccess(handler: LMHandler, result: any, callback: Function) {
    logInfo('Success!', result);

    const response: OkResponse = {
        status: 'OK',
    };

    if (handler.mergeResult) {
        Object.assign(response, result || {});
    } else {
        response.result = result;
    }

    const statusCode = result.responseHttpCode || 200;
    delete result.responseHttpCode;

    callback(null, {
        statusCode,
        isBase64Encoded: false,
        headers: { ...(handler.responseHeaders || {}) },
        body: JSON.stringify(response),
    });
}
