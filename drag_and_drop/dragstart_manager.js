import { setDraggedItem } from "./drag_and_drop_state.js";
import { activateBlock } from "./setup_blocks.js";

export function makeDraggable(block) {
    block.setAttribute('draggable', 'true');

    block.addEventListener('dragstart', (event) => {
        event.stopPropagation();
        setDraggedItem(block);
    });
}

export function makeDraggablePaletteBlock(block, trigger_update) {
    block.setAttribute('draggable', 'true');


    block.addEventListener('dragstart', (event) => {
        event.stopPropagation();

        const clone = block.cloneNode(true);
        
        activateBlock(clone, trigger_update);
        
        makeDraggable(clone);

        setDraggedItem(clone);
    });
}