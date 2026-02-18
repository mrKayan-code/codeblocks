class Scope {
    parent
    var_table

    constructor(parent = null) {
        this.parent = parent;
        this.var_table = {};
    }

    hasLocal(name) {
        return name in this.var_table;
    }

    getVar(name) {
        if (name in this.var_table){
            return this.var_table[name];
        }
        
        if (this.parent !== null) {
            return this.parent.getVar(name);
        }
        
        return null;

    }

    addVar(name, type) {
        if (this.hasLocal(name)) {
            return null;
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
            return var_table[name];
        }
        //TODO(добавить проверку на типы но пока так сойдет)

        if (this.parent !== null) {
            this.parent.setVar(name, value);
            return var_table[name];
        }

        return null;
    }

}

const start_button = document.getElementById('startblock');

const ast = [];


start_button.addEventListener('click', () => {
    reset();
    const canvas = document.getElementById('canvas');

    buildAST(canvas, null);

    console.log(ast);

    
});

function reset() {
    for (const key in global_vars) {
        delete global_vars[key];
    }

    ast.length = 0;
}

function parseExpression(expr) { //TODO(парсер выражений потом разберемся и с лог через опз)

}

function convertBlockToNode(block) {
    switch (block.className) {
        case 'block-var':
            return (function() {
                return {type: block.querySelector('.type-input').value, name: block.querySelector('.name-input').value};
            })();
        case 'block-assign':
            return (function() {
                const vari = block.querySelector('.var-input').value;
                const expr = block.querySelector('.expr-input').value;
                return {var: vari, expr: expr};
            })();            
        case 'block-print-var':
            return (function() {
                const vari = block.querySelector('.var-input').value;
                return {var: vari};
            })();
        default:
            return {type: undefined};
    }

}


function buildAST(canvas, parentScope) {
    

    const children = Array.from(canvas.children);

    for (const child of children) {
        ast.push({
            block_type: child.className,
            node: convertBlockToNode(child)
        })
    }
}

