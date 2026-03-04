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

    //TODO(в ближайшем будущем добавить LogicalOr -> LogicalAnd -> Equality -> Comparison -> Expression -> Term -> Factor)
 
    parse() { //точка входа потом поменяю на logicalOr
        return this.parseExpression();
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
        let node = this.parseFactor();

        while (true) {
            const token = this.peek();
            if (!token || token.type !== 'op' || (token.value !== '*' && token.value !== '/')) {
                break;
            }

            const op = this.consume().value;

            const right = this.parseFactor();

            node = {
                type: 'BinaryExpr',
                op: op,
                left: node,
                right: right
            };
        }

        return node;
    }

    parseFactor() {
        const token = this.peek();

        if (!token) {
            throw new Error('Expected factor');
        }

        switch (token.type) {
            case 'number':
                this.consume();
                return {type: 'NumberLiteral', value: token.value};
            case 'identifier':
                this.consume(); //TODO(добавить функции + глобальные кейворды типа true false null и тд)
                return {type: 'Var', name: token.value};
            case 'op':
                if (token.value === '(') {
                    this.consume();
                    const expr = this.parse()
                    this.expect('op', ')')
                    return expr;
                }
            default:
                throw new Error(`Unexpected token: ${token.type} ${token.value}`);
        }
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

function parseStringExpr(str) {
    const tokens = tokenize(str);

    if(tokens.length === 0) {
        return null;
    }

    const parser = new ExpressionParser(tokens);
    const expr_ast = parser.parse();
    return expr_ast;
}