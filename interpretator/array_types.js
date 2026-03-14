import { COMPLEX_TYPES, isComplexType } from "./types.js";


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

export function createArrayType(element_type, size) {
    return {
        complex_type: COMPLEX_TYPES.ARRAY,
        element_type: element_type,
        size: size
    };
}