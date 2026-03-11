export function setupBlockLogic(block) {

    const triggerUpdate = () => {
        if (typeof window.onProgramChanged === 'function') {
            window.onProgramChanged();
        }
    };

    if (block.classList.contains('block-var')) {
        const typeInput = block.querySelector('.type-input');
        const nameInput = block.querySelector('.name-input');

        if (typeInput) typeInput.addEventListener('change', triggerUpdate);
        if (nameInput) nameInput.addEventListener('input', triggerUpdate); // тут как я понял если убрать скобки то оно будет вылазить по событыю а не сразу
    }

    if (block.classList.contains('block-var-array')) {
        const elementTypeInput = block.querySelector('.element-type-input');
        const sizeInput = block.querySelector('.size-input');
        const nameInput = block.querySelector('.name-input');

        if (elementTypeInput) elementTypeInput.addEventListener('change', triggerUpdate); //TODO(добавить возможность делать многомерные массивы)
        if (sizeInput) sizeInput.addEventListener('input', triggerUpdate);
        if (nameInput) nameInput.addEventListener('input', triggerUpdate); // тут как я понял если убрать скобки то оно будет вылазить по событыю а не сразу

    }

    if (block.classList.contains('block-assign')) {
        const varSelect = block.querySelector('.var-input');
        const exprInput = block.querySelector('.expr-input');

        if (varSelect) varSelect.addEventListener('change', triggerUpdate);
        if (exprInput) exprInput.addEventListener('input', triggerUpdate);
    }

    if (block.classList.contains('block-print-var')) {
        const varSelect = block.querySelector('.var-input');
        if (varSelect) varSelect.addEventListener('change', triggerUpdate);
    }

    if (block.classList.contains('block-print-expr')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', triggerUpdate);
    }
    //TODO добавил блок while

    if (block.classList.contains('block-while')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', triggerUpdate);
    }

    if (block.classList.contains('block-if')) {
        const exprInput = block.querySelector('.expr-input');
        if (exprInput) exprInput.addEventListener('input', triggerUpdate);
    }
}
