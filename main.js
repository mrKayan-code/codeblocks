import { buildUIASTFromCanvas } from "./uiast.js";
import { buildASTFromCanvas } from "./ast.js";
import InterpretatorManager from "./worker_manager.js";
import { setupBlockLogic } from "./iventls.js";
import { onProgramChanged } from "./program_state.js";

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

// TODO Функция после сего надо вообще бросить блок

function getDragAfterElement (container, y) {
    const draggableElement = [...container.querySelectorAll('[class^="block"]:not(.dragging), .block:not(.dragging)')];
    return draggableElement.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child};
        } else {
            return closest;
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element;
}


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

        setTimeout(() => element.classList.add('dragging'), 0);
    });

    element.addEventListener('dragend',function(){
        element.classList.remove('dragging');
        draggedItem = null;
    })
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
            setupBlockLogic(clone, onProgramChanged);

            element.insertAdjacentElement('afterend', clone);
        } else if (sourceZone === 'canvas') {
            setupBlockLogic(element, onProgramChanged);
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

    if (sourceZone === 'canvas' && draggedItem) {
        const afterElement = getDragAfterElement(canvas, event.clientY);
        if(afterElement == null) {
            canvas.appendChild(draggedItem);
        }
        else {
            canvas.insertBefore(draggedItem, afterElement);
        }
    }
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
                setupBlockLogic(clone, onProgramChanged);

                const afterElement = getDragAfterElement(canvas,event.clientY);
                if (afterElement == null) {
                    canvas.appendChild(clone);
                }
                else {
                    canvas.insertBefore(clone,afterElement);
                }

            } else if (sourceZone === 'canvas') {
                setupBlockLogic(draggedItem, onProgramChanged);
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
            setupBlockLogic(element, onProgramChanged); // логика для влож блоков
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


//TODO обновил программы и аст


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

