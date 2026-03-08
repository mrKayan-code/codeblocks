const MULTI_OPS = ['==', '!=', '>=', '<=', '&&', '||', '//'];
const SINGLE_OPS = '+-*/()[]=!<>%';

export function tokenize(expr) {
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
                    throw new Error(`Invalid number literal: ${num + '.'}`);
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
            if (ident === 'true' || ident === 'false') {
                tokens.push({ type: 'boolean', value: ident === 'true' }); 
            } else { 
                tokens.push({
                    type: 'identifier',
                    value: ident
                }); 
            }
            continue;
        }

        let matched = false;
        for (const op of MULTI_OPS) {
            if (expr.startsWith(op, i)) {
                tokens.push({ type: 'op', value: op });
                i += op.length;
                matched = true;
                break;
            }
        }
        if (matched) {
            continue;
        }


        if (SINGLE_OPS.includes(char)) {
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