import { buildUIASTFromCanvas } from "./uiast.js";
import { buildASTFromCanvas } from "./ast.js";
import InterpretatorManager from "./worker_manager.js";

const canvas = document.getElementById('canvas');
const palette = document.getElementById('palette');
const start_button = document.getElementById('Start-btn');
const consoleOutput = document.getElementById('console-output');
const interpretator = new InterpretatorManager((msg) => {
            const line = document.createElement("div");
            line.textContent = `${msg}`;
            consoleOutput.appendChild(line);
        })

let draggedItem = null;
let sourceZone = null;  //фигни чтобы помнить что и откуда перетаскичаю


const originalBlocks = document.querySelectorAll('#palette [class^="block"]');
originalBlocks.forEach(block => {
    makeDraggable(block);
});

function makeDraggable(element) {
    element.setAttribute('draggable', 'true');
    element.addEventListener ('dragstart', function(event) {
        event.stopPropagation();
        draggedItem = element;
        sourceZone = element.closest('#palette') ? 'palette' : 'canvas';
        event.dataTransfer.effectAllowed = sourceZone === 'palette' ? 'copy' : 'move';
    });
}

function makeDroppable(element) {
    element.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    element.addEventListener('drop', function(event){
        event.preventDefault();
        event.stopPropagation();

        if (!draggedItem) return;

        if (sourceZone === 'palette') {
            const clone = draggedItem.cloneNode(true);
            makeDraggable(clone);
            makeDroppable(clone);

            clone.querySelectorAll('.inner-slot').forEach(slot => setupSlot(slot));
            setupBlockLogic(clone);

            element.insertAdjacentElement('afterend', clone);
        } else if (sourceZone === 'canvas') {
            setupBlockLogic(element);
            element.insertAdjacentElement('afterend', draggedItem);
        }

        onProgramChanged();
        draggedItem = null;
        sourceZone = null;
    });
}

// TODO раб область

canvas.addEventListener('dragover', function(event) {
    event.preventDefault();
});

canvas.addEventListener('drop', function(event) {
    event.preventDefault();

    if (event.target === canvas) {
            if (sourceZone === 'palette') {
                const clone = draggedItem.cloneNode(true);
                clone.classList.remove('palette-block')
                makeDraggable(clone);
                makeDroppable(clone);

                clone.querySelectorAll('.inner-slot').forEach(slot => setupSlot(slot));
                setupBlockLogic(clone);

                canvas.appendChild(clone);
            } else if (sourceZone === 'canvas') {
                canvas.appendChild(draggedItem);
            }
        }

    onProgramChanged();
    draggedItem = null;
    sourceZone = null;
});

// TODO Логика удаления

palette.addEventListener('dragover', (e) => e.preventDefault());
palette.addEventListener('drop', function(event){
    event.preventDefault();
    if(sourceZone === 'canvas'){
        draggedItem.remove();
        onProgramChanged();
    }
    draggedItem = null;
    sourceZone = null;
});

canvas.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        const blockToRemove = event.target.closest ('[class^="block"]');
        if (blockToRemove) {
            blockToRemove.remove();

            if (typeof onProgramChanged === 'function') {
                onProgramChanged();
            }
        }
    }
});

// TODO Логика слотов контейнер

function setupSlot(slot) {
    slot.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', function() {
        slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', function(event) {
        event.preventDefault();
        event.stopPropagation();
        slot.classList.remove('drag-over');

        if (!draggedItem) return;

        let element;
        if (sourceZone === 'palette') {
            element = draggedItem.cloneNode(true);
            makeDraggable(element);
            makeDroppable(element);
            element.querySelectorAll('.inner-slot').forEach(s => setupSlot(s));
            setupBlockLogic(element); // логика для влож блоков
        } else {
            element = draggedItem;
        }

        element.classList.remove('dropped');
        element.style.position = 'static';

        slot.appendChild(element);

        onProgramChanged();

        draggedItem = null;
        sourceZone = null;
    });
}

// TODO Логика, тут исправил обработчик на каждый блок

function setupBlockLogic(block) {

    if (block.classList.contains('block-var')) {
        const typeInput = block.querySelector('.type-input');
        const nameInput = block.querySelector('.name-input');

        if (typeInput) typeInput.addEventListener('change', onProgramChanged);
        if (nameInput) nameInput.addEventListener('input', onProgramChanged); // тут как я понял если убрать скобки то оно будет вылазить по событыю а не сразу
    }

    if (block.classList.contains('block-var-array')) {
        const elementTypeInput = block.querySelector('.element-type-input');
        const sizeInput = block.querySelector('.size-input');
        const nameInput = block.querySelector('.name-input');

        if (elementTypeInput) elementTypeInput.addEventListener('change', onProgramChanged); //TODO(добавить возможность делать многомерные массивы)
        if (sizeInput) sizeInput.addEventListener('input', onProgramChanged);
        if (nameInput) nameInput.addEventListener('input', onProgramChanged); // тут как я понял если убрать скобки то оно будет вылазить по событыю а не сразу

    }

    if (block.classList.contains('block-assign')) {
        const varSelect = block.querySelector('.var-input');
        const exprInput = block.querySelector('.expr-input');

        if (varSelect) varSelect.addEventListener('change', onProgramChanged);
        if (exprInput) exprInput.addEventListener('input', onProgramChanged);
    }

    if (block.classList.contains('block-print-var')) {
        const varSelect = block.querySelector('.var-input');
        if (varSelect) varSelect.addEventListener('change', onProgramChanged);
    }

    

    //TODO добавил блок while

    if (block.classList.contains('block-while')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', onProgramChanged);
    }
}

//TODO обновил программы и аст

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
            if (node) {
                updateVarSelectsFromAST(node);
            }
        }

        if (entry.block_type === 'block-while') {
            if (node.body) {
                updateVarSelectsFromAST(node.body); //TODO(не менять, у них в разных местах ast лежит у whiel оно в .body )
            }
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

