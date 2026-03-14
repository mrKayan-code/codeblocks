import { getDraggedItem, setDraggedItem } from "./drag_and_drop_state.js";

export function makeSlotDroppable(slot, trigger_update) {

    slot.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();

        slot.classList.remove('drag-over');

        if (getDraggedItem()) {
            drop(event, slot, getDraggedItem());
            
            trigger_update();
            setDraggedItem(null);
        }
        
    });
}

export function makeCanvasDroppable(canvas, trigger_update) {
    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    canvas.addEventListener('drop', (event) => {            
        event.preventDefault();

        if (getDraggedItem()) {
            drop(event, canvas, getDraggedItem());
            
            trigger_update();
            setDraggedItem(null);
        }
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

function drop(event, container, element) {
    const { anchor_element, position } = getDropPosition(container, event.clientY);

    if (anchor_element) {
        if (position === 'before') {
            container.insertBefore(element, anchor_element);
        } else {
            anchor_element.insertAdjacentElement('afterend', element);
        }
    } else {
        container.appendChild(element);
    }
}


function getDropPosition(container, mouseY) {
    // const blocks = [...container.querySelectorAll('[class^="block"]')];
    const blocks = Array.from(container.children);

    if (blocks.length === 0)  {
        return { before: null, after: null }
    };
    
    let closest = { offset: Infinity, anchor_element: null, position: 'after' };
    
    for (const block of blocks) {
        const rect = block.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const offset = mouseY - blockCenter;
        
        if (Math.abs(offset) < Math.abs(closest.offset)) {
            closest = {
                offset: offset,
                anchor_element: block,
                position: offset < 0 ? 'before' : 'after'
            };
        }
    }
    
    return closest;
}
