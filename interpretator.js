import { BINARY_OPERATORS_SIGNATURES, UNARY_OPERATORS_SIGNATURES } from "./operators.js";
import { Scope } from "./scope.js";
import { typeMatch, TYPES, typedValue, getTypeOf, isArrayType, getArrayElementType } from "./types.js";
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
                    message: `${node.error} in block: ${node.block_type}`
                });
                // this.console(`Error in block: ${node.block_type}`);
                throw new Error("Stopped");
            }
            try {
                this.execute(node.node, node.block_type, scope);
            } catch (error) {
                self.postMessage({
                    type: "error",
                    message: `${error} in block: ${node.block_type}`
                });
                throw new Error("Stopped");
            }
            
        }
    }

    execute(node, block_type, scope) {
        switch (block_type) {
            case 'block-var':
                scope.addVar(node.name, node.type, null);
                
                break;
            case 'block-assign':
                const typed_value = this.evalExpr(node.expr, scope);
                scope.setVar(node.name, typed_value.value, typed_value.type);
                break;
            case 'block-print-var':
                const varData = scope.getVar(node.name);
                self.postMessage({
                    type: "output",
                    message: varData ? varData.value : "null"
                });
                break;
            case 'block-while':
                const typed_predicate = this.evalExpr(node.condition, scope);
                if (!typeMatch(TYPES.BOOLEAN, typed_predicate.type)) {
                    throw new Error(`Expected boolean, got ${typed_predicate.type}`);
                }

                while (true) {
                    const typed_predicate = this.evalExpr(node.condition, scope);
                    
                    if (!typeMatch(TYPES.BOOLEAN, typed_predicate.type)) {
                        throw new Error(`Expected boolean, got ${typed_predicate.type}`);
                    }

                    if (!typed_predicate.value) {
                        break;
                    }

                    this.run(node.body, scope);
                }                
                break;
            case "block-container":
                this.run(node, scope);
        }
    }

    evalExpr(expr, scope) {
        if (!expr) {
            return typedValue(null, TYPES.NULL);
        }

        switch (expr.type) {
            case 'NumberLiteral':
                return typedValue(expr.value, null);
            case 'BooleanLiteral':
                return typedValue(expr.value, TYPES.BOOLEAN);
            case 'ArrayLiteral':
                const elems = expr.elements.map(el => this.evalExpr(el, scope).value);
                return typedValue(elems, getTypeOf(elems));
            case 'IndexNotation':
                const obj = this.evalExpr(expr.obj, scope);
                const index = this.evalExpr(expr.index, scope);

                if (!isArrayType(obj.type)) {
                    throw new Error(`Cannot get el by index from var with type: ${obj.type}`);
                }

                if (!typeMatch(TYPES.INT, index.type)) {
                    throw new Error(`Index must be typr int, got: ${index.type}`);
                }

                if (index.value < 0 || index.value >= obj.value.length) {
                    throw new Error(`Index out of range: [${index.value}]`);
                }

                return typedValue(obj.value[index.value], getArrayElementType(obj.type));
            case 'Var':
                const data = scope.getVar(expr.name);
                if (!data) {
                    throw new Error(`Undefined var '${expr.name}'`);
                }
                return typedValue(data.value, data.type);
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
        const signature = UNARY_OPERATORS_SIGNATURES[op];

        if (!signature) {
            throw new Error(`Unknown operator: ${op}`);
        }

        const match = signature.signatures.find(sig => typeMatch(sig.arg, argument.type));

        if (!match) {
            throw new Error(`Operator '${op}' not supported for ${argument.type}`);
        }

        return typedValue(signature.impl(argument.value), match.result_type);
    }

    computeBinary(op, left, right) {
        const signature = BINARY_OPERATORS_SIGNATURES[op];

        if (!signature) {
            throw new Error(`Unknown operator: ${op}`);
        }
        
        const match = signature.signatures.find(sig => (typeMatch(sig.args[0], left.type) && 
                                                        typeMatch(sig.args[1], right.type)))
        
        if(!match) {
            throw new Error(`Operator '${op}' not supported for [${left.type}, ${right.type}]`);
        }

        return typedValue(signature.impl(left.value, right.value), match.result_type);
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

