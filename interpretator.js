const start_button = document.getElementById('startblock');

const global_vars = {};
const ast = [];


start_button.addEventListener('click', () => {
    const canvas = document.getElementById('canvas');

    buildAST(canvas);

    console.log(ast);

    // console.log(global_vars);
});

function reset() {
    for (const key in global_vars) {
        delete global_vars[key];
    }

    ast.length = 0;
}

function parseExpression(expr) { //пока только математика

}

function convertBlockToNode(block) {
    switch (block.className) {
        case 'block-var':
            return (function() {
                return {type: block.querySelector('.type-input').value, name: block.querySelector('.name-input').value};
            })();
        case 'block-assign':
            return (function() {
                const vari = block.querySelector('.var-input').value;
                const expr = block.querySelector('.expr-input').value;
                return {var: vari, expr: expr};
            })();            
        case 'block-print-var':
            return (function() {
                const vari = block.querySelector('.var-input').value;
                return {var: vari};
            })(); 
        default:
            return {type: undefined};
            break;
    }

}


function buildAST(canvas) {
    reset();

    const children = Array.from(canvas.children);

    for (const child of children) {
        ast.push({
            block_type: child.className,
            node: convertBlockToNode(child)
        })
    }
}
