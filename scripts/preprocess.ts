import * as path from 'path';
import * as glob from 'glob';

/**
 * Enumerate the functions defined in a given subdirectory and returned a formatted dictionary of metadata for the
 * functions found. The format returned is suitable for exporting from a `serverless.js` file, but may be useful
 * for other operations (e.g. documentation generation) as well.
 */
export async function processHandlers(subdir: string, prefix: string = '') {
    const functions: any = {};

    const toProcess = glob
        .sync(path.join(process.cwd(), subdir), { nodir: true })
        .map(async file => {
            const handler: any = (await import(file)).default;

            functions[`${prefix}${handler.name || ''}`] = {
                // In serverless.com definitions, the "handler" is the entry file with the function name as the suffix.
                // So "myfile.entry" would mean "const handler = require(myfile); handler.entry(...);"
                handler: path.relative('.', file).replace('.js', '.entry').replace('.ts', '.entry'),
                events: handler.events || [],

                // We do this manually because we don't want to copy all the methods, just those useful for docs
                ...(handler.name ? { name: handler.name } : {}),
                ...(handler.description ? { description: handler.description } : {}),
                ...(handler.inputs ? { inputs: handler.inputs } : {}),
                ...(handler.skipResponse ? { skipResponse: handler.skipResponse } : {}),
                ...(handler.mergeResult ? { mergeResult: handler.mergeResult } : {}),
                ...(handler.responseHeaders ? { responseHeaders: handler.responseHeaders } : {}),
                ...(handler.timeout ? { timeout: handler.timeout } : {}),
                ...(handler.memorySize ? { memorySize: handler.memorySize } : {}),
                ...(handler.warmup ? { warmup: handler.warmup } : {}),
            };
        });

    await Promise.all(toProcess);
    return functions;
}

processHandlers(process.argv[2], process.argv[3])
    .then(handlers => {
        console.log(JSON.stringify(handlers, null, 2));
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(-1);
    });
