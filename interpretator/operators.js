import { TYPES } from "./types.js"

export const BINARY_OPERATORS_SIGNATURES = {
    '||': {
        signatures: [
            { args: [TYPES.BOOLEAN, TYPES.BOOLEAN], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l || r
    },
    
    '&&': {
        signatures: [
            { args: [TYPES.BOOLEAN, TYPES.BOOLEAN], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l && r
    },
    
    '+': {
        signatures: [
            { args: [TYPES.INT, TYPES.INT], result_type: TYPES.INT },
            { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.FLOAT },
            { args: [TYPES.STRING, TYPES.STRING], result_type: TYPES.STRING }
        ],
        impl: (l, r) => l + r
    },
    
    '-': {
        signatures: [
            { args: [TYPES.INT, TYPES.INT], result_type: TYPES.INT },
            { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.FLOAT }
        ],
        impl: (l, r) => l - r
    },

    '*': {
        signatures: [
            { args: [TYPES.INT, TYPES.INT], result_type: TYPES.INT },
            { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.FLOAT }
        ],
        impl: (l, r) => l * r
    },

    '/' : {
         signatures: [
            { args: [TYPES.INT, TYPES.INT], result_type: TYPES.FLOAT },
            { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.FLOAT },
        ],
        impl: (l, r) => {if (r === 0) throw new Error('Division by zero');
                        return l / r}
    },

    '//' : {
         signatures: [
            { args: [TYPES.INT, TYPES.INT], result_type: TYPES.INT },
            { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.INT }
        ],
        impl: (l, r) => {if (r === 0) throw new Error('Division by zero');
                        return Math.floor(l / r)}
    },

    '%' : {
         signatures: [
            { args: [TYPES.INT, TYPES.INT], result_type: TYPES.INT },
            { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.FLOAT }
        ],
        impl: (l, r) => l % r
    },

    
    '==': {
        signatures: [
            { args: [TYPES.ANY, TYPES.ANY], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l == r
    },

    '!=': {
        signatures: [
            { args: [TYPES.ANY, TYPES.ANY], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l != r
    },

    '<': {
        signatures: [
            { args: [TYPES.NUMBER, TYPES.NUMBER], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l < r
    },

    '>': {
        signatures: [
            { args: [TYPES.NUMBER, TYPES.NUMBER], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l > r
    },

    '<=': {
        signatures: [
            { args: [TYPES.NUMBER, TYPES.NUMBER], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l <= r
    },

    '>=': {
        signatures: [
            { args: [TYPES.NUMBER, TYPES.NUMBER], result_type: TYPES.BOOLEAN }
        ],
        impl: (l, r) => l >= r
    }
    
    // '<': {
    //     signatures: [
    //         { args: [TYPES.INT, TYPES.INT], result_type: TYPES.BOOLEAN },
    //         { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.BOOLEAN }
    //     ],
    //     impl: (l, r) => l < r
    // },

    // '>': {
    //     signatures: [
    //         { args: [TYPES.INT, TYPES.INT], result_type: TYPES.BOOLEAN },
    //         { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.BOOLEAN }
    //     ],
    //     impl: (l, r) => l > r
    // },

    // '<=': {
    //     signatures: [
    //         { args: [TYPES.INT, TYPES.INT], result_type: TYPES.BOOLEAN },
    //         { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.BOOLEAN }
    //     ],
    //     impl: (l, r) => l <= r
    // },

    // '>=': {
    //     signatures: [
    //         { args: [TYPES.INT, TYPES.INT], result_type: TYPES.BOOLEAN },
    //         { args: [TYPES.FLOAT, TYPES.FLOAT], result_type: TYPES.BOOLEAN }
    //     ],
    //     impl: (l, r) => l >= r
    // }
}

export const UNARY_OPERATORS_SIGNATURES = {
    '!': {
        signatures: [
            { arg: TYPES.BOOLEAN, result_type: TYPES.BOOLEAN }
        ],
        impl: (arg) => !arg
    }, 

    '-': {
        signatures: [
            { arg: TYPES.INT, result_type: TYPES.INT },
            { arg: TYPES.FLOAT, result_type: TYPES.FLOAT }
        ],
        impl: (arg) => -arg
    }
}