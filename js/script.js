var width, height, largeHeader, canvas, ctx, circles, target, animateHeader = true;

var initWindow =function() {
    width = window.innerWidth;
    height = window.innerHeight;
    target = {x: 0, y: height};

    largeHeader = document.getElementById('sign-in-container');
    largeHeader.style.height = height +'px';

    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    canvasbg = document.getElementById('canvasbg');
    canvasbg.width = width;
    canvasbg.height = height;
    ctxbg = canvas.getContext('2d');
}

// Event handling
var addListeners =function() {
    window.addEventListener('resize', resize);
}

var resize = function() {
    width = window.innerWidth - 25;
    height = window.innerHeight;
    largeHeader.style.height = height +'px';
    canvas.width = width;
    canvas.height = height;
}

// define variables

// min and max radius, radius threshold and percentage of filled circles
var radMin = 30,
  radMax = 60,
  radThreshold = 25;

//min and max speed to move
var speedMin = 0.1,
  speedMax = 0.25;

//max reachable opacity for every circle and blur effect
var maxOpacity = 0.5;

//default palette choice
var backgroundMlt = 0.85;
var sourceImg = [ "./img/user4-compressor.svg","./img/user5-compressor.svg","./img/user6-compressor.svg", "./img/user7-compressor.svg"];

//min distance for links
var linkDist = 300,
  lineBorder = 2;

//number of overall circles and arrays containing them
var maxCircles = 15,
  points = [],
  pointsBack = [];

//experimental vars
var circleExp = 1,
  circleExpMax = 1.003,
  circleExpMin = 0.997,
  circleExpSp = 0.00004;

//support functions
//generate random int a<=x<=b
var randint = function(a, b) {
    return Math.floor(Math.random() * (b - a + 1) + a);
  }
  //generate random float
var randRange = function(a, b) {
    return Math.random() * (b - a) + a;
  }
  //generate random float more likely to be close to a
var hyperRange = function(a, b) {
  return Math.random() * Math.random() * Math.random() * (b - a) + a;
}

// Rendering icon circles
var drawCircle = function(ctx, circle) {
  circle.x += circle.speedx;
  circle.y += circle.speedy;
  if (circle.opacity < (circle.background ? maxOpacity : 1)) circle.opacity += 0.01;
  circle.ttl--;
  ctx.drawImage(circle.img, circle.x-circle.radius, circle.y-circle.radius,circle.radius*2,circle.radius*2);
}

// Draw connecting lines to icons
var drawLines = function (first) {
  var distance, xi, yi, xj, yj;
  for (j = 0; j < first.closest.length - 1; j++){
    distance = getDistance(first, first.closest[j]);
    xi = (first.x < first.closest[j].x ? 1 : -1) * Math.abs(first.radius * distance.deltaX / distance.dist);
    yi = (first.y < first.closest[j].y ? 1 : -1) * Math.abs(first.radius * distance.deltaY / distance.dist);
    xj = (first.x < first.closest[j].x ? -1 : 1) * Math.abs(first.closest[j].radius * distance.deltaX / distance.dist);
    yj = (first.y < first.closest[j].y ? -1 : 1) * Math.abs(first.closest[j].radius * distance.deltaY / distance.dist);
    ctx.beginPath();
    ctx.moveTo(first.x + xi, first.y + yi);
    ctx.lineTo(first.closest[j].x + xj, first.closest[j].y + yj);
    ctx.strokeStyle = (first.background ? "rgba(4, 128, 184, 0.15)" : "rgba(4, 128, 184, 0.50)");;
    ctx.lineWidth = (first.background ? lineBorder * backgroundMlt : lineBorder) * ((linkDist - distance.dist) / linkDist);
    ctx.stroke();
  };
};

var getDistance = function(pointOne, pointTwo) {
  var deltax = pointTwo.x - pointOne.x;
  var deltay = pointTwo.y - pointOne.y;
  var dist = Math.pow(Math.pow(deltax, 2) + Math.pow(deltay, 2), 0.5);
  return { deltaX: deltax, deltaY: deltay, dist: dist}
};

// Setup Window
initWindow();
addListeners();
resize();

//circle class
function Circle(background) {
  //if background, it has different rules
  this.background = (background || false);
  this.x = randRange(-canvas.width / 2, canvas.width / 2);
  this.y = randRange(-canvas.height / 2, canvas.height / 2);
  this.radius = background ? hyperRange(radMin, radMax) * backgroundMlt : hyperRange(radMin, radMax);
  this.speed = (background ? randRange(speedMin, speedMax) / backgroundMlt : randRange(speedMin, speedMax)); // * (radMin / this.radius);
  this.speedAngle = Math.random() * 2 * Math.PI;
  this.speedx = Math.cos(this.speedAngle) * this.speed;
  this.speedy = Math.sin(this.speedAngle) * this.speed;
  var spacex = Math.abs((this.x - (this.speedx < 0 ? -1 : 1) * (canvas.width / 2 + this.radius)) / this.speedx),
    spacey = Math.abs((this.y - (this.speedy < 0 ? -1 : 1) * (canvas.height / 2 + this.radius)) / this.speedy);
  this.ttl = Math.min(spacex, spacey);
  this.img = new Image();
  // randomly pick images from sourceImg array
  var rand = Math.floor( ( Math.random() * sourceImg.length ) );
  this.img.src = (sourceImg[rand])
};

Circle.prototype.init = function() {
  Circle.call(this, this.background);
}

//populating the screen
for (var i = 0; i < maxCircles * 2; i++) points.push(new Circle());
for (var i = 0; i < maxCircles; i++) pointsBack.push(new Circle(true));

//initializing function
function init() {
  window.requestAnimationFrame(draw);
}

// //rendering function
function draw() {
  var ctxfr = document.getElementById('canvas').getContext('2d');
  var ctxbg = document.getElementById('canvasbg').getContext('2d');

  ctxfr.globalCompositeOperation = 'destination-over';
  ctxfr.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctxbg.globalCompositeOperation = 'destination-over';
  ctxbg.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  ctxfr.save();
  ctxfr.translate(canvas.width / 2, canvas.height / 2);
  ctxbg.save();
  ctxbg.translate(canvas.width / 2, canvas.height / 2);

  // render each circle and draws the connecting lines
  function renderPoints(ctx, arr) {
    for (var i = 0; i < arr.length; i++) {
      var circle = arr[i];
      //checking if out of boundaries
      if (circle.ttl<0) {}
      var xEscape = canvas.width / 2 + circle.radius,
        yEscape = canvas.height / 2 + circle.radius;
      if (circle.ttl < -20) arr[i].init(arr[i].background);
      drawCircle(ctx, circle);
    }

    // find two closest circles
    for (var i =0; i < arr.length; i++) {
      var closest = []
      var first = arr[i];
      for (var j = i + 1; j < arr.length; j ++) {
        var second = arr[j]
        // set max distance of connecting lines
        if (first !== second && getDistance(first, second).dist < 500) {
          var placed = false
          for (var k = 0; k < 2; k++) {
            // assign initial circles as closest circles.
            if(!placed) {
              if(closest[k] == undefined) {
                closest[k] = second;
                placed = true;
              }
            }
          }
          for (var k = 0; k < 2; k ++) {
            if(!placed) {
              // if circles are not overlapping
              if (getDistance(first, second).dist >= first.radius + second.radius ) {
                // identify closest circles
                if (getDistance(first, second).dist < getDistance(first, closest[k]).dist){
                  closest[k] = second
                  placed = true
                }
              }
            }
          }
        }
      }
      first.closest = closest;
      drawLines(first);
    }
  }

  var startTime = Date.now();
  renderPoints(ctxfr, points);
  renderPoints(ctxbg, pointsBack);
  deltaT = Date.now() - startTime;

  ctxfr.restore();
  ctxbg.restore();

  window.requestAnimationFrame(draw);
}

init();