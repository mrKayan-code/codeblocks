class Scope {
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

class AST {
    nodes;
    scope;

    constructor(parentScope) {
        this.nodes = [];
        this.scope = new Scope(parentScope);
    }

    push(block) {
        this.nodes.push({
            block_type: block.className,
            node: convertBlockToNode(block, this.scope)
        });
    }
}

class Expression {
    tokens;
    pos;

    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek() {
        return this.tokens[this.pos] || null;
    }

    consume() {
        return this.tokens[this.pos++] || null;
    }

    
}



function tokenize(expr) {
    expr = expr.replace(/\s+/g, '');

    const tokens = [];

    let i = 0;
    while (i < expr.length) {
        const char = expr[i];

        if (/[0-9.]/.test(char)) {
            let num = '';
            let dot = false;

            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                const c = expr[i];
                
                if (c === '.' && !dot) {
                    dot = true;
                } else if(c === '.' && dot) {
                    throw new Error(`Invalid number literal: ${num + '..'}`);
                }

                num += c;
                i++;
            }

            if (num === '.' || num === '') {
                throw new Error(`Invalid number literal: ${num}`);
            }

            tokens.push({
                type: 'number',
                value: parseFloat(num)
            });
            continue;
        }

        if (/[a-zA-Z_]/.test(char)) {
            let ident = '';

            while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
                ident += expr[i];
                i++;
            }

            tokens.push({
                type: 'identifier',
                value: ident
            });
            continue;
        }

        if ('+-*/()'.includes(char)) {
            tokens.push({
                type: 'op',
                value: char
            });
            i++;
            continue;
        }

        throw new Error(`Unexpected char: '${char}'`);
    }

    return tokens;
}



const start_button = document.getElementById('startblock');




start_button.addEventListener('click', () => {
    // reset();
    const canvas = document.getElementById('canvas');

    const ast = buildAST(canvas, null);

    console.log(ast);


});

function convertBlockToNode(block, scope) {
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
        case 'block-container':
            return (function() {
                const inner_canvas = block.querySelector('.inner-slot');
                return buildAST(inner_canvas, scope)
            })();
        default:
            return {type: undefined};
    }

}


function buildAST(canvas, parentScope) {
    const ast = new AST(parentScope);

    const children = Array.from(canvas.children);

    for (const child of children) {
        ast.push(child);
    }
    return ast;
}

