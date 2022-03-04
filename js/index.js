/* ------- CLASSES ------- */

class Chronometer {
  constructor() {
    // ... your code goes here
    this.currentTime = 0
    this.intervalId = null
  }

  start(callback) {
    // ... your code goes here
    if(!callback){
      this.intervalId = setInterval( () => this.currentTime++,10)
    } else {
      this.intervalId = setInterval(callback,10)
    }
  }

  getMinutes() {
    // ... your code goes here
    return Math.floor(this.currentTime/(60*100))
  }

  getCentiseconds() {
    // ... your code goes here
    return this.currentTime % 100
  }

  getSeconds() {
    // ... your code goes here
    return Math.floor(this.currentTime/100)
  }

  computeTwoDigitNumber(value) {
    // ... your code goes here
    return String(value).padStart(2, '0')
  }

  stop() {
    // ... your code goes here
    clearInterval(this.intervalId)
  }

  reset() {
    // ... your code goes here
    this.currentTime = 0
  }
}


class Player {
    constructor() {
      this.name = undefined
      this.score = 0
    }
  }

class Snitch {
  constructor() {
    this.size = 1
    this.velocity = 20
    this.vAngle = 0
    this.x = 150
    this.y = 250
    this.radius = 30
    this.color = "yellow"
  }

  draw(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }


/* ------- FUNCTIONS ------- */

function getAdjustedCanvas() {
  /*
    Parameters: none
    Function: adjusts the canvas size to the parent
    Return : canvas context
  */
  let ctx = document.querySelector("canvas#canvas").getContext('2d')
  const canvasElement = document.querySelector("canvas#canvas")
  ctx.canvas.width  = canvasElement.parentNode.offsetWidth
  ctx.canvas.height = canvasElement.parentNode.offsetHeight
  return ctx
}

function clearAll() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawAll() {
  snitch.draw();
}

function moveSnitch() {
  snitch.x = snitch.x + Math.cos(snitch.vAngle)+snitch.velocity;
  snitch.y = snitch.y + Math.sin(snitch.vAngle)+snitch.velocity;
}

function launchGame(){
  clearAll(true)
  moveSnitch()
  drawAll()
}

/* ------- INIT ------- */

const ctx = getAdjustedCanvas()
snitch = new Snitch()
snitch.draw()

setInterval(launchGame, 1000)



