var width, height, largeHeader, canvas, ctx, circles, target, animateHeader = true;

// Init example svg image
var img = new Image();

img.src = "./img/flower.svg";



// Main
initHeader();

function initHeader() {
    width = window.innerWidth;
    height = window.innerHeight;
    target = {x: 0, y: height};

    largeHeader = document.getElementById('large-header');
    largeHeader.style.height = height+'px';

    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    img.onload = function() {
    ctx.drawImage(img, 0, 50);
    }
}