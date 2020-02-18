const child_process = require('child_process');

const chai = require('chai');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

// Rewritten in JS to emulate how current Serverless process need to run.
//
// Original / desired pattern to be reinstated once Serverless supports .ts config files
// import { enumerateHandlers } from '../../src';
//
// const chai = require('chai');
// const dirtyChai = require('dirty-chai');
//
// chai.use(dirtyChai);
// const expect = chai.expect;
//
// describe('Function Enumeration', () => {
//     it('should properly enumerate functions', () => {
//         const functions = enumerateHandlers('examples/*.@(js|ts)');
//
//         expect(functions.simpleResult.events[0].http.path).to.equal('simple-result');
//         expect(functions.simpleResult.events[0].http.method).to.equal('get');
//
//         expect(functions.schedule.events[0].schedule).to.equal('cron(*/5 * * * ? *)');
//
//         expect(functions.customOptions.memorySize).to.equal(256);
//         expect(functions.customOptions.timeout).to.equal(30);
//
//         expect(functions.es5Example.name).to.equal('es5Example');
//     });
// });

describe('Function Enumeration', () => {
    it('should properly enumerate functions', done => {
        const command = 'npx ts-node ./scripts/preprocess.ts "./examples/*" "test-prefix-"';
        child_process.exec(command, { cwd: process.cwd() }, (error, stdout) => {
            if (error) {
                done(error);
                return;
            }

            const functions = JSON.parse(stdout);

            expect(functions['test-prefix-simpleResult'].events[0].http.path).to.equal('simple-result');
            expect(functions['test-prefix-simpleResult'].events[0].http.method).to.equal('get');

            expect(functions['test-prefix-schedule'].events[0].schedule).to.equal('cron(*/5 * * * ? *)');

            expect(functions['test-prefix-customOptions'].memorySize).to.equal(256);
            expect(functions['test-prefix-customOptions'].timeout).to.equal(30);

            expect(functions['test-prefix-es5Example'].name).to.equal('es5Example');

            done();
        });
    });
});
