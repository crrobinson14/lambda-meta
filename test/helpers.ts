import { LMHandler } from '../src';
import { Context } from 'aws-lambda';
import { uuid } from 'uuidv4';

export const getContext = (name: string): Context => ({
    getRemainingTimeInMillis: () => 5000,
    functionName: name,
    functionVersion: '1',
    invokedFunctionArn: name,
    memoryLimitInMB: '1024',
    awsRequestId: uuid(),
    logGroupName: name,
    logStreamName: name,
    callbackWaitsForEmptyEventLoop: true,
    done(error?: Error, result?: any) {
    },
    fail(error: Error | string) {
    },
    succeed(messageOrObject: any) {
    },
});

export function wrapHandler(name: string) {
    const handler: LMHandler = require(`../examples/${name}`);

    handler.test = (params: any) => new Promise((resolve, reject) => {
        handler.entry(params || {}, getContext(name), (err: any, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

    return handler;
};
