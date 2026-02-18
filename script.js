const canvas = document.getElementById('canvas');
const palette = document.getElementById('palette');

let draggedItem = null;
let sourceZone = null;  //фигни чтобы помнить что и откуда перетаскичаю

const originalBlocks = document.querySelectorAll('#palette [class^="block"]');
originalBlocks.forEach(block => {
    makeDraggable(block);
    block.querySelectorAll('.inner-slot').forEach(slot => setupSlot(slot));
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
            element.insertAdjacentElement('afterend', clone);
        } else if (sourceZone === 'canvas') {
            element.insertAdjacentElement('afterend', draggedItem);
        }

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
            makeDraggable(clone);
            makeDroppable(clone);
            clone.querySelectorAll('.inner-slot').forEach(slot => setupSlot(slot));
            canvas.appendChild(clone);
        } else if (sourceZone === 'canvas') {
            canvas.appendChild(draggedItem);
        }
    }

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
        slot.appendChild(element);
        
        draggedItem = null;
        sourceZone = null;
    });
}

