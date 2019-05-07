//Logic for the canvas element
//3 mouse events
//mouse down, mouse move, mouse up
//inside the canvas coordinates to check where the mouse is
//Set a canvas with two-dimensional context//

// CANVAS ELEMENT

const canvasSignature = document.getElementById('canvas');
const ctx = canvasSignature.getContext('2d');
//Setting position X and Y
function dotMoving(x,y) {
    ctx.lineTo(x,y);
    ctx.stroke();
}

function moveMouse(e) {
    dotMoving(e.offsetX, e.offsetY);
}

//Event listener to start drawning
canvasSignature.addEventListener('mousedown', function(e) {
    ctx.moveTo(e.offsetX, e.offsetY);
    canvasSignature.addEventListener('mousemove', moveMouse);
});

//When mouse is up stops drawing
canvasSignature.addEventListener('mouseup', function(e) {
    canvasSignature.removeEventListener('mousemove', moveMouse);
    var signatureOk = canvasSignature.toDataURL();
    document.querySelector('input[type="hidden"]').value = signatureOk;
});
