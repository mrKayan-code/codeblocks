import { makeSlotDroppable } from "./drop_manager.js";

export function activateBlock(block, trigger_update) {
    setupBlockLogic(block, trigger_update);
    
    block.querySelectorAll('.inner-slot').forEach(slot => setupSlot(slot, trigger_update));
}

function setupSlot(slot, trigger_update) {
    slot.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', function() {
        slot.classList.remove('drag-over');
    });

    makeSlotDroppable(slot, trigger_update)

}

function setupBlockLogic(block, trigger_update) {

    if (block.classList.contains('block-var')) {
        const typeInput = block.querySelector('.type-input');
        const nameInput = block.querySelector('.name-input');

        if (typeInput) typeInput.addEventListener('change', trigger_update);
        if (nameInput) nameInput.addEventListener('input', trigger_update);
    }

    if (block.classList.contains('block-var-array')) {
        const elementTypeInput = block.querySelector('.element-type-input');
        const sizeInput = block.querySelector('.size-input');
        const nameInput = block.querySelector('.name-input');

        if (elementTypeInput) elementTypeInput.addEventListener('change', trigger_update); //TODO(добавить возможность делать многомерные массивы)
        if (sizeInput) sizeInput.addEventListener('input', trigger_update);
        if (nameInput) nameInput.addEventListener('input', trigger_update); 
    }

    if (block.classList.contains('block-assign')) {
        const varSelect = block.querySelector('.var-input');
        const exprInput = block.querySelector('.expr-input');

        if (varSelect) varSelect.addEventListener('change', trigger_update);
        if (exprInput) exprInput.addEventListener('input', trigger_update);
    }

    if (block.classList.contains('block-print-var')) {
        const varSelect = block.querySelector('.var-input');
        if (varSelect) varSelect.addEventListener('change', trigger_update);
    }

    if (block.classList.contains('block-print-expr')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', trigger_update);
    }
    //TODO добавил блок while

    if (block.classList.contains('block-while')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', trigger_update);
    }

    if (block.classList.contains('block-if')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', trigger_update);
    }

    if (block.classList.contains('block-for')) {
        const typeInput = block.querySelector('.type-input');
        const nameInput = block.querySelector('.name-input');
        const initExprInput = block.querySelector('.init-expr-input');
        const conditionInput = block.querySelector('.condition-input');
        const varInput = block.querySelector('.counter-var-input');
        const stepExprInput = block.querySelector('.step-expr-input');

        if (typeInput) typeInput.addEventListener('change', trigger_update);
        if (nameInput) nameInput.addEventListener('input', trigger_update);
        if (initExprInput) initExprInput.addEventListener('input', trigger_update);
        if (conditionInput) conditionInput.addEventListener('input', trigger_update);
        if (varInput) varInput.addEventListener('change', trigger_update);
        if (stepExprInput) stepExprInput.addEventListener('input', trigger_update);
        
    }

}
