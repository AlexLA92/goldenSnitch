/* ------- GLOBAL VARIABLES ------- */

const startButton = document.querySelector(".start-btn")
const canvasElement = document.querySelector("canvas#canvas")
const titleElement = document.querySelector(".title-container img")
const ctx = document.querySelector("canvas#canvas").getContext('2d')
ctx.canvas.width  = canvasElement.parentNode.offsetWidth
ctx.canvas.height = canvasElement.parentNode.offsetHeight

let snitchImg = new Image()
snitchImg.src = './styles/images/golden_snitch.png'
let sizeCoefficient = 0.03

let fps = 50

let introAudio = new Audio('./styles/sound/theme-song.mp3');
introAudio.volume = 0.4


let winAudio = new Audio('./styles/sound/win.mp3');
let missAudio = new Audio('./styles/sound/miss.mp3');

let intervalIntro = null

let highestScore = 0



/* ------- CLASSES ------- */
class Game {
  constructor(duration) {
    this.score = 0
    this.duration = duration
    this.time = duration
    this.clockIntervalId = null
    this.gameIntervalId = null
    this.isOn = false
  }

  start() {
    this.clockIntervalId = setInterval( () => this.time--,1000)
    setTimeout(() => this.bringHermany() , this.duration*1000*(1/3))
    setTimeout(() => this.bringDraco() , this.duration*1000*(2/3))
    this.gameIntervalID = setInterval(refreshGame, (1 / fps) * 1000 )
    this.isOn=true
    }
  
  
  bringHermany(){
    let characterElement  = document.querySelector(".left-animation-container")
    characterElement.classList.add("animated")
  }
  bringDraco(){
    let characterElement  = document.querySelector(".right-animation-container")
    characterElement.classList.add("animated")
  }
  resetHermany(){
    let characterElement  = document.querySelector(".left-animation-container")
    characterElement.classList.remove("animated")
  }
  resetDraco(){
    let characterElement  = document.querySelector(".right-animation-container")
    characterElement.classList.remove("animated")
  }

  stop() {
    clearInterval(this.clockIntervalId)
    clearInterval(this.gameIntervalID)
    this.isOn=false
    this.resetHermany()
    this.resetDraco()
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
    this.minZ = 0.2
    this.Zvariance = 1.3
    this.previousZ = 1
    this.nextZ = 1

    this.velocity = 30
    this.transitionDuration = 0

    this.vAngleInit = 0 
    this.vAngle = 0 
    this.rotationPerSec = 15
    this.rotationRadius = 5

    this.isChangingZone = false
    this.changeZoneTimeout = null
    this.setStayPutStateTimeout = null

    this.isPlaying = false
    this.flutterStereo = new Audio('./styles/sound/flutter-stereo.wav')

    // The timeupdate trick is to avoid gaps when looping on the audio file. Found it on stackoverflow topic #7330023
    this.flutterStereo.addEventListener('timeupdate', function(){
        var buffer = .44
        if(this.currentTime > this.duration - buffer){
            this.currentTime = 0
            this.play()
        }
    });
    this.flutterRight = new Audio('./styles/sound/flutter-right.wav')
    this.flutterRight.addEventListener('timeupdate', function(){
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
    this.flutterStereo.volume = 0
    this.flutterRight.play()
    this.flutterRight.volume = 0.5
    this.flutterLeft.play()
    this.flutterLeft.volume = 0.5
    this.isPlaying = true
  }

  stopFlutter(){
    this.flutterStereo.pause() 
    this.flutterRight.pause()
    this.flutterLeft.pause()
    this.isPlaying = false
  }

  
  setChangeZoneState(){
    this.isChangingZone = true

    this.transitionDuration = 300+Math.random()*200
    
    this.previousZ = this.nextZ
    this.nextZ =  this.minZ + Math.random()*this.Zvariance

    this.changeZoneTimeout = setTimeout(() => this.setStayPutState(),this.transitionDuration)
  }

  setStayPutState(){
    this.isChangingZone = false
    clearTimeout(this.changeZoneTimeout)

    this.setStayPutStateTimeout = setTimeout(() => this.setChangeZoneState(),200+Math.random()*500)
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
      return (this.x + this.width>= ctx.canvas.width - margin) && this.x < ctx.canvas.width
    }
    else {
      return (this.x + this.width) >= ctx.canvas.width / 2 && this.x < ctx.canvas.width
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
      console.log("isInBottomLeftCornerMargin")
      console.log(this.vAngle)
    }
    if (this.isInBottomRightCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = Math.PI + Math.random()*Math.PI/2
      console.log("isInBottomRightCornerMargin")
      console.log(this.vAngle)
    }
    if (this.isInTopRightCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = Math.PI/2 + Math.random()*Math.PI/2
      console.log("isInTopRightCornerMargin")
      console.log(this.vAngle)
    }
    if (this.isInTopLeftCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.vAngle = Math.random()*Math.PI/2
      console.log("isInTopLeftCornerMargin")
      console.log(this.vAngle)
    }
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

  moveBackAndForth(speed){
    if ((this.isChangingZone === true) && ((this.vAngleInit%(2*Math.PI)).toFixed(2)==="0.00")){
      console.log("moving until rigth border")
      this.moveUntilBorder('right',0,speed)
    }
    else if ((this.isChangingZone === true) && ((this.vAngleInit%(2*Math.PI)).toFixed(2)===Math.PI.toFixed(2))){
      console.log("moving until left border")
      this.moveUntilBorder('left',Math.PI,speed)
    }
    else {
      this.stayPut()
    }
  }

  moveUntilBorder(borderSide,vAngle,speed){
    let outOfBondMarginX = ctx.canvas.width *0.1
    this.goStraight(vAngle, speed)
    this.moveZ()
    switch (borderSide){
      case 'right':
        if((this.isInRightSide(outOfBondMarginX)) ||  this.x > ctx.canvas.width){
          console.log("ARRIVED AT RIGHT SIDE")
          this.isChangingZone= false
          setTimeout( () => {
            console.log("LET'S GO LEFT")
            this.isChangingZone= true
            this.vAngleInit += Math.PI
            this.previousZ = this.nextZ
            this.nextZ =  this.minZ + Math.random()*this.Zvariance
          }, 5000
          )}
        break
      case 'left':
        if(this.isInLeftSide(outOfBondMarginX)||  this.x < 0){
          console.log("ARRIVED AT LEFT SIDE")
          this.isChangingZone= false
          setTimeout( () => {
            console.log("LET'S GO RIGHT")
            this.isChangingZone= true
            this.vAngleInit += Math.PI
            this.previousZ = this.nextZ
            this.nextZ =  this.minZ + Math.random()*this.Zvariance}, 5000
          )}
        break
    }
    
  }

  moveRandomly(speed) {

    if (this.isChangingZone === true){
      // Set a new Angle in case Snitch is close to border
      this.setNewAngle()

      this.goStraight(this.vAngle, speed)
      this.moveZ()
    }
    else{
      this.stayPut()
    }
  }

  moveZ() {
    this.Z += (this.nextZ - this.previousZ) / (fps * (this.transitionDuration / 1000))
    this.width = this.initWidth * this.Z 
    this.height = this.initHeight * this.Z
  return 
}

  updateVolume(){
    this.flutterLeft.volume = Math.max(0,Math.min(1,(ctx.canvas.width - this.x)/(ctx.canvas.width)*((this.Z-this.minZ)/(this.minZ + this.Zvariance))))
    this.flutterRight.volume =  Math.max(0,Math.min(1,(this.x+this.width)/ctx.canvas.width*((this.Z-this.minZ)/(this.minZ + this.Zvariance))))
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

function updateHighestScore(){
    if(game.score > highestScore){
      document.querySelector(".highscore-container span").textContent = game.score
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

  updateHighestScore()

  addTitle()
  addScorecard()
}


function refreshGame(){
  clearAll()
  updateScore()
  updateTimer()
  snitch.moveRandomly(snitch.velocity)
  if (game.isElapsedTime()){
    endGame()
  }
  if (snitch.isPlaying){snitch.updateVolume()}
  snitch.draw()
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

  let message = templateContent.querySelector("h1")
  if (game.score < 3){
    message.textContent = "If you were any slower, you'd be going backwards Potter."
  }
  else if (game.score < 10){
    message.textContent = "Well done Potter ! Five points to Gryffondor !"
  }
  else {
    message.textContent = "I think it's clear we can expect great things from you !"
  }

  gameElement.appendChild(templateContent);

}

function removeScorecard(){
  if (document.querySelector(".result-container")){
    let titleElement = document.querySelector(".result-container")
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
    game = new Game(30)
    game.start()
  }
}


function tryToCatch(event){
  const rect = canvas.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  if (game.isOn){
    if (snitch.isCaught(clickX,clickY)){
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
  introAudio.play()
  introSnitch = new Snitch()
  introSnitch.velocity = 50
  introSnitch.vAngle = 0
  introSnitch.Zvariance = 4
  introSnitch.transitionDuration = 500
  introSnitch.isChangingZone= true
  introSnitch.playFlutter()
  introSnitch.x = ctx.canvas.width / 10 - introSnitch.width/2
  introSnitch.y = ctx.canvas.height * 8 /10  - introSnitch.height/2

  intervalIntro = setInterval(refreshIntro, (1 / fps) * 1000)

}

function refreshIntro(){
  clearAll()
  introSnitch.moveBackAndForth(introSnitch.velocity)
  if (introSnitch.isPlaying){introSnitch.updateVolume()}
  introSnitch.draw()
}

function launchSound(){
  introAudio.play()
  introSnitch.playFlutter()
}


/* ------- LISTENERS ------- */

startButton.addEventListener('click',launchGame)

canvasElement.addEventListener('mousedown', function(event) {
  tryToCatch(event)
})

titleElement.addEventListener('click',launchSound)

/* ------- INIT ------- */

launchIntro()






