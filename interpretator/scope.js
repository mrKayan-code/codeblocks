import { typeMatch, getTypeOf, typedValue, stringifyType, TYPES } from "./types.js";

export class Scope {
    parent;
    var_table;

    constructor(parent = null) {
        this.parent = parent;
        this.var_table = {};
    }

    hasLocal(name) {
        return name in this.var_table;
    }

    getVar(name) {
        if (this.hasLocal(name)){
            return this.var_table[name];
        }
        
        if (this.parent !== null) {
            return this.parent.getVar(name);
        }
        
        return null;

    }

    addVar(name, type, initial_typed_value = typedValue(TYPES.NULL, null)) {
        // if (this.hasLocal(name)) {
        //     // return this.var_table[name];
        // }

        if (!isTypeCompatible(type, initial_typed_value)) {
            throw new Error(`type error: var '${name}' expect ${stringifyType(type)}, got ${stringifyType(getTypeOf(initial_value))}`);
        }

        

        this.var_table[name] = typedValue(type, initial_typed_value.value);
        
        return this.var_table[name];
    }

    setVar(name, value) {
        const vari = this.getVar(name);

        if (!vari) {
            throw new Error(`var is not exist: ${name}`);
        }

        if (!isTypeCompatible(vari.type, value) ) {
            throw new Error(`type error: var '${name}' expect ${stringifyType(vari.type)}, got ${stringifyType(getTypeOf(value))}`);
        }

        vari.value = value;
        return vari;
    }

    setVar(name, value, type) {
        const vari = this.getVar(name);

        if (!vari) {
            throw new Error(`var is not exist: ${name}`);
        }

        if (!typeMatch(vari.type, type) ) {
            throw new Error(`type error: var '${name}' expect ${stringifyType(vari.type)}, got ${stringifyType(type)}}`);
        }

        vari.value = value;
        return vari;
    }

    isTypeCompatible(expected_type, value) {
        if (value === null) {
            return true;
        }

        const actual_type = getTypeOf(value);

        return typeMatch(expected_type, actual_type)        
    }



    getNameListOfVisibleVars() {
        const names = new Set();

        let current = this;
        while (current) {
            for (const name in current.var_table) {
                names.add(name);
            }
            current = current.parent;
        }

        return Array.from(names);
    }
}

function isTypeCompatible(expected_type, t_value) {
    if (!t_value) {
        return false;
    } 
    if (!'type' in t_value) {
        return false;
    }
    if (t_value.type === TYPES.NULL) {
        return true;
    }

    return typeMatch(expected_type, t_value.type)
}