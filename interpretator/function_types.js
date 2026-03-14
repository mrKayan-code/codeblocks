import { isComplexType, COMPLEX_TYPES, typeMatch } from "./types.js";

export function createFunctionType(/*param_types, return_type*/) {
    return {
        complex_type: COMPLEX_TYPES.FUNCTION
    }
    // return {
    //     complex_type: COMPLEX_TYPES.FUNCTION,
    //     param_types: param_types,
    //     return_type: return_type
    // };
}

export function isFunctionType(type) {
    if (isComplexType(type)) {
        return type.complex_type === COMPLEX_TYPES.FUNCTION;
    } 
    
    return false;
}


export function getCompatibleOverload(overloads, args) {
    if (!overloads || overloads.length === 0) {
        return null;
    }

    for (const overload of overloads) {
        const signature = overload.signature;

        if (signature.param_types.length !== args.length) {
            continue;
        }

        const match = signature.param_types.every((expected_type, idx) => {
            return typeMatch(expected_type, args[idx].type)
        });

        if (match) {
            return overload;
        }
    }

    return null;
}
