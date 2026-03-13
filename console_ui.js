export function setupBlockUI() {
    const consoleContainer = document.getElementById('console');
    const toggleConsoleBtn = document.getElementById('toggle-console');

    if (!toggleConsoleBtn || !consoleContainer) return;

    if (localStorage.getItem('consoleCollapsed') === 'true') {
        consoleContainer.classList.add('collapsed');
    }

    toggleConsoleBtn.addEventListener('click', () => {
        consoleContainer.classList.toggle('collapsed');

        const isCollapsed = consoleContainer.classList.contains('collapsed');
        localStorage.setItem('consoleCollapsed', isCollapsed);
    });

}