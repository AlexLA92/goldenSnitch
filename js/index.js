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
    this.x = ctx.canvas.width/2
    this.y = ctx.canvas.height/2
    this.img = new Image()
    this.img.src = '../styles/images/golden_snitch.png';
    this.velocity = 50
    this.vAngle = Math.PI/4    
    this.width = 150
    this.height = 50
    this.size = 1
    this.color = "yellow"
    
    this.imgRatio = this.img.width / this.img.height
  }

  draw(){
      ctx.drawImage(this.img, this.x, this.y, this.width,this.width/this.imgRatio)
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
  snitch.vAngle += Math.PI/200 + Math.random()*Math.PI

  snitch.x = snitch.x + Math.cos(snitch.vAngle)*snitch.velocity;
  snitch.y = snitch.y + Math.sin(snitch.vAngle)*snitch.velocity;

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

setInterval(launchGame, 100)



