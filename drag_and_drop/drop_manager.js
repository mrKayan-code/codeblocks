import { getDraggedItem, setDraggedItem } from "./drag_and_drop_state.js";

export function makeSlotDroppable(slot, trigger_update) {

    slot.addEventListener('drop', (event) => {
        event.preventDefault();
        // event.stopPropagation();

        slot.classList.remove('drag-over');

        if (getDraggedItem()) {
            const element = getDraggedItem();
            const { anchor_element, position } = getDropPosition(slot, event.clientY);

            if (anchor_element) {
                if (position === 'before') {
                    slot.insertBefore(element, anchor_element);
                } else {
                    anchor_element.insertAdjacentElement('afterend', element);
                }
            } else {
                slot.appendChild(element);
            }
            
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
        // event.stopPropagation();

        if (getDraggedItem()) {
            const element = getDraggedItem();
            const { anchor_element, position } = getDropPosition(canvas, event.clientY);

            if (anchor_element) {
                if (position === 'before') {
                    // anchor_element.insertAdjacentElement('beforebegin', element);
                    canvas.insertBefore(element, anchor_element);
                } else {
                    anchor_element.insertAdjacentElement('afterend', element);
                }
            } else {
                canvas.appendChild(element);
            }
            
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
