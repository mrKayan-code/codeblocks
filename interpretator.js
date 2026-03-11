import { BINARY_OPERATORS_SIGNATURES, UNARY_OPERATORS_SIGNATURES } from "./operators.js";
import { Scope } from "./scope.js";
import { typeMatch, TYPES, typedValue, getTypeOf, isArrayType, stringifyTypedValue, isComplexType, COMPLEX_TYPES, makeArrayType } from "./types.js";
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
                scope.addVar(node.name, node.type, this.getDefaultValueForType(node.type));
                
                break;
            case 'block-var-array': 
                const tv = this.initArray(node, scope, this.getDefaultValueForType(node.element_type));

                scope.addVar(node.name, tv.type, tv.value)
                break;
            case 'block-assign':
                const typed_value = this.evalExpr(node.expr, scope);
                scope.setVar(node.name, typed_value.value, typed_value.type);
                break;
            case 'block-assign-array':
                // self.postMessage({
                //     type: "output",
                    
                //     message: JSON.stringify(node)
                // });
                const array_elem = this.evalExpr(node.index_notation, scope);               
                const expr = this.evalExpr(node.expr, scope);
                

                if (!typeMatch(array_elem.type, expr.type)) {
                    throw new Error(`array expect ${array_elem.type}, got: ${expr.type}`);
                }

                array_elem.value = expr.value;
                break;
            case 'block-print-var':
                const varData = scope.getVar(node.name);
                // self.postMessage({
                //     type: "output",
                    
                //     message: JSON.stringify(varData)
                // });
                self.postMessage({
                    type: "output",
                    
                    message: varData ? stringifyTypedValue(varData) : "null" //TODO(лютый костыль)
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
            return typedValue(TYPES.NULL, null);
        }

        switch (expr.type) {
            case 'NumberLiteral':
                return typedValue(getTypeOf(expr.value), expr.value);
            case 'BooleanLiteral':
                return typedValue(TYPES.BOOLEAN, expr.value);
            case 'ArrayLiteral':
                const elems = expr.elements.map(el => this.evalExpr(el, scope));
                return typedValue(getTypeOf(elems), elems);
            case 'IndexNotation':
                const obj = this.evalExpr(expr.obj, scope);
                const index = this.evalExpr(expr.index, scope);

                if (!isArrayType(obj.type)) {
                    throw new Error(`Cannot get el by index from var with type: ${obj.type}`);
                }

                if (!typeMatch(TYPES.INT, index.type)) {
                    throw new Error(`Index must be typr int, got: ${index.type}`);
                }

                if (index.value < 0 || index.value >= obj.type.size) {
                    throw new Error(`Index out of range: [${index.value}]`);
                }

                return obj.value[index.value];
            case 'Var':
                const vari = scope.getVar(expr.name);
                if (!vari) {
                    throw new Error(`Undefined var '${expr.name}'`);
                }

                return vari;
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

        return typedValue(match.result_type, signature.impl(argument.value));
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

        return typedValue(match.result_type, signature.impl(left.value, right.value));
    }

    getDefaultValueForType(type) {
        if (!isComplexType(type)) {
            switch (type) {
                case TYPES.STRING: return '';
                case TYPES.BOOLEAN: return false;
                case TYPES.INT: return 0;
                case TYPES.FLOAT: return 0;
                default: return null;
            }
        }else {
            if (type.complex_type === COMPLEX_TYPES.ARRAY) {
                return this.getDefaultValueForType(type.element_type);
            }
        }
        return null;
    }

    initArray(node, scope) {
        const size_tv = this.evalExpr(node.size_expr, scope);

        if (!typeMatch(TYPES.INT, size_tv.type)) {
            throw new Error(`Size of array expect int, got: '${size_tv.type}'`);
        }

        if (size_tv.value < 1) {
            throw new Error(`Size of array must be > 0, got: '${size_tv.value}'`);
        }

        // if (typeof node.type.element_type !== 'string') {
        if (typeof node.element_type !== 'string') {  
            return typedValue(makeArrayType(this.initArray(node.element_type, scope, default_val).type, size_tv.value), makeArray(size_tv.value, this.initArray(node.element_type, scope, default_val).value))
        } else {
            return typedValue(makeArrayType(node.element_type, size_tv.value),makeArray(size_tv.value,typedValue(node.element_type, this.getDefaultValueForType(node.element_type))));
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

function makeArray(size, tv) {
    const arr = new Array(size);
    
    for (let i = 0; i < size; i++) {
        arr[i] = typedValue(tv.type, tv.value);
    }
    return arr;
}


