const canvas = document.getElementById('canvas');
const palette = document.getElementById('palette');

let draggedItem = null;
let sourceZone = null;  //фигни чтобы помнить что и откуда перетаскичаю

const originalBlocks = document.querySelectorAll('#palette [class^="block"]');
originalBlocks.forEach(block => {
    makeDraggable(block);
})



function makeDraggable(element) {
    element.setAttribute('draggable', 'true');

    element.addEventListener ('dragstart', function(event) {
        draggedItem = element;
        sourceZone = element.parentElement.id === 'palette' ? 'palette' : 'canvas';
        
        event.dataTransfer.effectAllowed = sourceZone === 'palette' ? 'copy' : 'move';
    });
}

function makeDroppable(element) {
    element.addEventListener('drop', function(event){
        event.preventDefault();

        console.log("drop");

        if (sourceZone === 'palette') {
            const clone = draggedItem.cloneNode(true);
            makeDraggable(clone);
            makeDroppable(clone);
            element.insertAdjacentElement('afterend', clone);
        }

        else if (sourceZone === 'canvas') {
            element.insertAdjacentElement('afterend', draggedItem);
        }

        draggedItem = null;
        sourceZone = null;



        // event.stopPropagation();
    });
}
//тут логика для раб обл

canvas.addEventListener('dragover', function(event) {
    event.preventDefault(); 
});

canvas.addEventListener('drop', function(event) {
    event.preventDefault();

    if (sourceZone === 'palette') {
        const clone = draggedItem.cloneNode(true);
        makeDraggable(clone);
        makeDroppable(clone);
        canvas.appendChild(clone);
    }

    else if (sourceZone === 'canvas') {
        canvas.appendChild(draggedItem);
    }

    draggedItem = null;
    sourceZone = null;

});



// щас бахнем логику для палитры 

palette.addEventListener('dragover', function(event) {
    event.preventDefault();
});

palette.addEventListener('drop', function(event){
    event.preventDefault();

    if (sourceZone === 'canvas') {
        draggedItem.remove();
    }

    draggedItem = null;
    sourceZone = null;
});   

 




