import { wrapHandler } from '../helpers';
import { BadRequestError } from '../../src';

const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

const complexResult = wrapHandler('complexResult');
const customValidationError = wrapHandler('customValidationError');
const headers = wrapHandler('headers');
const mergeNothing = wrapHandler('mergeNothing');
const numericInput = wrapHandler('numericInput');
const preprocessor = wrapHandler('preprocessor');
const responseCode = wrapHandler('responseCode');
const skipResponse = wrapHandler('skipResponse');
const simpleResult = wrapHandler('simpleResult');
const throwError = wrapHandler('throwError');
const useParameters = wrapHandler('useParameters');
const warmUp = wrapHandler('warmUp');

const validUserId = '6576BCA5-946B-41AC-AC91-E4096E95E3CD';

describe('Output Handling', () => {
    it('should return literal results directly', () => simpleResult
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
            expect(response.result).to.equal('test');
        }));

    it('should return object results merged', () => complexResult
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
            expect(response.environment).to.equal('test');
        }));

    it('should execute preprocessors properly', () => preprocessor
        .test({ userId: validUserId })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
            expect(response.result.session.valid).to.be.false();
        }));

    it('should handle errors gracefully', () => throwError
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(429);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('ERROR');
            expect(response.code).to.equal('TooManyRequestsError');
            expect(response.error).to.equal('Invalid XYZ.');
        }));

    it('should allow overriding the responseHttpCode', () => responseCode
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(204);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('OK');
        }));

    it('should check for required inputs properly', () => useParameters
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(500);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('ERROR');
            expect(response.error).to.equal('Missing required field "userId"');
        }));

    it('should call validator functions properly', () => useParameters
        .test({ userId: "a" })
        .then((data: any) => {
            expect(data.statusCode).to.equal(500);

            const response = JSON.parse(data.body);
            expect(response.status).to.equal('ERROR');
            expect(response.error).to.equal('Invalid field "userId"');
        }));

    it('should parse string JSON blocks', () => useParameters
        .test(`{ "userId": "${validUserId}" }`)
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.userIdRequested).to.equal(validUserId);
        }));

    it('should parse string bodies', () => useParameters
        .test({ body: `{ "userId": "${validUserId}" }` })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.userIdRequested).to.equal(validUserId);
        }));

    it('should parse query headers', () => headers
        .test({ headers: { Authorization: 'Bearer XYZ' } })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.headers.authorization).to.equal('Bearer XYZ');
        }));

    it('should parse query strings', () => useParameters
        .test({
            queryStringParameters: { userId: validUserId }
        })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.userIdRequested).to.equal(validUserId);
        }));

    it('should parse path parameters', () => useParameters
        .test({
            pathParameters: { userId: validUserId }
        })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.userIdRequested).to.equal(validUserId);
        }));

    it('should tolerate requests to merge results when none are returned', () => mergeNothing
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);
        }));

    it('should handle numeric input checking', () => numericInput
        .test({ num: 1 })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.num).to.equal(1);
        }));

    it('should handle "string" numbers (query/path params)', () => numericInput
        .test({ num: '1' })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.num).to.equal(1);
        }));

    it('should block true strings -> numbers', () => numericInput
        .test({ num: 'a' })
        .then((data: any) => {
            expect(data.statusCode).to.equal(500);

            const response = JSON.parse(data.body);
            expect(response.error).to.equal('Invalid field "num", must be of type "Number"');
        }));

    it('should call validator functions properly', () => useParameters
        .test({
            userId: validUserId,
            fieldWithBogusValidator: 'abc',
        })
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result.userIdRequested).to.equal(validUserId);
        }));

    it('should print custom validation errors', () => customValidationError
        .test({ userId: '1234' })
        .then((data: any) => {
            expect(data.statusCode).to.equal(500);

            const response = JSON.parse(data.body);
            expect(response.error).to.equal('Invalid field "userId": Must be exactly 36 characters.');
        }));

    it('should bypass the handler for warmUp functions', () => warmUp
        .test({ source: 'serverless-plugin-warmup' })
        .then((data: any) => {
            expect(data).to.equal('Lambda is warm!');
        }));

    it('should allow responses to be manually sent', async () => {
        const shouldSucceed = await skipResponse.test({ throwError: false });
        expect(shouldSucceed).to.equal('OK'); // Raw string returned with no other processing

        try {
            await skipResponse.test({ throwError: true });
        } catch (e) {
            expect(e instanceof BadRequestError).to.be.true();
            expect(e.message).to.equal('You asked for it...');
        }
    });

    it('should call validator functions properly', () => warmUp
        .test({})
        .then((data: any) => {
            expect(data.statusCode).to.equal(200);

            const response = JSON.parse(data.body);
            expect(response.result).to.equal(true);
        }));
});
