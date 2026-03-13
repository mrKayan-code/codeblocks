import { buildUIASTFromCanvas } from "./uiast.js";
import { buildASTFromCanvas } from "./interpretator/ast.js";
import InterpretatorManager from "./interpretator/worker_manager.js";
import { makeDraggablePaletteBlock } from "./drag_and_drop/dragstart_manager.js";
import { makeCanvasDroppable, makePaletteDroppable} from "./drag_and_drop/drop_manager.js";

const canvas = document.getElementById('canvas');
const palette = document.getElementById('palette');
const start_button = document.getElementById('Start-btn');
const consoleOutput = document.getElementById('console-output');

const interpretator = new InterpretatorManager((msg) => {
            const line = document.createElement("div");
            line.textContent = `${msg}`;
            consoleOutput.appendChild(line);
        });


const originalBlocks = document.querySelectorAll('#palette [class^="block"]');
originalBlocks.forEach(block => {
    makeDraggablePaletteBlock(block, onProgramChanged);
});

makeCanvasDroppable(canvas, onProgramChanged);

makePaletteDroppable(palette, onProgramChanged);

canvas.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        const blockToRemove = event.target.closest ('[class^="block"]');
        if (blockToRemove) {
            blockToRemove.remove();
        }
    }
});


//TODO кнопка старт

start_button.addEventListener('click', () => {
    consoleOutput.innerHTML = '';
    try {
        const ast = buildASTFromCanvas(canvas);
        interpretator.start(ast);

        console.log(JSON.stringify(ast, null, 2));
    } catch (e) {
        consoleOutput.innerHTML += `<div style="color:red">${e.message}</div>`;
        console.error(e);
    }
});

//TODO локига кнопки Reset

const reset_button = document.getElementById('Reset-btn');
if (reset_button) {
    reset_button.addEventListener('click' , () => {
        if (confirm('Все блоки будут удалены!')) {
            canvas.innerHTML = '';
            onProgramChanged();
        }
    });
}

//TODO локига кнопки Clear очистка консоли

const clear_console_button = document.getElementById('btn-clear-console');
if (clear_console_button) {
    clear_console_button.addEventListener('click', () => {
        consoleOutput.innerHTML = '';
    });
}

//TODO локига кнопки Save

const save_button = document.getElementById('Save-btn');
if (save_button) {
    save_button.addEventListener('click', () => {

        const ast = buildUIASTFromCanvas(canvas);
        const programData = JSON.stringify(ast, null, 2);

        const blob = new Blob([programData], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        a.download = '67-blocks-project.json';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        console.log('Файл успешно сохранен!');
    });
}

function onProgramChanged() {
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