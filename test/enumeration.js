const lm = require('../index');
const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

describe('Function Enumeration', () => {
    it('should properly enumerate functions', () => {
        const functions = lm.enumerateFunctions('examples/*.js');
        expect(functions.simpleResult.events[0].http.path).to.equal('simple-result');
        expect(functions.simpleResult.events[0].http.method).to.equal('get');

        expect(functions.throwError.events[0].schedule).to.equal('cron(*/5 * * * ? *)');
        expect(functions.throwError.memorySize).to.equal(256);
        expect(functions.throwError.timeout).to.equal(30);
    });
});
