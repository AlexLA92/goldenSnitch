/* ------- GLOBAL VARIABLES ------- */

const startButton = document.querySelector(".start-btn")
//const ctx = getAdjustedCanvas()
const canvasElement = document.querySelector("canvas#canvas")
const ctx = document.querySelector("canvas#canvas").getContext('2d')
ctx.canvas.width  = canvasElement.parentNode.offsetWidth
ctx.canvas.height = canvasElement.parentNode.offsetHeight

let snitchImg = new Image()
snitchImg.src = '../styles/images/golden_snitch.png'
let sizeCoefficient = 0.03


/* ------- CLASSES ------- */
class Game {
  constructor() {
    this.score = 0
    this.time = 10
    this.clockIntervalId = null
    this.gameIntervalId = null
    this.isOn = false
    this.fps = 100
  }

  start() {
    this.clockIntervalId = setInterval( () => this.time--,1000)
    this.gameIntervalID = setInterval(refresh, (1 / this.fps) * 1000 )
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

    this.width = snitchImg.width *sizeCoefficient
    this.height = snitchImg.height * sizeCoefficient
    this.initWidth = snitchImg.width * sizeCoefficient
    this.initHeight = snitchImg.height * sizeCoefficient
    this.Z = 1
    this.previousZ = 1
    this.nextZ = 1

    this.velocity = 15
    this.transitionDuration = 0

    this.vAngle = 0 
    this.rotationPerSec = 15
    this.rotationRadius = 5

    this.isChangingZone = false
    this.changeZoneTimeout = null
  }

  setChangeZoneState(){
    this.isChangingZone = true

    this.transitionDuration = 150+Math.random()*250
    this.previousZ = this.nextZ
    this.Z = this.previousZ
    this.nextZ = 0.0 + Math.random()
    this.changeZoneTimeout = setTimeout(() => this.setStayPutState(),this.transitionDuration)
    console.log('previousZ', this.previousZ)
    console.log('nextZ', this.nextZ)
  }
  
  setStayPutState(){
    this.isChangingZone = false
    clearTimeout(this.changeZoneTimeout)
    setTimeout(() => this.setChangeZoneState(),500+Math.random()*500)
  }

  stop(){
    this.velocity = 0
  }

  draw(){
      ctx.drawImage(this.img, this.x, this.y, this.width,this.height)
    }

  resetX(){
    this.x = ctx.canvas.width*2/10 +  Math.random()*(ctx.canvas.width*6/10)
    this.width = this.initWidth
  }
  resetY(){
    this.y = ctx.canvas.height*2/10 + Math.random()*(ctx.canvas.height*6/10)
    this.height = this.initHeight
  }

  reset(){
    this.resetX()
    this.resetY()
    this.stayPut()
  }

  isOutOfCanvas(){
    return (this.x < 0 || this.x > ctx.canvas.width || this.y < 0 || this.y > ctx.canvas.height)
  }

  reappearInCanvas(){
    if (this.x < 0){
      this.x = ctx.canvas.width
      this.resetY()
    }
    if (this.x > ctx.canvas.width){
      this.x = 0
      this.resetY()
    }
    if (this.y < 0){
      this.y = ctx.canvas.height
      this.resetX()
    }
    if (this.y > ctx.canvas.height){
      this.y = 0
      this.resetX()
    }
  }

  stayPut(){
    snitch.vAngle += (2*Math.PI)*this.rotationPerSec/game.fps
    snitch.x = snitch.x + Math.cos(snitch.vAngle)*this.rotationRadius
    snitch.y = snitch.y + Math.sin(snitch.vAngle)*this.rotationRadius
  }

  goStraight(){
    snitch.x = snitch.x + Math.cos(snitch.vAngle)*snitch.velocity;
    snitch.y = snitch.y + Math.sin(snitch.vAngle)*snitch.velocity;
    this.moveZ()
  }


  move() {
    if (this.isOutOfCanvas()){
      this.reappearInCanvas()
    }
    if (this.isChangingZone === true){
      this.goStraight()
    }
    else{
      this.stayPut()
    }
  }

  moveZ() {
      this.Z += (this.nextZ - this.previousZ) / (game.fps * (this.transitionDuration / 1000))
      this.width = this.initWidth * this.Z 
      this.height = this.initHeight * this.Z
      console.log(" next Z :" , this.nextZ)
      console.log("  Z :" , this.Z)
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
  //snitch.moveZ()
  if (game.isElapsedTime()){
    endGame()
  }

  drawAll()
}

function launchGame(event){
  if (event.target.textContent === "START"){
    snitch = new Snitch()
    snitch.setStayPutState()
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






