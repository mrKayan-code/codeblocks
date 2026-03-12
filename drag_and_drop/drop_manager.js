import { getDraggedItem, setDraggedItem } from "./drag_and_drop_state.js";


export function makeBlockDroppable(block, trigger_update) {
    block.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const element = getDraggedItem();

        block.insertAdjacentElement('afterend', element); //TODO(вместо afterend еще нужно будет добавить beforebegin если бросили на верхнюю часть)
    
        trigger_update();
        setDraggedItem(null);
    });
} //TODO(нужно попробовать обойтись без этой функции)

export function makeSlotDroppable(slot, trigger_update) {
    slot.classList.remove('drag-over');

    slot.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    slot.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const element = getDraggedItem();

        slot.appendChild(element);
        
        trigger_update();
        setDraggedItem(null);
    });
}

export function makeCanvasDroppable(canvas, trigger_update) {
    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    canvas.addEventListener('drop', (event) => {
            
        event.preventDefault();
        // event.stopPropagation();

        const element = getDraggedItem();

        console.log(`Сейчас положим: ${element}`);
        canvas.appendChild(element);
        
        trigger_update();
        setDraggedItem(null);
    });
}

export function makePaletteDroppable(palette) {

    palette.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    palette.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();

        getDraggedItem().remove();
        
        setDraggedItem(null);
    });

}
