import { Scope } from "./scope.js";

class Interpretator {
    constructor () {
        this.stopped = false;
    }

    run(ast, parentScope) {
        const scope = new Scope(parentScope); //TODO(если это окажется слишком жирно создавать новый скоуп на каждой итерации вайла например, хотя оно так и должно рвботать, в будущем изменить на 1 переиспользуемый скоуп)
        for (const node of ast.nodes) {
            if (node.node === "Error") {
                self.postMessage({
                    type: "error",
                    message: "Error in block: ${node.block_type}"
                });
                // this.console(`Error in block: ${node.block_type}`);
                throw new Error("Stopped");
            }
            this.execute(node.node, node.block_type, scope);
        }
    }

    execute(node, block_type, scope) {
        switch (block_type) {
            case 'block-var':
                scope.addVar(node.name, node.type, undefined);
                
                break;
            case 'block-assign':
                const value = this.evalExpr(node.expr, scope);
                scope.setVar(node.name, value);
                break;
            case 'block-print-var':
                const varData = scope.getVar(node.name);
                self.postMessage({
                    type: "output",
                    message: varData ? varData.value : "null"
                });
                break;
            case 'block-while':
                while (this.evalExpr(node.condition, scope)) {
                    this.run(node.body, scope);
                }
                break;
            case "block-container":
                this.run(node, scope);
        }
    }

    evalExpr(expr, scope) {
        if (!expr) {
            return null;
        }

        switch (expr.type) {
            case 'NumberLiteral':
                return expr.value;
            case 'BooleanLiteral':
                return expr.value
            case 'Var':
                const data = scope.getVar(expr.name);
                return data ? data.value : null;
            case 'BinaryExpr':
                const left = this.evalExpr(expr.left, scope);
                const right = this.evalExpr(expr.right, scope);
                return this.computeBinary(expr.op, left, right);
            case 'UnaryExpr':
                const argument = this.evalExpr(expr.argument, scope);
                return this.computeUnary(expr.op, argument)
            default:
                throw new Error(`Unknown expr type: ${expr.type}`);
        }
    }

    computeUnary(op, argument) {
        switch (op) {
            case '!': return !argument;
            case '-': return -argument;

            default: throw new Error(`Unknown operator: ${op}`);
        }
    }

    computeBinary(op, left, right) {
        switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            
            case '==': return left == right;
            case '!=': return left != right;
            case '<':  return left < right;
            case '>':  return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;

            case '&&': return left && right;
            case '||': return left || right;
            
            default: throw new Error(`Unknown operator: ${op}`);
        }
    }
}

self.onmessage = function(e) {
    const { ast } = e.data;
    const interpretator = new Interpretator();
    
    try {
        interpretator.run(ast, null);
        self.postMessage({type: "done"});
    } catch (error) {
        self.postMessage({type: "error"});
    }
};

