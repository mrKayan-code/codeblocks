let currentProgramAST = null;

function buildProgramASTFromCanvas(canvas) {
    const ast = buildAST(canvas, null);
    currentProgramAST = ast;
    return ast;
}

function getCurrentProgramAST() {
    return currentProgramAST;
}

class AST {
    nodes;
    scope;

    constructor(parentScope) {
        this.nodes = [];
        this.scope = new Scope(parentScope);
    }

    push(block) {
        try {
            this.nodes.push({
                block_type: block.className,
                node: convertBlockToNode(block, this.scope),
                block: block
            });
        } catch (error) {
            this.nodes.push({
                block_type: block.className,
                node: "Error",
                block: block
            })
        }
        
    }
}

function convertBlockToNode(block, scope) {
    switch (block.className) {
        case 'block-var':
            return (function() {
                const type = block.querySelector('.type-input').value;
                const name = block.querySelector('.name-input').value.trim();
                
                if (name !== '' && scope) {
                    scope.addVar(name, type, null);
                } else {
                    throw new Error('Var has no name')
                }
                
                return {type: type, name: name};
            })();
        case 'block-assign':
            return (function() {
                const vari = block.querySelector('.var-input').value;
                const expr = block.querySelector('.expr-input').value;
                
                return {var: vari, expr: parseStringExpr(expr)};
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