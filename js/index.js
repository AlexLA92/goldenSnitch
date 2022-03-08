/* ------- GLOBAL VARIABLES ------- */

const startButton = document.querySelector(".start-btn")
//const ctx = getAdjustedCanvas()
const canvasElement = document.querySelector("canvas#canvas")
const ctx = document.querySelector("canvas#canvas").getContext('2d')
ctx.canvas.width  = canvasElement.parentNode.offsetWidth
ctx.canvas.height = canvasElement.parentNode.offsetHeight

let snitchImg = new Image()
snitchImg.src = './styles/images/golden_snitch.png'
let sizeCoefficient = 0.03

let fps = 100

let introAudio = new Audio('./styles/sound/theme-song.mp3');


let winAudio = new Audio('./styles/sound/win.mp3');
let missAudio = new Audio('./styles/sound/miss.mp3');

let intervalIntro = null




/* ------- CLASSES ------- */
class Game {
  constructor() {
    this.score = 0
    this.time = 10
    this.clockIntervalId = null
    this.gameIntervalId = null
    this.isOn = false
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
    this.Zvariance = 1
    this.previousZ = 1
    this.nextZ = 1

    this.velocity = 12
    this.transitionDuration = 0

    this.vAngle = 0 
    this.rotationPerSec = 15
    this.rotationRadius = 5

    this.isChangingZone = false
    this.changeZoneTimeout = null
    this.setStayPutStateTimeout = null

    this.isPlaying = false
    this.flutterStereo = new Audio('./styles/sound/flutter-stereo.wav');
    // The timeupdate trick is to avoid gaps when looping on the audio file. Found it on stackoverflow topic #7330023
    this.flutterStereo.addEventListener('timeupdate', function(){
        var buffer = .44
        if(this.currentTime > this.duration - buffer){
            this.currentTime = 0
            this.play()
        }
    });
    this.flutterRigth = new Audio('./styles/sound/flutter-right.wav')
    this.flutterRigth.addEventListener('timeupdate', function(){
      var buffer = .44
      if(this.currentTime > this.duration - buffer){
          this.currentTime = 0
          this.play()
      }
  });
    this.flutterLeft = new Audio('./styles/sound/flutter-left.wav');
    this.flutterLeft.addEventListener('timeupdate', function(){
      var buffer = .44
      if(this.currentTime > this.duration - buffer){
          this.currentTime = 0
          this.play()
      }
  });

  }

  playFlutter(){
    this.flutterStereo.play()
    this.flutterStereo.volume = 0.5
    this.flutterRigth.play()
    this.flutterRigth.volume = 0
    this.flutterLeft.play()
    this.flutterLeft.volume = 0
    this.isPlaying = true
  }

  stopFlutter(){
    this.flutterStereo.pause() 
    this.flutterRigth.pause()
    this.flutterLeft.pause()
    this.isPlaying = false
  }

  
  setChangeZoneState(){
    this.isChangingZone = true

    this.transitionDuration = 100+Math.random()*200
    this.previousZ = this.nextZ
    this.nextZ = 0.0 + Math.random()*this.Zvariance
    this.flutterStereo.volume =  this.nextZ/this.Zvariance
    this.changeZoneTimeout = setTimeout(() => this.setStayPutState(),this.transitionDuration)
  }
  
  isInLeftSide(margin){
    if (margin){
      return this.x > 0 && this.x < margin
    }
    else {
      return this.x > 0 && this.x < ctx.canvas.width / 2
    }
  }

  isInRightSide(margin){
    if (margin){
      return this.x >= ctx.canvas.width - margin && this.x < ctx.canvas.width
    }
    else {
      return this.x >= ctx.canvas.width / 2 && this.x < ctx.canvas.width
    }
  }

  isInBottomSide (margin){
    if (margin){
      return this.y >= ctx.canvas.height - margin && this.y < ctx.canvas.height
    }
    else {
      return this.y >= ctx.canvas.height / 2 && this.y < ctx.canvas.height
    }
  }

  isInTopSide (margin){
    if (margin){
      return this.y > 0 && this.y < margin
    }
    else {
      return this.y > 0 && this.y < ctx.canvas.height / 2
    }
  }

  isInBottomLeftCornerMargin(marginX, marginY){
    let result = this.isInLeftSide(marginX) && this.isInBottomSide()
    result = result || (this.isInLeftSide() && this.isInBottomSide(marginY))
    return  result
  }

  isInBottomRightCornerMargin(marginX, marginY){
    let result = this.isInRightSide(marginX) && this.isInBottomSide()
    result = result || (this.isInRightSide() && this.isInBottomSide(marginY))
    return  result
  }
  
  isInTopRightCornerMargin(marginX, marginY){
    let result = this.isInRightSide(marginX) && this.isInTopSide()
    result = result || (this.isInRightSide() && this.isInTopSide(marginY))
    return  result
  }
  
  isInTopLeftCornerMargin(marginX, marginY){
    let result = this.isInLeftSide(marginX) && this.isInTopSide()
    result = result || (this.isInLeftSide() && this.isInTopSide(marginY))
    return  result
  }
  
  setNewAngle(){
    let outOfBondMarginX = ctx.canvas.width / 10
    let outOfBondMarginY = ctx.canvas.height / 10

    if (this.isInBottomLeftCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = 3*Math.PI/2 + Math.random()*Math.PI/2
    }
    if (this.isInBottomRightCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = Math.PI + Math.random()*Math.PI/2
    }
    if (this.isInTopRightCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = Math.PI/2 + Math.random()*Math.PI/2
    }
    if (this.isInTopLeftCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = Math.random()*Math.PI/2
    }
  }

  setStayPutState(){
    this.isChangingZone = false
    clearTimeout(this.changeZoneTimeout)
    this.setStayPutStateTimeout = setTimeout(() => this.setChangeZoneState(),500+Math.random()*500)
  }

  stop(){
    this.velocity = 0
    clearTimeout(this.changeZoneTimeout)
    clearTimeout(this.setStayPutStateTimeout)
  }

  draw(){
      ctx.drawImage(this.img, this.x, this.y, this.width,this.height)
    }

  resetX(){
    this.x = ctx.canvas.width*2/10 +  Math.random()*(ctx.canvas.width*6/10)
    //this.width = this.initWidth
  }
  resetY(){
    this.y = ctx.canvas.height*2/10 + Math.random()*(ctx.canvas.height*6/10)
    //this.height = this.initHeight
  }

  reset(){
    this.resetX()
    this.resetY()
    this.stayPut()
  }

  isOutOfCanvas(){
    return (this.x < 0 || this.x > ctx.canvas.width || this.y < 0 || this.y > ctx.canvas.height)
  }

  // This method should be removed as it makes the sound effect bad
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
    this.vAngle += (2*Math.PI)*this.rotationPerSec/fps
    this.x = this.x + Math.cos(this.vAngle)*this.rotationRadius
    this.y = this.y + Math.sin(this.vAngle)*this.rotationRadius
  }

  goStraight(angle, speed){
    this.x = this.x + Math.cos(angle)*speed;
    this.y = this.y + Math.sin(angle)*speed;
  }


  move(speed) {
    // DEPRECATED
    if (this.isOutOfCanvas()){
      this.reappearInCanvas()
    }

    if (this.isChangingZone === true){
      // Set a new Angle in case Snitch is close to border
      this.setNewAngle()
      this.goStraight(this.vAngle,speed)
      this.moveZ()
    }
    else{
      this.stayPut( )
    }
    if (this.isPlaying){this.updateVolume()}
  }

  updateVolume(){
    if (this.x > 0 && this.x < ctx.canvas.width/2){
      this.flutterLeft.volume = (ctx.canvas.width/2 - this.x)/(ctx.canvas.width/2)
    } else {
      this.flutterLeft.volume = 0
    }
    if (this.x >= ctx.canvas.width/2 && this.x < ctx.canvas.width){
      this.flutterRigth.volume = (this.x - ctx.canvas.width/2)/(ctx.canvas.width/2)
    } else {
      this.flutterRigth.volume = 0
    }
  }

  moveZ() {
      this.Z += (this.nextZ - this.previousZ) / (fps * (this.transitionDuration / 1000))
      this.width = this.initWidth * this.Z 
      this.height = this.initHeight * this.Z
    return 
  }

  isCaught(clickX,clickY){
    let x0 = this.x + this.width/2
    let y0 = this.y + this.height/2
    let radius = this.width/2

    if (((clickX-x0)**2+(clickY-y0)**2) <= (radius*1.2)**2){
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


function updateTimer(){
  document.querySelector(".time-container").textContent = game.getSeconds()
}

function updateScore(){
  if (game.isOn){
    document.querySelector(".start-btn").textContent = game.score
  }
}

function endGame(){
  game.stop()
  snitch.stop()
  snitch.stopFlutter()
  document.querySelector(".start-btn").textContent = "TRY AGAIN"
  
  launchIntro()
  introAudio.currentTime = 0
  introAudio.play()

  addTitle()
  addScorecard()
}

function refresh(){
  clearAll()
  updateScore()
  updateTimer()
  snitch.move(snitch.velocity)
  if (game.isElapsedTime()){
    endGame()
  }
  snitch.draw()
}

// For testing and debugging
function launchManualMode(rps, radius){
  snitch = new Snitch()
  snitch.x = 200
  snitch.y = 300
  snitch.rotationPerSec = rps
  snitch.rotationRadius = 3
  setInterval(refreshManualMode, (1 / this.fps) * 1000 )
}


function removeTitle(){
  let titleElement = document.querySelector(".title-container")
  titleElement.remove()
}

function addTitle(){
  let gameElement = document.querySelector(".game-container")
  let templateElement = document.querySelector("#title-template") 
  let templateContent = document.importNode(templateElement.content, true);
  gameElement.insertBefore(templateContent, gameElement.firstChild);
}

function addScorecard(){
  let gameElement = document.querySelector(".game-container")
  let templateElement = document.querySelector("#result-template") 
  let templateContent = document.importNode(templateElement.content, true);

  let score = templateContent.querySelector("span")
  score.textContent = game.score

  gameElement.appendChild(templateContent);

}

function removeScorecard(){
  if (document.querySelector(".result-container")){
    titleElement = document.querySelector(".result-container")
    titleElement.remove()
  }  
}

function launchGame(event){
  if ((typeof variable === 'undefined') || !game.isOn){
    
    removeTitle()
    removeScorecard()
    
    introAudio.pause()
    clearInterval(intervalIntro)
    snitch = new Snitch()
    snitch.playFlutter()
    snitch.setStayPutState()
    game = new Game()
    game.start()
  }
}


function tryToCatch(event){
  const rect = canvas.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  if (game.isOn){
    console.log("tryToCatch", clickX ,clickY)
    if (snitch.isCaught(clickX,clickY)){
      console.log("GOT IT")
      game.score++
      winAudio.play()
      winAudio.currentTime = 0
      snitch.reset()
    }
    else {
      missAudio.play()
      missAudio.currentTime = 0
    }
  }
}

function launchIntro(){
  //introAudio.play()
  
  introSnitch = new Snitch()
  console.log(introSnitch.width)
  console.log(introSnitch.height)
  console.log(introSnitch.x)
  console.log(introSnitch.y)
  introSnitch.x = ctx.canvas.width / 2 - introSnitch.width/2
  introSnitch.y = ctx.canvas.height / 2 - introSnitch.height/2
  introSnitch.setChangeZoneState()

  intervalIntro = setInterval(refreshIntro, (1 / this.fps) * 1000)
}

function refreshIntro(){
  clearAll()
  //introSnitch.move(introSnitch.velocity)
  introSnitch.stayPut()
  //introSnitch.setNewAngle()
  //introSnitch.goStraight(0,1)
  introSnitch.draw()
}


/* ------- LISTENERS ------- */

startButton.addEventListener('click',launchGame)

canvasElement.addEventListener('mousedown', function(event) {
  tryToCatch(event)
})

/* ------- INIT ------- */

launchIntro()






