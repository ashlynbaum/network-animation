var width, height, largeHeader, canvas, ctx, circles, target, animateHeader = true;

// Main
initHeader();
addListeners();

function initHeader() {
    width = window.innerWidth - 25;
    height = window.innerHeight;
    target = {x: 0, y: height};

    largeHeader = document.getElementById('large-header');
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
function addListeners() {
    window.addEventListener('resize', resize);
}

function resize() {
    width = window.innerWidth - 25;
    height = window.innerHeight;
    largeHeader.style.height = height +'px';
    canvas.width = width;
    canvas.height = height;
}

// min and max radius, radius threshold and percentage of filled circles
var radMin = 30,
  radMax = 60,
  // filledCircle = 60, //percentage of filled circles
  // concentricCircle = 30, //percentage of concentric circles
  radThreshold = 25; //IFF special, over this radius concentric, otherwise filled

//min and max speed to move
var speedMin = 0.05,
  speedMax = 0.2;

//max reachable opacity for every circle and blur effect
var maxOpacity = 0.5;

//default palette choice
var backgroundMlt = 0.85;
var sourceImg = ["./img/user4-compressor.svg","./img/user5-compressor.svg","./img/user6-compressor.svg", "./img/user7-compressor.svg"];

//min distance for links
var linkDist = 300,
  lineBorder = 2.5;

//most importantly: number of overall circles and arrays containing them
var maxCircles = 15,
  points = [],
  pointsBack = [];

//populating the screen
for (var i = 0; i < maxCircles * 2; i++) points.push(new Circle());
for (var i = 0; i < maxCircles; i++) pointsBack.push(new Circle(true));

//experimental vars
var circleExp = 1,
  circleExpMax = 1.003,
  circleExpMin = 0.997,
  circleExpSp = 0.00004;

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
  // randomly pick images from sourceImg
  var rand = Math.floor( ( Math.random() * sourceImg.length ) );
  this.img.src = (sourceImg[rand])
};

Circle.prototype.init = function() {
  Circle.call(this, this.background);
}

//support functions
//generate random int a<=x<=b
function randint(a, b) {
    return Math.floor(Math.random() * (b - a + 1) + a);
  }
  //generate random float
function randRange(a, b) {
    return Math.random() * (b - a) + a;
  }
  //generate random float more likely to be close to a
function hyperRange(a, b) {
  return Math.random() * Math.random() * Math.random() * (b - a) + a;
}


//rendering function
function drawCircle(ctx, circle) {
  circle.x += circle.speedx;
  circle.y += circle.speedy;
  if (circle.opacity < (circle.background ? maxOpacity : 1)) circle.opacity += 0.01;
  circle.ttl--;
  ctx.drawImage(circle.img, circle.x-circle.radius, circle.y-circle.radius,circle.radius*2,circle.radius*2);
}

//initializing function
function init() {
  window.requestAnimationFrame(draw);
}


// Draw connecting lines
var drawLines = function (first) {
  var distance, xi, yi, xj, yj;
  for (j = 0; j < first.closest.length - 1; j++){
    distance = getDistance(first, first.closest[j]);
    xi = (first.x < first.closest[j].x ? 1 : -1) * Math.abs(first.radius * distance.deltaX / distance.dist);
    yi = (first.y < first.closest[j].y ? 1 : -1) * Math.abs(first.radius * distance.deltaY / distance.dist);
    xj = (first.x < first.closest[j].x ? -1 : 1) * Math.abs(first.radius * distance.deltaX / distance.dist);
    yj = (first.y < first.closest[j].y ? -1 : 1) * Math.abs(first.radius * distance.deltaY / distance.dist);
    ctx.beginPath();
    ctx.moveTo(first.x + xi, first.y + yi);
    ctx.lineTo(first.closest[j].x + xj, first.closest[j].y + yj);
    ctx.strokeStyle = (first.background ? "rgba(4, 128, 184, 0.85)" : "rgba(4, 128, 184, 0.52)");;
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

  //function to render each single circle, its connections and to manage its out of boundaries replacement
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

    // find five closest points
    for (var i =0; i < arr.length; i++) {
      var closest = []
      var first = arr[i];
      for (var j = i + 1; j < arr.length; j ++) {
        var second = arr[j]
        if (first !== second) {
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
              if (getDistance(first, second).dist >= first.radius + second.radius) {
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

    var getDistance = function(pointOne, pointTwo) {
      var deltax = pointTwo.x - pointOne.x;
      var deltay = pointTwo.y - pointOne.y;
      var dist = Math.pow(Math.pow(deltax, 2) + Math.pow(deltay, 2), 0.5);
    };
    // find five closest points
    for (var i =0; i < arr.length - 1; i++) {
      var closest = []
      var first = arr[i];
      for (var j = i + 1; j < arr.length; j ++) {
        var second = arr[j]
        if (first !== second) {
          var placed = false
          for (var k = 0; k < 5; k++) {
            if(!placed) {
              if(closest[k] == undefined) {
                closest[k] = second;
                placed = true;
              }
            }
          }
          for (var k = 0; k < 5; k ++) {
            if(!placed) {
              // TODO: create get distance function
              // TODO: if circles are not overlapping
              // if (dist <= arr[i].radius + arr[j].radius) continue;
              if (getDistance(first, second) < getDistance(first, closest[k])){
                closest[k] = second
                placed = true
              }
            }
          }
        }
      }
      first.closest = closest;
      drawLines(arr, first);
    }

    // debugger
  }

    // end of 5 closest refactor

    // for (var i = 0; i < arr.length - 1; i++) {
    //   for (var j = i + 1; j < arr.length; j++) {
    //     var deltax = arr[i].x - arr[j].x;
    //     var deltay = arr[i].y - arr[j].y;
    //     var dist = Math.pow(Math.pow(deltax, 2) + Math.pow(deltay, 2), 0.5);
    //     //if the circles are overlapping, no laser connecting them
    //     if (dist <= arr[i].radius + arr[j].radius) continue;
    //     //otherwise we connect them only if the dist is < linkDist
    //     if (dist < linkDist) {
    //       var xi = (arr[i].x < arr[j].x ? 1 : -1) * Math.abs(arr[i].radius * deltax / dist);
    //       var yi = (arr[i].y < arr[j].y ? 1 : -1) * Math.abs(arr[i].radius * deltay / dist);
    //       var xj = (arr[i].x < arr[j].x ? -1 : 1) * Math.abs(arr[j].radius * deltax / dist);
    //       var yj = (arr[i].y < arr[j].y ? -1 : 1) * Math.abs(arr[j].radius * deltay / dist);
    //       ctx.beginPath();
    //       ctx.moveTo(arr[i].x + xi, arr[i].y + yi);
    //       ctx.lineTo(arr[j].x + xj, arr[j].y + yj);
    //       var samecolor = arr[i].color == arr[j].color;
    //       ctx.strokeStyle = ["rgba(", arr[i].borderColor, ",", Math.min(arr[i].opacity, arr[j].opacity) * ((linkDist - dist) / linkDist)/10, ")"].join("");
    //       ctx.lineWidth = (arr[i].background ? lineBorder * backgroundMlt : lineBorder) * ((linkDist - dist) / linkDist); //*((linkDist-dist)/linkDist);
    //       ctx.stroke();
    //     }
    //   }
    // }
  // }

  var startTime = Date.now();
  renderPoints(ctxfr, points);
  renderPoints(ctxbg, pointsBack);
  deltaT = Date.now() - startTime;

  ctxfr.restore();
  ctxbg.restore();

  window.requestAnimationFrame(draw);
}

init();
