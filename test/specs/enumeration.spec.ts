import { enumerateHandlers } from '../../src';

const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

describe('Function Enumeration', () => {
    it('should properly enumerate functions', () => {
        const functions = enumerateHandlers('examples/*.ts');

        expect(functions.simpleResult.events[0].http.path).to.equal('simple-result');
        expect(functions.simpleResult.events[0].http.method).to.equal('get');

        expect(functions.schedule.events[0].schedule).to.equal('cron(*/5 * * * ? *)');

        expect(functions.customOptions.memorySize).to.equal(256);
        expect(functions.customOptions.timeout).to.equal(30);
    });
});
