const wrapper = require('lambda-wrapper');
const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

const wrapHandler = name => wrapper.wrap(require('../examples/' + name), { handler: 'entry' });
const noName = wrapHandler('noName');
const simpleResult = wrapHandler('simpleResult');
const complexResult = wrapHandler('complexResult');
const preprocessor = wrapHandler('preprocessor');
const useParameters = wrapHandler('useParameters');
const throwError = wrapHandler('throwError');

describe('Output Handling', () => {
    it('should tolerate functions with no names', () => noName.run({}).then(data => {
        expect(data.statusCode).to.equal(200);
    }));

    it('should return literal results directly', () => simpleResult.run({}).then(data => {
        expect(data.statusCode).to.equal(200);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('OK');
        expect(response.result).to.equal('test');
    }));

    it('should return object results merged', () => complexResult.run({}).then(data => {
        expect(data.statusCode).to.equal(200);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('OK');
        expect(response.environment).to.equal('test');
    }));

    it('should execute preprocessors properly', () => preprocessor.run({}).then(data => {
        expect(data.statusCode).to.equal(200);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('OK');
        expect(response.session.valid).to.be.false();
    }));

    it('should handle errors gracefully', () => throwError.run({}).then(data => {
        expect(data.statusCode).to.equal(500);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('ERROR');
        expect(response.error).to.equal('Invalid XYZ.');
    }));

    it('should check for required inputs properly', () => useParameters.run({}).then(data => {
        expect(data.statusCode).to.equal(500);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('ERROR');
        expect(response.error).to.equal('Missing required field userId');
    }));

    it('should check for required inputs properly', () => useParameters.run({ userId: 1 }).then(data => {
        expect(data.statusCode).to.equal(500);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('ERROR');
        expect(response.error).to.equal('Invalid "userId", must be of type "String"');
    }));

    it('should call validator functions properly', () => useParameters.run({ userId: "a" }).then(data => {
        expect(data.statusCode).to.equal(500);

        const response = JSON.parse(data.body);
        expect(response.status).to.equal('ERROR');
        expect(response.error).to.equal('Invalid userId');
    }));

    it('should call validator functions properly', () => useParameters.run({
        userId: "6576BCA5-946B-41AC-AC91-E4096E95E3CD",
        fieldWithBogusValidator: 'abc',
    }).then(data => {
        expect(data.statusCode).to.equal(200);
    }));
});
