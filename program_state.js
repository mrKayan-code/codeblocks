import { buildUIASTFromCanvas } from "./uiast.js";

export function onProgramChanged(canvas) {
    const ast = buildUIASTFromCanvas(canvas);
    if (ast) {
        updateVarSelectsFromAST(ast);
    }
}

function updateVarSelectsFromAST(ast) {
    if (!ast) return;

    const currentScope = ast.scope;

    for (const entry of ast.nodes) {
        const node = entry.node;
        const block = entry.block;

        if (entry.block_type === 'block-assign' || entry.block_type === 'block-print-var' || entry.block_type === 'block-assign-array') {
            const varNames = currentScope.getNameListOfVisibleVars();
            const select = block.querySelector('.var-input');
            if (select) {
                fillSelectWithNames(select, varNames);
            }
        }

        if (entry.block_type === 'block-container') {
            updateVarSelectsFromAST(node);
        }

        if (entry.block_type === 'block-while' || entry.block_type === 'block-if') {
            if (node.body) updateVarSelectsFromAST(node.body);
            if (node.else_body) updateVarSelectsFromAST(node.else_body);
        }
    }
}

function fillSelectWithNames(select, varNames) {
    const current = select.value;

    select.innerHTML = '';

    varNames.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });

    if (varNames.includes(current)) {
        select.value = current;
    } else if (varNames.length > 0) {
         select.value =varNames[0];
    }
}