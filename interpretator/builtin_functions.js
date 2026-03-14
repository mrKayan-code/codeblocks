import { COMPLEX_TYPES, TYPES, typedValue } from "./types.js";

export const BUILTIN_FUNCTIONS = {
    'toInt': typedValue(
        COMPLEX_TYPES.FUNCTION,
        { overloads: [
            {
                signature: { param_types: [TYPES.INT], return_type: TYPES.INT },
                impl: (args, scope) => {
                    return typedValue(TYPES.INT, args[0].value);
                }
            },
            {
                signature: { param_types: [TYPES.FLOAT], return_type: TYPES.INT },
                impl: (args, scope) => {
                    return typedValue(TYPES.INT, Math.floor(args[0].value));
                }
            },
            {
                signature: { param_types: [TYPES.STRING], return_type: TYPES.INT },
                impl: (args, scope) => {
                    const parsed = parseInt(args[0].value);
                    return typedValue(TYPES.INT, isNaN(parsed) ? 0 : parsed);
                }
            },
            {
                signature: { param_types: [TYPES.BOOLEAN], return_type: TYPES.INT },
                impl: (args, scope) => {
                    return typedValue(TYPES.INT, args[0].value ? 1 : 0);
                }
            }
        ] }
    ),
        
    
    'toFloat': typedValue(
        COMPLEX_TYPES.FUNCTION,
        { overloads: [
            {
                signature: { param_types: [TYPES.INT], return_type: TYPES.FLOAT },
                impl: (args, scope) => {
                    return typedValue(TYPES.FLOAT, args[0].value);
                }
            },
            {
                signature: { param_types: [TYPES.FLOAT], return_type: TYPES.FLOAT },
                impl: (args, scope) => {
                    return typedValue(TYPES.FLOAT, args[0].value);
                }
            },
            {
                signature: { param_types: [TYPES.STRING], return_type: TYPES.FLOAT },
                impl: (args, scope) => {
                    const parsed = parseFloat(args[0].value);
                    return typedValue(TYPES.FLOAT, isNaN(parsed) ? 0.0 : parsed);
                }
            },
            {
                signature: { param_types: [TYPES.BOOLEAN], return_type: TYPES.FLOAT },
                impl: (args, scope) => {
                    return typedValue(TYPES.FLOAT, args[0].value ? 1.0 : 0.0);
                }
            }
        ] }
    ),

    'toString': typedValue(
        COMPLEX_TYPES.FUNCTION,
        { overloads: [
            {
                signature: { param_types: [TYPES.ANY], return_type: TYPES.STRING },
                impl: (args, scope) => {
                    if (args[0].value === null || args[0].value === undefined) {
                        return typedValue('', TYPES.STRING);
                    }
                    return typedValue(TYPES.STRING, String(args[0].value));
                }
            }
        ] }
    ),
    
    'toBool': typedValue(
        COMPLEX_TYPES.FUNCTION,
        { overloads: [
            {
                signature: { param_types: [TYPES.ANY], return_type: TYPES.BOOLEAN },
                impl: (args) => {
                    const tv = args[0];
                    let result;
                    
                    if (tv.type === TYPES.NULL || tv.value === null || tv.value === undefined) {
                        result = false;
                    } else if (tv.type === TYPES.INT || tv.type === TYPES.INT) {
                        result = tv.value !== 0;
                    } else if (tv.type === TYPES.STRING) {
                        result = tv.value !== '' && tv.value.toLowerCase() !== 'false';
                    } else if (tv.type === TYPES.BOOLEAN) {
                        result = tv.value;
                    } else {
                        result = false;
                    }
                    
                    return typedValue(TYPES.BOOLEAN, result);
                }
            }
        ] }
    ),
    'length': typedValue(
        COMPLEX_TYPES.FUNCTION,
        { overloads: [
            {
                signature: { params: [TYPES.STRING], return: TYPES.INT },
                impl: (args, scope) => {
                    return typedValue(TYPES.INT, args[0].value.length);
                }
            },
            {
                signature: { params: [COMPLEX_TYPES.ARRAY], return: TYPES.INT },
                impl: (args, scope) => {
                    return typedValue(TYPES.INT, args[0].type.size)
                }
            }
        ] }
    )
}