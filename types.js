export const TYPES = {
    INT: 'int',
    FLOAT: 'float',
    STRING: 'string',
    BOOLEAN: 'boolean',
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

    return TYPES.UNKNOWN;
}

export function typedValue(value, type) {
    return {
        type: type !== null ? type : getTypeOf(value),
        value: value
    };
}