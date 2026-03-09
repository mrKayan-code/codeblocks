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

export function typeMatch(expected, actual) {
    if (expected === TYPES.ANY) return true;
    
    if (expected === TYPES.NUMBER && (actual === TYPES.INT || actual === TYPES.FLOAT)) {
        return true;
    }
    if (expected === TYPES.FLOAT && actual === TYPES.INT) {
        return true; //TODO(переделать на что то адекватное либо так оставить. пока это единственное из типов, что можно )
    }
    
    return expected === actual;
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
            return makeArrayType(TYPES.ANY);
        }
        
        const first_el_type = getTypeOf(value[0]);

        if (value.every(item => typeMatch(first_el_type, getTypeOf(item)))) {
            return makeArrayType(first_el_type); //TODO(проблема с массивом флоатов: если первый не число.(не ноль) или просто число без точки, а остальные флоаты, он определяет массив как any, нужен костыль сюда)
        }

        return makeArrayType(TYPES.ANY);

    }

    if (typeof value === 'object') {
        return value.type;
        
    }

    return TYPES.UNKNOWN;
}

export function typedValue(value, type) {
    return {
        type: type !== null ? type : getTypeOf(value),
        value: value
    };
}

export function isArrayType(type) {
    if (!type) {
        return false;
    }

    return type.startsWith(TYPES.ARRAY + '<');
}

export function getInfoOfArrayType(type) {
    const match = type.match(/array<([^,]+),\s*([^>]+)>/);
    if (!match) {
        return null;
    }

    return {
        element_type:  match[1].trim(),
        size: match[2].trim()
    }
}

export function makeArrayType(el_type, size) {
    return `${TYPES.ARRAY}<${el_type}, ${size}>`;
}

export function stringifyTypedValue(typed_value) {
    
    if(isArrayType(typed_value.type)) {
        let result = '';
        result += '['


        if (typed_value.value.length > 0) {

            result += stringifyTypedValue(typed_value.value[0]);

            for (let i = 1; i < typed_value.value.length; i++) {
                result += ', ' +  stringifyTypedValue(typed_value.value[i]);                
            }
        }
        result += ']'

        return result;
    }
    return typed_value.value;
}