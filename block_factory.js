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

