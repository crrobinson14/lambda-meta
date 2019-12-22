import { LMHandler } from '../../src';
import { uuid } from 'uuidv4';
import { Context } from 'aws-lambda';

const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

const wrapHandler = name => {
    const handler: LMHandler = require(`../../examples/${name}`);

    const context: Context = {
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
    };

    handler.test = params => new Promise((resolve, reject) => {
        handler.entry(params || {}, context, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

    return handler;
};

const numericInput = wrapHandler('numericInput');

describe('Request Handling', () => {
    // Nothing is processed here, we're just verifying that the called function still requires this input. If that
    // ever changed to not be required, all the remaining tests would seem to succeed even if they were wrong.
    it('should fail on missing parameters', () => numericInput
        .test({})
        .then(data => {
            expect(data.statusCode).to.equal(500);
        }));

    it('should parse query string parameters', () => numericInput
        .test({ queryStringParameters: { num: 5 } })
        .then(data => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
        }));

    it('should parse path string parameters', () => numericInput
        .test({ pathParameters: { num: 5 } })
        .then(data => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
        }));

    it('should parse body parameters', () => numericInput
        .test({ body: '{ "num": 5 }' })
        .then(data => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
        }));

    it('should parse raw event parameters', () => numericInput
        .test({ num: 5 })
        .then(data => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
        }));
});
