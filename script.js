const canvas = document.getElementById('canvas');
const blocks = document.querySelectorAll('#palette .block');


blocks.forEach(block => {
    block.addEventListener('dragstart', dragStart);
});

canvas.addEventListener('dragover', function(event) {
    event.preventDefault();
});

canvas.addEventListener('drop', function(event) {
    // event.preventDefault();

    const text = event.dataTransfer.getData('text/plain');

    const dropped = document.createElement('div');
    dropped.className = 'block';
    dropped.textContent = text;

    canvas.appendChild(dropped);
});

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.textContent);
    console.log(event.target.textContent)
}



