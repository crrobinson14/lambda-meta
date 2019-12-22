/* istanbul ignore file */

const nullLogger = () => ({});
const consoleInfo = (msg: any, ...rest: any[]) => console.log(`[LM] ${msg}`, rest);
const consoleError = (msg: any, ...rest: any[]) => console.error(`[LM] ${msg}`, rest);

export const logInfo = process.env.NODE_ENV === 'test'
    ? nullLogger
    : consoleInfo;

export const logError = process.env.NODE_ENV === 'test'
    ? nullLogger
    : consoleError;
