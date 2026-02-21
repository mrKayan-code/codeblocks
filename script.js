const canvas = document.getElementById('canvas');
const palette = document.getElementById('palette');

let draggedItem = null;
let sourceZone = null;  //фигни чтобы помнить что и откуда перетаскичаю

const originalBlocks = document.querySelectorAll('#palette [class^="block"]');
originalBlocks.forEach(block => {
    makeDraggable(block);
    // block.querySelectorAll('.inner-slot').forEach(slot => setupSlot(slot)); фикс бага
}); 



function makeDraggable(element) {
    element.setAttribute('draggable', 'true');
    element.addEventListener ('dragstart', function(event) {
        event.stopPropagation();
        draggedItem = element;
        sourceZone = element.closest('#palette') ? 'palette' : 'canvas';
        event.dataTransfer.effectAllowed = sourceZone === 'palette' ? 'copy' : 'move';
        console.log('Тащим блок:', element, 'из зоны:', sourceZone);
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

//тут логика для раб обл

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
                setupBlockLogic(draggedItem);
                canvas.appendChild(draggedItem);                
            }
        }
    
    
    onProgramChanged();
    draggedItem = null;
    sourceZone = null;
});



// щас бахнем логику для палитры 

palette.addEventListener('dragover', (e) => e.preventDefault());
palette.addEventListener('drop', function(event) {
    event.preventDefault();
    if (sourceZone === 'canvas') {
        draggedItem.remove();
    }

    onProgramChanged();

    draggedItem = null;
    sourceZone = null;
}); 


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

        let element;
        if (sourceZone === 'palette') {
            element = draggedItem.cloneNode(true);
            makeDraggable(element);
            makeDroppable(element);
            element.querySelectorAll('.inner-slot').forEach(s => setupSlot(s));
        } else {
            element = draggedItem;
        }

        element.classList.remove('dropped');
        element.style.position = 'static';

        setupBlockLogic(element);
        slot.appendChild(element);
        
        
        onProgramChanged();

        draggedItem = null;
        sourceZone = null;
    });
}


const start_button = document.getElementById('startblock');

start_button.addEventListener('click', () => {
    // reset();
    const canvas = document.getElementById('canvas');

    const ast = buildAST(canvas, null);

    console.log(console.log(JSON.stringify(ast, null, 2)));
});

function setupBlockLogic(block) {

    if (block.classList.contains('block-var')) {
        const typeInput = block.querySelector('.type-input');
        const nameInput = block.querySelector('.name-input');

        if (typeInput) {
            typeInput.addEventListener('change', onProgramChanged());
        }
        if (nameInput) {
            nameInput.addEventListener('input', onProgramChanged());
        }
    }

    if (block.classList.contains('block-assign')) {
        const varSelect = block.querySelector('.var-input');
        const exprInput = block.querySelector('.expr-input');

        if (varSelect) {
            varSelect.addEventListener('change', onProgramChanged);
        }
        if (exprInput) {
            exprInput.addEventListener('input', onProgramChanged);
        }
    }

    if (block.classList.contains('block-print-var')) {
        const varSelect = block.querySelector('.var-input');
        if (varSelect) {
            varSelect.addEventListener('change', onProgramChanged);
        }
    }

    //TODO(для каждого блока в будущем навесить нужные ивенты, которые будут каузить onProgramChanged)
}

function onProgramChanged() {
    const ast = buildProgramASTFromCanvas(canvas);
    updateVarSelectsFromAST(ast);
}

function updateVarSelectsFromAST(ast) {
    const currentScope = ast.scope;

    for (const entry of ast.nodes) {
        const node = entry.node;
        const block = entry.block;

        if (entry.block_type === 'block-assign' || entry.block_type === 'block-print-var') {
            const varNames = currentScope.getNameListOfVisibleVars();
            const select = block.querySelector('.var-input');
            console.log(varNames);
            if (select) {
                fillSelectWithNames(select, varNames);
            }
        }
        if (entry.block_type === 'block-container') {
            updateVarSelectsFromAST(node);
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
    }
}