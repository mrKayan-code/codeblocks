let dragged_item = null;


export function setDraggedItem(value) {
    dragged_item = value;
    console.log(`в dragged_item положили ${dragged_item}`);
}

export function getDraggedItem() {
    console.log(`из dragged_item достали ${dragged_item}`);
    return dragged_item;
}
