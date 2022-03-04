/* ------- GLOBAL VARIABLES ------- */

const startButton = document.querySelector(".start-btn")
//const ctx = getAdjustedCanvas()
const canvasElement = document.querySelector("canvas#canvas")
const ctx = document.querySelector("canvas#canvas").getContext('2d')
ctx.canvas.width  = canvasElement.parentNode.offsetWidth
ctx.canvas.height = canvasElement.parentNode.offsetHeight

let snitchImg = new Image()
snitchImg.src = '../styles/images/golden_snitch.png'
let sizeCoefficient = 0.01



/* ------- CLASSES ------- */


class Game {
  constructor() {
    this.score = 0
    this.time = 30
    this.clockIntervalId = null
    this.gameIntervalId = null
    this.isOn = false
  }

  start() {
    this.clockIntervalId = setInterval( () => this.time--,1000)
    this.gameIntervalID = setInterval(refresh, 100)
    this.isOn=true
    }

  stop() {
    clearInterval(this.clockIntervalId)
    clearInterval(this.gameIntervalID)
    this.isOn=false
  }

  getSeconds() {
    return this.time
  }

  isElapsedTime(){
    if (this.time <= 0){
      return true
    }
    else {
      return false
    }
  }

}

class Snitch {
  constructor() {
    this.x = ctx.canvas.width/2
    this.y = ctx.canvas.height/2
    this.img = snitchImg
    this.velocity = 50
    this.vAngle = Math.PI/4  
    this.width = snitchImg.width *sizeCoefficient
    this.height = snitchImg.height * sizeCoefficient
    this.initWidth = snitchImg.width * sizeCoefficient
    this.initHeight = snitchImg.height * sizeCoefficient
    this.Z = 0
    this.sizeEffect = 0
    this.color = "yellow" 
  }


  stop(){
    this.velocity = 0
  }

  draw(){
      ctx.drawImage(this.img, this.x, this.y, this.width,this.height)
    }

  reset(){
    this.x = ctx.canvas.width*2/10 +  Math.random()*(ctx.canvas.width*6/10)
    this.y = ctx.canvas.height*2/10 + Math.random()*(ctx.canvas.height*6/10)
    this.width = this.initWidth
    this.height = this.initHeight
  }

  move() {
    snitch.vAngle += Math.PI/8 
  
    snitch.x = snitch.x + Math.cos(snitch.vAngle)*snitch.velocity;
    snitch.y = snitch.y + Math.sin(snitch.vAngle)*snitch.velocity;
  
  }

  moveZ() {
      this.Z = 4*Math.sin(this.sizeEffect)
      this.width = this.initWidth * (1 + this.Z )
      this.height = this.initHeight * (1 + this.Z )
      this.sizeEffect += Math.PI*0.1
    return 
  }

  isCaught(clickX,clickY){
    let x0 = this.x + this.width/2
    let y0 = this.y + this.height/2
    let radius = this.width/2

    if (((clickX-x0)**2+(clickY-y0)**2) <= radius**2){
      return true
    } else {
      return false
    }
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


function updateTimer(){
  document.querySelector(".chronometer-container").textContent = game.getSeconds()
}

function updateScore(){
  if (game.isOn){
    document.querySelector(".start-btn").textContent = game.score
  }
}

function endGame(){
  game.stop()
  snitch.stop()
  document.querySelector(".start-btn").textContent = "START"
}

function refresh(){
  clearAll()
  updateScore()
  updateTimer()
  snitch.move()
  snitch.moveZ()
  if (game.isElapsedTime()){
    endGame()
  }

  drawAll()
}

function launchGame(event){
  if (event.target.textContent === "START"){
    snitch = new Snitch()
    game = new Game()
    game.start()
  }
}


function tryToCatch(event){
  const rect = canvas.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  if (snitch.isCaught(clickX,clickY)){
    game.score++
    snitch.reset()
  }
  
}


/* ------- LISTENERS ------- */

startButton.addEventListener('click',launchGame)

canvasElement.addEventListener('mousedown', function(event) {
  tryToCatch(event)
})

/* ------- INIT ------- */






