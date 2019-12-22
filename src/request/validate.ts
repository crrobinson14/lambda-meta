import { typeCheck as TypeCheck } from 'type-check';
import { LMHandler, InputField, ValidationCallback, LMContext, logInfo } from '..';

export async function validateParameters(handler: LMHandler, event: any, context: LMContext): Promise<boolean> {
    logInfo('Validating parameters');

    const { inputs } = handler;
    if (!inputs) {
        logInfo('No inputs defined, skipping parameter validation');
        return true;
    }

    // First, filter the incoming parameters to just those we desire. We do this early because we pass the
    // entire parameter list to validator functions in case a validator needs to operate on more than one parameter.
    // (e.g. by conditionally requiring parameter B if A is set to a certain value.)
    const allParams = Object.keys(inputs).reduce((obj: Record<string, any>, key) => {
        if (context.params && context.params.hasOwnProperty(key)) {
            obj[key] = context.params[key];
        }
        return obj;
    }, {});

    const promises = Object.entries(inputs || {})
        .map(async ([fieldName, input]: [string, InputField]) => {
            let param = allParams[fieldName];

            // Shortcut further evaluations if the parameter is not present
            if (param === undefined) {
                if (input.required) {
                    throw new Error(`Missing required field "${fieldName}"`);
                }

                return true;
            }

            // In Lambda, URL parameters always arrive as strings regardless of their original type. If the handler
            // expects a number, we do our best to convert it here. Note the deliberate '==' equality is used to
            // check if '10' is the same as 10.
            // tslint:disable-next-line:triple-equals
            if (input.type === 'Number' && !isNaN(param) && parseInt(param, 10) == param) {
                param = parseInt(param, 10);
                allParams[fieldName] = param;
            }

            // If the field type is specified, check for it
            if (input.type && !TypeCheck(input.type, param)) {
                throw new Error(`Invalid field "${fieldName}", must be of type "${input.type}"`);
            }

            // If a validator is specified, call it to check the param
            const validate: ValidationCallback | undefined = input.validate;
            if (validate !== undefined) {
                const validationResult = await validate(param, allParams);
                if (validationResult === true) {
                    return true;
                }

                if (validationResult === false) {
                    throw new Error(`Invalid field "${fieldName}"`);
                }

                throw new Error(`Invalid field "${fieldName}": ` + validationResult.toString());
            }

            return true;
        });

    // noinspection JSDeprecatedSymbols
    const ignoredResult = await Promise.all(promises);

    logInfo('Validated parameters', allParams);
    context.params = allParams;

    return true;
}
