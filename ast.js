import { parseStringExpr } from "./expr_parser.js";
import { CONTINUE_TOKEN } from "./tokenizer.js";

export function buildASTFromCanvas(canvas) {
    return buildAST(canvas);
}

class AST {
    nodes;

    constructor() {
        this.nodes = [];
    }

    push(block) {
        try {
            this.nodes.push({
                block_type: block.className,
                node: convertBlockToNode(block),
            });
        } catch (error) {
            console.log(error);
            this.nodes.push({
                block_type: block.className,
                node: "Error",
                error: error
            });
        }
    }
}

function convertBlockToNode(block) {
    switch (block.className) {
        case 'block-var':
            return (function() {
                const type = block.querySelector('.type-input').value;
                const name = block.querySelector('.name-input').value.trim();
                
                if (name == '') {
                    throw new Error('Var has no name')
                }
                
                return {type: type, name: name};
            })();
        case 'block-var-array': // TODO(пока так, мб как то нэстингом засунуть массивы в block var, там же и с вложенными массивами и типами раскидаться)
            return (function() {
                const name = block.querySelector('.name-input').value.trim();
                const element_type = block.querySelector('.element-type-input').value; //TODO(точно также если добавим многомерные массивы здесь в типе еще раз вызвать convertbtn)
                const size_expr = block.querySelector('.size-input').value;

                if (name == '') {
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
                return buildAST(inner_canvas);
            })();
        case 'block-while':
            return (function() {
                const condition = block.querySelector('.expr-input').value;
                const inner_canvas = block.querySelector('.inner-slot');
                return {
                    condition: parseStringExpr(condition),
                    body: buildAST(inner_canvas)
                };
            })();

        case 'block-if':
            return (function() {
                const condition = block.querySelector('.expr-input').value;
                const slots = block.querySelectorAll('.inner-slot');
                return {
                    condition: parseStringExpr(condition),
                    body: slots[0] ? buildAST(slots[0]) : null,
                    else_body:slots[1] ? buildAST(slots[1]) : null
                };
            })();

        default:
            return {type: undefined};
    }
}

function buildAST(canvas) {
    const ast = new AST();

    const children = Array.from(canvas.children);

    for (const child of children) {
        ast.push(child);
    }
    return ast;
}
