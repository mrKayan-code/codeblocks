import { setupBlockLogic } from "./iventls.js";

export function setupNewBlock(block, program_change_trigger) {
    block.classList.remove('dragging');
    block.classList.remove('drag-ghost');

    block.setAttribute('draggable', 'true');

    setupBlockLogic(block, program_change_trigger);

    block.querySelectorAll('.inner-slot').forEach(slot => {
        setupSlot(slot, onProgramChanged);
    });
}

export function cloneBlockFromPalette(block, program_change_trigger) {
    const clone = block.cloneNode(true);
    return setupNewBlock(clone, program_change_trigger);
}


function setupSlot(slot, program_change_trigger) {
    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        slot.classList.remove('drag-over');

        const { draggedItem, sourceZone } = window.__dndState || {};
        if (!draggedItem) return;

        let element;
        if (sourceZone === 'palette') {
            element = cloneBlockFromPalette(draggedItem, program_change_trigger);
        } else {
            element = draggedItem;
        }

        element.style.position = 'static';
        slot.appendChild(element);
        onProgramChanged();
    });
}