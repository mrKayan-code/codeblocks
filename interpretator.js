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

function convertBlockToNode(className, block) {
    switch (className) {
        case 'block-var':
            return {type: block.querySelector('.type-input').value, name: block.querySelector('.name-input').value};
            break;
        case 'block-assign':
            return
            break;
        default:
            return {type};
            break;
    }

}


function buildAST(canvas) {
    reset();

    const children = Array.from(canvas.children);

    for (const child of children) {
        ast.push({
            block_type: child.className,
            node: convertBlockToNode(child.className, child)
        })
    }
}

// тут только мой коммент