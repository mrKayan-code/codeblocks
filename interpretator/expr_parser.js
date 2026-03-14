import { tokenize } from "./tokenizer.js";
class ExpressionParser {
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

    expect(type, value = null) {
        const token = this.peek();
        if (!token || token.type !== type || (value !== null && token.value !== value)) {
            throw new Error(
                `Expected ${type} ${value ?? ''}, got ${token ? token.type + ' ' + token.value : 'End Of File'}` 
            );
        }
        return this.consume();
    }

    
 
    parse() { //точка входа потом поменяю на logicalOr
        const exprAst =  this.parseLogicalOr();
        
        return exprAst;
    }

    parseLogicalOr() {
        let node = this.parseLogicalAnd();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || token.value !== '||') {
                break; 
            }

            const op = this.consume().value;
            const right = this.parseLogicalAnd();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }
    
    parseLogicalAnd() {
        let node = this.parseEquality();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || token.value !== '&&') {
                break; 
            }

            const op = this.consume().value;
            const right = this.parseEquality();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }

    parseEquality() {
        let node = this.parseComparison();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || (token.value !== '==' && token.value !== '!=')) {
                break; 
            }

            const op = this.consume().value;
            const right = this.parseComparison();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }

    parseComparison() {
        let node = this.parseExpression();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || (token.value !== '<' && token.value !== '>' && token.value !== '<=' && token.value !== '>=')) {
                break; 
            }

            const op = this.consume().value;
            const right = this.parseExpression();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }

    parseExpression() {
        let node = this.parseTerm();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || (token.value !== '+' && token.value !== '-')) {
                break;
            }

            const op = this.consume().value;

            const right = this.parseTerm();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }

    parseTerm() {
        let node = this.parsePrefix();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || (token.value !== '*' && token.value !== '/' && token.value !== '//' && token.value !== '%')) {
                break;
            }

            const op = this.consume().value;

            const right = this.parsePrefix();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }

    parsePrefix() {
        const token = this.peek();
        
        if (token && token.type === 'op' && (token.value === '!' || token.value === '-')) {
            const op = this.consume().value;
            return {
                type: "UnaryExpr",
                op: op,
                argument: this.parseFactor()
            }
        }

        return this.parseFactor();
    }

    parseFactor() {
        const token = this.peek();

        if (!token) {
            throw new Error('Expected factor Unexpected end');
        }

        switch (token.type) {
            case 'number':
                this.consume();
                return {type: 'NumberLiteral', value: token.value};
            case 'identifier':
                this.consume();
                return this.parsePostfix({type: 'Var', name: token.value});
            case 'op':
                if (token.value === '(') {
                    this.consume();
                    const expr = this.parse()
                    this.expect('op', ')')
                    return this.parsePostfix(expr);
                }

                if (token.value == '[') {
                    this.consume();
                    const elements = [];

                    elements.push(this.parse());

                    while(this.peek() && this.peek().value === ',') {
                        this.consume();
                        elements.push(this.parse());
                    }

                    this.expect('op', ']');
                    return this.parsePostfix({type: 'ArrayLiteral', elements: elements});
                }
                throw new Error(`Unexpected op: '${token.value}' in factor`);
            case 'boolean':
                this.consume();
                return { type: 'BooleanLiteral', value: token.value };
            default:
                throw new Error(`Unexpected ${token.type}: ${token.value}`);
        }
    }

    parsePostfix(ident) { //TODO(сюда функции) 
        let node = ident;

        while(this.peek() && this.peek().value === '[') {
            this.consume();
            const index = this.parse();
            this.expect('op', ']');
            node = {type: 'IndexNotation', obj: node, index: index};
        }

        while(this.peek() && this.peek().value === '(') {
            this.consume();
            const args = [];
            if (this.peek() && this.peek().value !== ')') {
                args.push(this.parse());
                
                while(this.peek() && this.peek().value === ',') {
                    this.consume();
                    args.push(this.parse());
                }
            }
            
            this.expect('op', ')')

            node = {
                type: 'FuncCall',
                caller: node,
                args: args
            }
        }

        return node;
    }

}



export function parseStringExpr(str) {
    const tokens = tokenize(str);

    if(tokens.length === 0) {
        return null;
    }

    const parser = new ExpressionParser(tokens);
    const expr_ast = parser.parse();

    if (parser.peek() != null) {
        throw new Error(`Expression broken, ${parser.peek().type} '${parser.peek().value}' not expected`);
    }
    return expr_ast;
}