export const TYPES = {
    INT: 'int',
    FLOAT: 'float',
    STRING: 'string',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    ANY: 'any',
    NULL: 'null',
    UNKNOWN: 'unknown',
    NUMBER: 'number'
};

export const COMPLEX_TYPES = {
    ARRAY: 'array'
}

export function isComplexType(type) {
    return type && typeof type === 'object' && 'complex_type' in type;
}


export function typeMatch(expected, actual) {
    if (!isComplexType(expected)) {
        if (expected === TYPES.ANY) return true;
        
        if (expected === TYPES.NUMBER && (actual === TYPES.INT || actual === TYPES.FLOAT)) {
            return true;
        }
        if (expected === TYPES.FLOAT && actual === TYPES.INT) {
            return true; //TODO(переделать на что то адекватное либо так оставить. пока это единственное из типов, что можно )
        }

        return expected === actual;
    } else if (isComplexType(actual)) {
        if (expected.complex_type !== actual.complex_type) {
            return false;
        }

        if (expected.complex_type === COMPLEX_TYPES.ARRAY) {
            if (!typeMatch(expected.element_type, actual.element_type)) {
                return false;
            }
            if (expected.size != actual.size) {
                return false;
            }
            return true;
        }
    }

    return false;    
}

export function getTypeOf(value) {
    if (value === null) {
        return TYPES.NULL;
    }
    
    if (typeof value === 'number') {
        return Number.isInteger(value) ? TYPES.INT : TYPES.FLOAT;
    }

    if (typeof value === 'string') { 
        return TYPES.STRING;
    }

    if (typeof value === 'boolean') { 
        return TYPES.BOOLEAN;
    }

    if(Array.isArray(value)) {
        if (value.length === 0) {
            return makeArrayType(TYPES.ANY, 0);
        }
        
        let common_type = getTypeOf(value[0]);

        for(let i = 1; i < value.length; i++) {
            common_type = propagateType(common_type, getTypeOf(value[i]));
            if (common_type === TYPES.ANY) {
                break;
            }
        }

        // if (value.every(item => typeMatch(first_el_type, getTypeOf(item)))) {
        //     return makeArrayType(first_el_type, value.length); //TODO(проблема с массивом флоатов: если первый не число.(не ноль) или просто число без точки, а остальные флоаты, он определяет массив как any, нужен костыль сюда)
        // }

        return makeArrayType(common_type, value.length);

    }

    if (typeof value === 'object' && 'type' in value) {
        return value.type;
        
    }

    return TYPES.UNKNOWN;
}

export function typedValue(type, value) {
    return {
        type: type !== null ? type : getTypeOf(value),
        value: value
    };
}

export function isArrayType(type) {
    if (!type) {
        return false;
    }
    
    if (!isComplexType) {
        return false; 
    }

    return type.complex_type === COMPLEX_TYPES.ARRAY;
}

export function getInfoOfArrayType(type) {
    if (!isArrayType(type)) {
        return null;
    }
    
    return {
        element_type: type.element_type,
        size: type.size
    };
}



export function makeArrayType(element_type, size) {
    return {
        complex_type: COMPLEX_TYPES.ARRAY,
        element_type: element_type,
        size: size
    };
}



export function propagateType(type_a, type_b) {
    if (type_a === type_b) return type_a;
    
    if (type_a === TYPES.ANY || type_b === TYPES.ANY) return TYPES.ANY;
    
    if ((type_a === TYPES.INT && type_b === TYPES.FLOAT) || (type_a === TYPES.FLOAT && type_b === TYPES.INT)) {
        return TYPES.FLOAT;
    }
    
    return TYPES.ANY;
}

export function stringifyTypedValue(typed_value) {
    
    if(isArrayType(typed_value.type)) {
        let result = '';
        result += '['


        if (typed_value.type.size > 0) {

            result += stringifyTypedValue(typed_value.value[0]);

            for (let i = 1; i < typed_value.type.size; i++) {
                result += ', ' +  stringifyTypedValue(typed_value.value[i]);                
            }
        }
        result += ']'

        return result;
    }
    return typed_value.value;
}

export function stringifyType(type) {
    if (isComplexType(type)) {
        return type.complex_type;
    } else {
        return type;
    }
}