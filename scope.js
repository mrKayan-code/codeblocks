import { typeMatch, getTypeOf } from "./types.js";

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

    addVar(name, type, initial_value = null) {
        // if (this.hasLocal(name)) {
        //     // return this.var_table[name];
        // }

        if (!this.isTypeCompatible(type, initial_value)) {
            throw new Error(`type error: var '${name}' expect ${vari.type}, got ${getTypeOf(value)}`);
        }

        

        this.var_table[name] = {
            type: type,
            value: initial_value
        };
        
        return this.var_table[name];
    }

    setVar(name, value) {
        const vari = this.getVar(name);

        if (!vari) {
            throw new Error(`var is not exist: ${name}`);
        }

        if (!this.isTypeCompatible(vari.type, value) ) {
            throw new Error(`type error: var '${name}' expect ${vari.type}, got ${getTypeOf(value)}`);
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
            throw new Error(`type error: var '${name}' expect ${vari.type}, got ${type}}`);
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