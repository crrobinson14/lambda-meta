import * as path from 'path';
import * as glob from 'glob';
import { Handler } from '..';

/**
 * Enumerate the functions defined in a given subdirectory and returned a formatted dictionary of metadata for the
 * functions found. The format returned is suitable for exporting from a `serverless.js` file, but may be useful
 * for other operations (e.g. documentation generation) as well.
 */
export function enumerateHandlers(subdir: string) {
    const functions: Record<string, any> = {};

    glob
        .sync(path.join(process.cwd(), subdir), { nodir: true })
        .map(file => {
            const handler: Handler = require(file);

            console.log('handler', handler);

            functions[handler.name || ''] = {
                // In serverless.com definitions, the "handler" is the entry file with the function name as the suffix.
                // So "myfile.entry" would mean "const handler = require(myfile); handler.entry(...);"
                handler: path.relative('.', file).replace('.js', '.entry').replace('.ts', '.entry'),
                events: handler.events || [],
                ...(handler.timeout ? { timeout: handler.timeout } : {}),
                ...(handler.memorySize ? { memorySize: handler.memorySize } : {}),
                ...(handler.warmup ? { warmup: handler.warmup } : {}),
            };
        });

    return functions;
}
