var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');
var center = { x: canvas.width / 2, y: canvas.height / 2 };


function Circle(x, y, radius, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.fillColor;
    c.fill();
}

function Cloud(x, y, dx, cloudWidth, cloudLength) {

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.cloudWidth = cloudWidth;
    this.cloudLength = cloudLength;


    this.draw = function () {
        c.save();
        c.beginPath();
        c.arc(center.x, center.y, 120, 0, Math.PI * 2, false);
        c.clip();
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineCap = 'round';
        c.lineWidth = this.cloudWidth;
        c.lineTo(this.x + this.cloudLength, this.y);
        c.strokeStyle = 'white';
        c.stroke();
        c.restore();
    }
    this.update = function () {
        if (this.x < (center.x - 240)) {
            this.x = center.x + 240;
        }
        this.x -= this.dx;
        this.draw();
    }

}

function Land(x, y, dx, landWidth, landLength) {

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.landWidth = landWidth;
    this.landLength = landLength;


    this.draw = function () {
        c.save();
        c.beginPath();
        c.arc(center.x, center.y, 120, 0, Math.PI * 2, false);
        c.clip();
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineCap = 'round';
        c.lineWidth = this.landWidth;
        c.lineTo(this.x + this.landLength, this.y);
        c.strokeStyle = '#85cc66';
        c.stroke();
        c.restore();
    }
    this.update = function () {
        if (this.x < (center.x - 240)) {
            this.x = center.x + 240;
        }
        this.x -= this.dx;
        this.draw();
    }

}

function SemiCircle(x, y, radius, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 1.5, 1.5, false);
    c.fillStyle = this.fillColor;
    c.fill();
}



function Star(cx, cy, spikes, outerRadius, innerRadius) {
    this.rot = Math.PI / 2 * 3;
    this.x = cx;
    this.y = cy;
    this.spikes = spikes;
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;

    this.step = Math.PI / this.spikes;

    c.strokeSyle = "#000";
    c.beginPath();
    c.moveTo(cx, cy - this.outerRadius)
    for (i = 0; i < this.spikes; i++) {
        this.x = cx;
        this.y = cy;
        x = cx + Math.cos(this.rot) * this.outerRadius;
        y = cy + Math.sin(this.rot) * this.outerRadius;
        c.lineTo(x, y)
        this.rot += this.step

        x = cx + Math.cos(this.rot) * this.innerRadius;
        y = cy + Math.sin(this.rot) * this.innerRadius;
        c.lineTo(x, y)
        this.rot += this.step
    }
    c.lineTo(cx, cy - this.outerRadius)
    c.closePath();
    c.lineWidth = 5;
    c.strokeStyle = 'rgb(32, 66, 136)';
    c.stroke();
    c.fillStyle = 'white';
    c.fill();
}

//Initial object arrays
var earthWidth = 120;
var planets = [{ x: 20, y: 10 }];
var clouds = [{ x: 20, y: 10 }];
var land = [{ x: 20, y: 10 }];
var stars = [{ x: 10, y: 10 }];

function drawStars(a) {
    for (var i = 0; i <= a; ++i) {
        var bestLocation = sample(stars);
        stars.push(new Star(bestLocation[0], bestLocation[1], 4, Math.floor(Math.random() * 4) + 2, 1));
    }
}

function drawPlanets(a) {
    for (var i = 0; i <= a; ++i) {
        var bestLocation = sample(planets);
        planets.push(new Circle(bestLocation[0], bestLocation[1], Math.random() * 5, 'rgb(32, 66, 136)'));
    }
}

function drawClouds(a) {
    for (var i = 0; i <= a; ++i) {
        var bestLocation = earthMask(clouds);
        var cloudWidth = Math.floor(Math.random() * 20) + 5;
        var cloudLength = Math.floor(Math.random() * 30) + 18;
        var dx = (Math.random() + 0.2) * 1;
        clouds.push(new Cloud(bestLocation[0], bestLocation[1], dx, cloudWidth, cloudLength));
    }
}


function drawLand(a) {
    for (var i = 0; i <= a; ++i) {
        var bestLocation = earthMask(land);
        var landWidth = Math.floor(Math.random() * 25) + 10;;
        var landLength = Math.floor(Math.random() * 30) + 18;
        dx = 0.5;
        land.push(new Land(bestLocation[0], bestLocation[1], dx, landWidth, landLength));
    }
}

//Use best candidate algorithm to evenly distribute across the canvas
function sample(samples) {
    var bestCandidate, bestDistance = 0;
    for (var i = 0; i < 20; ++i) {
        var c = [Math.random() * canvas.width, Math.random() * canvas.height],
            d = distance(findClosest(samples, c), c);
        if (d > bestDistance) {
            bestDistance = d;
            bestCandidate = c;
        }
    }
    return bestCandidate;
}

//Use best candidate algorithm to evenly distribute across the earth mask
function earthMask(samples) {
    var bestCandidate, bestDistance = 0;
    //The higher the iteration the better the distribution
    //Performance takes a hit with higher iteration
    for (var i = 0; i < 20; ++i) {
        var c = [Math.floor(Math.random() * ((center.x + 240) - (center.x - 240) + 1)) + (center.x - 240), Math.floor(Math.random() * ((center.y + 120) - (center.y - 120) + 1)) + (center.y - 120)],
            d = distance(findClosest(samples, c), c);
        if (d > bestDistance) {
            bestDistance = d;
            bestCandidate = c;
        }
    }
    return bestCandidate;
}

function distance(a, b) {
    var dx = a.x - b[0],
        dy = a.y - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}


function findClosest(points, b) {
    var distance = null;
    var closestPoint;
    for (var i = 0; i < points.length; ++i) {
        var dx = points[i].x - b[0];
        var dy = points[i].y - b[1];
        if (distance == null) {
            distance = Math.sqrt(dx * dx + dy * dy);
            closestPoint = points[i];
        } else if (distance > Math.sqrt(dx * dx + dy * dy)) {
            distance = Math.sqrt(dx * dx + dy * dy);
            closestPoint = points[i];
        }
    }
    return closestPoint;
}

//Generate how many elements you want
drawPlanets(50);
drawStars(25);
drawClouds(25);
drawLand(15);

// Animate canvas
function animate() {
    requestAnimationFrame(animate);

    for (var i = 0; i < stars.length; i++) {
        Star(stars[i].x, stars[i].y, stars[i].spikes, stars[i].innerRadius, stars[i].outerRadius);
    }
    for (var i = 0; i < planets.length; i++) {
        Circle(planets[i].x, planets[i].y, planets[i].radius, planets[i].fillColor);
    }

    var earth = new Circle(center.x, center.y, earthWidth, 'blue');
    for (var i = 1; i < land.length; i++) {
        land[i].update();
    }
    for (var i = 1; i < clouds.length; i++) {
        clouds[i].update();
    }
    var semi = new SemiCircle(center.x, center.y, earthWidth, 'rgba(0, 0, 0, 0.3)');
}

animate();

(function() {
    /**
       author: @manufosela
       2013/08/27    copyleft 2013
  
       ShootingStar class Main Methods:
       launch: launch shooting stars every N seconds received by              param. 10 seconds by default.
        launchStar: launch a shooting star. Received options                  object by param with:
                 - dir (direction between 0 and 1)
                 - life (between 100 and 400)
                 - beamSize (between 400 and 700)
                 - velocity (between 2 and 10)
    **/
  
    ShootingStar = function(id) {
      this.n = 0;
      this.m = 0;
      this.defaultOptions = {
        velocity: 8,
        starSize: 10,
        life: 300,
        beamSize: 400,
        dir: -1
      };
      this.options = {};
      id = (typeof id != "undefined") ? id : "";
      this.capa = ($(id).lenght > 0) ? "body" : id;
      this.wW = $(this.capa).innerWidth();
      this.hW = $(this.capa).innerHeight();
    };
  
    ShootingStar.prototype.addBeamPart = function(x, y) {
      this.n++;
      var name = this.getRandom(100, 1);
      $("#star" + name).remove();
      $(this.capa).append("<div id='star" + name + "'></div>");
      $("#star" + name).append("<div id='haz" + this.n + "' class='haz' style='position:absolute; color:#FF0; width:10px; height:10px; font-weight:bold; font-size:" + this.options.starSize + "px'>·</div>");
      if (this.n > 1) $("#haz" + (this.n - 1)).css({
        color: "rgba(255,255,255,0.5)"
      });
      $("#haz" + this.n).css({
        top: y + this.n,
        left: x + (this.n * this.options.dir)
      });
    }
  
    ShootingStar.prototype.delTrozoHaz = function() {
      this.m++;
      $("#haz" + this.m).animate({
        opacity: 0
      }, 75);
      if (this.m >= this.options.beamSize) {
        $("#ShootingStarParams").fadeOut("slow");
      }
    }
  
    ShootingStar.prototype.getRandom = function(max, min) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    ShootingStar.prototype.toType = function(obj) {
      if (typeof obj === "undefined") {
        return "undefined"; /* consider: typeof null === object */
      }
      if (obj === null) {
        return "null";
      }
      var type = Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1] || '';
      switch (type) {
        case 'Number':
          if (isNaN(obj)) {
            return "nan";
          } else {
            return "number";
          }
        case 'String':
        case 'Boolean':
        case 'Array':
        case 'Date':
        case 'RegExp':
        case 'Function':
          return type.toLowerCase();
      }
      if (typeof obj === "object") {
        return "object";
      }
      return undefined;
    }
  
    ShootingStar.prototype.launchStar = function(options) {
      if (this.toType(options) != "object") {
        options = {};
      }
      this.options = $.extend({}, this.defaultOptions, options);
      this.n = 0;
      this.m = 0;
      var i = 0,
        l = this.options.beamSize,
        x = this.getRandom(this.wW - this.options.beamSize - 100, 100),
        y = this.getRandom(this.hW - this.options.beamSize - 100, 100),
        self = this;
      for (; i < l; i++) {
        setTimeout(function() {
          self.addBeamPart(x, y);
        }, self.options.life + (i * self.options.velocity));
      }
      for (i = 0; i < l; i++) {
        setTimeout(function() {
          self.delTrozoHaz()
        }, self.options.beamSize + (i * self.options.velocity));
      }
    }
  
    ShootingStar.prototype.launch = function(everyTime) {
      if (this.toType(everyTime) != "number") {
        everyTime = 10;
      }
      everyTime = everyTime * 300;
      this.launchStar();
      var self = this;
      setInterval(function() {
        var options = {
          dir: (self.getRandom(1, 0)) ? 1 : -1,
          life: self.getRandom(400, 100),
          beamSize: self.getRandom(700, 400),
          velocity: self.getRandom(10, 4)
        }
        self.launchStar(options);
      }, everyTime);
    }
  
  })();
  
  $(document).ready(function() {
    var shootingStarObj = new ShootingStar("body");
    shootingStarObj.launch();
  });