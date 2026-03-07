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

    addVar(name, type, initialValue = undefined) {
        if (this.hasLocal(name)) {
            return this.var_table[name];
        }

        this.var_table[name] = {
            type: type,
            value: initialValue
        };
        
        return this.var_table[name];
    }

    setVar(name, value) {
        if (name in this.var_table) {
            this.var_table[name].value = value;
            return this.var_table[name];
        }
        //TODO(добавить проверку на типы но пока так сойдет)

        if (this.parent !== null) {
            return this.parent.setVar(name, value);
        }

        return null;
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