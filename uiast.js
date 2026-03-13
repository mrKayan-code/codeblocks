import { parseStringExpr } from "./interpretator/expr_parser.js";
import { Scope } from "./interpretator/scope.js";
import { CONTINUE_TOKEN } from "./interpretator/tokenizer.js";
import { makeArrayType } from "./interpretator/types.js";

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
        case 'block-var-array': // TODO(пока так, мб как то нэстингом засунуть массивы в block var, там же и с вложенными массивами и типами раскидаться)
            return (function() {
                const name = block.querySelector('.name-input').value.trim();
                const element_type = block.querySelector('.element-type-input').value; //TODO(точно также если добавим многомерные массивы здесь в типе еще раз вызвать convertbtn)
                const size_expr = block.querySelector('.size-input').value;

                if (name !== '' && scope) {
                    scope.addVar(name, 'array', undefined);
                } else {
                    throw new Error('Var has no name')
                }
                
                return {
                    name: name,
                    element_type: element_type,
                    size_expr: parseStringExpr(size_expr)
                };
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

        case 'block-print-expr':
            return (function() {
                const expr = block.querySelector('.expr-input').value;
                return {expr: parseStringExpr(expr)};
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

         case 'block-if':
            return (function() {
                const condition = block.querySelector('.expr-input').value;
                const slots = block.querySelectorAll('.inner-slot');
                return {
                    condition: parseStringExpr(condition),
                    body: slots[0] ? buildUIAST(slots[0], scope) : null,
                    else_body:slots[1] ? buildUIAST(slots[1], scope) : null
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