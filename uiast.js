import { parseStringExpr } from "./expr_parser.js";
import { Scope } from "./scope.js";
import { CONTINUE_TOKEN } from "./tokenizer.js";

export function buildUIASTFromCanvas(canvas) {    
    return buildUIAST(canvas, null);;
}

class UIAST {
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
                block: block,
                error: error
            });
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
                    scope.addVar(name, type, undefined);
                } else {
                    throw new Error('Var has no name')
                }
                
                return {type: type, name: name};
            })();
        case 'block-assign':
            return (function() {    
                const name = block.querySelector('.var-input').value;
                const expr = block.querySelector('.expr-input').value;
                
                return {name: name, expr: parseStringExpr(expr)};
            })();
        case 'block-assign-array':
            return (function() {
                const array_name = block.querySelector('.var-input').value;
                const index_notation = block.querySelector('.index-input').value;
                const expr = block.querySelector('.expr-input').value;
                
                return {
                    index_notation: parseStringExpr(array_name + CONTINUE_TOKEN + index_notation),
                    expr: parseStringExpr(expr)
                };
            })();
        case 'block-print-var':
            return (function() {
                const name = block.querySelector('.var-input').value;
                return {name: name};
            })();
        case 'block-container':
            return (function() {
                const inner_canvas = block.querySelector('.inner-slot');
                return buildUIAST(inner_canvas, scope)
            })();
        case 'block-while':
            return (function() {
                const condition = block.querySelector('.expr-input').value;
                const inner_canvas = block.querySelector('.inner-slot');
                return {
                    condition: parseStringExpr(condition),
                    body: buildUIAST(inner_canvas, scope)
                };
            })();
        
        default:
            return {type: undefined};
    }
}

function buildUIAST(canvas, parentScope) {
    const uiast = new UIAST(parentScope);

    const children = Array.from(canvas.children);

    for (const child of children) {
        uiast.push(child);
    }
    return uiast;
}