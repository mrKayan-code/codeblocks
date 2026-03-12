export function setupBlockLogic(block, program_change_trigger) {

    // const triggerUpdate = () => {
    //     if (typeof window.onProgramChanged === 'function') {
    //         window.onProgramChanged();
    //     }
    // };
    
    if (block.classList.contains('block-var')) {
        const typeInput = block.querySelector('.type-input');
        const nameInput = block.querySelector('.name-input');

        if (typeInput) typeInput.addEventListener('change', program_change_trigger);
        if (nameInput) nameInput.addEventListener('input', program_change_trigger); // тут как я понял если убрать скобки то оно будет вылазить по событыю а не сразу
    }

    if (block.classList.contains('block-var-array')) {
        const elementTypeInput = block.querySelector('.element-type-input');
        const sizeInput = block.querySelector('.size-input');
        const nameInput = block.querySelector('.name-input');

        if (elementTypeInput) elementTypeInput.addEventListener('change', program_change_trigger); //TODO(добавить возможность делать многомерные массивы)
        if (sizeInput) sizeInput.addEventListener('input', program_change_trigger);
        if (nameInput) nameInput.addEventListener('input', program_change_trigger); // тут как я понял если убрать скобки то оно будет вылазить по событыю а не сразу

    }

    if (block.classList.contains('block-assign')) {
        const varSelect = block.querySelector('.var-input');
        const exprInput = block.querySelector('.expr-input');

        if (varSelect) varSelect.addEventListener('change', program_change_trigger);
        if (exprInput) exprInput.addEventListener('input', program_change_trigger);
    }

    if (block.classList.contains('block-print-var')) {
        const varSelect = block.querySelector('.var-input');
        if (varSelect) varSelect.addEventListener('change', program_change_trigger);
    }

    if (block.classList.contains('block-print-expr')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', program_change_trigger);
    }
    //TODO добавил блок while

    if (block.classList.contains('block-while')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', program_change_trigger);
    }

    if (block.classList.contains('block-if')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', program_change_trigger);
    }
}
