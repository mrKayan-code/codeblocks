class Interpretator {
    constructor (console) {
        this.console = console || console.log;
        this.scope = null;
    }

    run(ast) {
        this.scope = ast.scope;
        for (const node of ast.nodes) {
            if (node.node === "Error") {
                this.console(`Error in block: ${node.block_type}`);
                return;
            }
            this.execute(node.node, node.block_type);
        }
    }

    execute(node, block_type) {
        switch (block_type) {
            case 'block-var':
                break;
            case 'block-assign':
                const value = this.evalExpr(node.expr);
                this.scope.setVar(node.name, value);
                break;
            case 'block-print-var':
                const varData = this.scope.getVar(node.name);
                this.console(varData ? varData.value : null);
                break;
            case 'block-while':
                while (this.evalExpr(node.condition)) {
                    const body_interpretator = new Interpretator(this.console);
                    body_interpretator.scope = node.body.scope;
                    body_interpretator.run(node.body);
                }
                break;
            case "block-container":
                const body_interpretator = new Interpretator(this.console);
                body_interpretator.scope = node.scope;
                body_interpretator.run(node);
        }
    }

    evalExpr(expr) {
        if (!expr) {
            return null;
        }

        switch (expr.type) {
            case 'NumberLiteral':
                return expr.value;
            case 'Var':
                const data = this.scope.getVar(expr.name);
                return data ? data.value : null;
            case 'BinaryExpr':
                const left = this.evalExpr(expr.left);
                const right = this.evalExpr(expr.right);
                return this.computeBinary(expr.op, left, right);
            default:
                throw new Error(`Unknown expr type: ${expr.type}`);
        }
    }
    
    computeBinary(op, left, right) {
        switch (op) {
            case '+': 
                return left + right;
            case '-': 
                return left - right;
            case '*': 
                return left * right;
            case '/': 
                return left / right;
            default: 
                throw new Error(`Unknown operator: ${op}`);
        }
    }
}

