/* 

------- GLOBAL VARIABLES ------- 

*/

// HTML elements
const startButton = document.querySelector(".start-btn")
const canvasElement = document.querySelector("canvas#canvas")
const titleElement = document.querySelector(".title-container img")
const soundControlerElement = document.querySelector(".sound-container img")

// Canvas
const ctx = document.querySelector("canvas#canvas").getContext('2d')
ctx.canvas.width  = canvasElement.parentNode.offsetWidth
ctx.canvas.height = canvasElement.parentNode.offsetHeight

// Images
let snitchImg = new Image()
snitchImg.src = './styles/images/golden_snitch.png'
let sizeCoefficient = 0.03

// Audio
let introAudio = new Audio('./styles/sound/theme-song.mp3');
introAudio.volume = 0.4
let winAudio = new Audio('./styles/sound/win.mp3');
winAudio.volume = 1
let missAudio = new Audio('./styles/sound/miss.mp3');
missAudio.volume = 0.4
let isMuted = false

// Introduction scene
let intervalIntro = null

// Score
let highestScore = 0

// Framerate
let fps = 50


/* 

------- MAIN CLASSSES ------- 

*/
class Game {
  constructor(duration) {
    this.duration = duration
    this.score = 0
    this.time = duration
    this.clockIntervalId = null
    this.gameIntervalId = null
    this.isOn = false
    this.start()
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
  constructor(x, y, width, height, velocity, angle, isChangingZone, transitionDuration, Zvariance) {
    
    // Image
    this.img = snitchImg

    // Position
    this.x = x
    this.y = y

    // Size
    this.currentWidth = width
    this.currentHeight = height
    this.initWidth = width
    this.initHeight = height

    // Perspective
    this.Z = 1
    this.minZ = 0.2
    this.Zvariance = Zvariance
    this.previousZ = 1
    this.nextZ = 1

    // Velocity
    this.velocity = velocity

    // Fly-like movements
    // Stay put
    this.angleRotation = 0
    this.rotationPerSec = 15
    this.rotationRadius = 5
    // GoStraight
    this.angleStraight = angle
    this.transitionDuration = transitionDuration
    // Switch between the two
    this.isChangingZone = isChangingZone
    this.goStraightTimeout = null
    this.activateStayPutTimeout = null

    // Sound
    this.isFlutterPlaying = false

    // The timeupdate trick is to avoid gaps when looping on the audio file. 
    // Found it on stackoverflow topic #7330023
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
    this.playFlutter()
  }


  // Flutter sound 
  playFlutter(){
    this.isFlutterPlaying = true
    this.flutterRight.play()
    this.flutterRight.volume = 0.5
    this.flutterLeft.play()
    this.flutterLeft.volume = 0.5
  }

  stopFlutter(){
    this.flutterRight.pause()
    this.flutterLeft.pause()
    this.isFlutterPlaying = false
  }

  // Fly like movements 
  activateGoStraight(){
    this.isChangingZone = true
    this.transitionDuration = 300+Math.random()*200
    this.defineNewZ()
    this.goStraightTimeout = setTimeout(() => this.activateStayPut(),this.transitionDuration)
  }

  activateStayPut(){
    this.isChangingZone = false
    this.Z = this.nextZ // allows to catchup if nextZ was not exactly reached with interpolation
    this.updateSize()
    clearTimeout(this.goStraightTimeout)
    this.activateStayPutTimeout = setTimeout(() => this.activateGoStraight(),200+Math.random()*500)
  }

  stop(){
    this.velocity = 0
    clearTimeout(this.changeZoneTimeout)
    clearTimeout(this.activateStayPutTimeout)
  }
  
  // Border collision
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
      return (this.x + this.currentWidth>= ctx.canvas.width - margin) && this.x < ctx.canvas.width
    }
    else {
      return (this.x + this.currentWidth) >= ctx.canvas.width / 2 && this.x < ctx.canvas.width
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
  
  adjustTrajectoryToBorders(){
    let outOfBondMarginX = ctx.canvas.width / 10
    let outOfBondMarginY = ctx.canvas.height / 10

    if (this.isInBottomLeftCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.angleStraight = 3*Math.PI/2 + Math.random()*Math.PI/2
    }
    if (this.isInBottomRightCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.angleStraight = Math.PI + Math.random()*Math.PI/2
    }
    if (this.isInTopRightCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.angleStraight = Math.PI/2 + Math.random()*Math.PI/2
    }
    if (this.isInTopLeftCornerMargin(outOfBondMarginX, outOfBondMarginY)){
      this.angleStraight = Math.random()*Math.PI/2
    }
  }

  // Drawing
  draw(){
    console.log(this.img, this.x, this.y, this.currentWidth,this.currentHeight)
    ctx.drawImage(this.img, this.x, this.y, this.currentWidth,this.currentHeight)
    }
  
  // Trajectories
  stayPut(){
    this.angleRotation += (2*Math.PI)*this.rotationPerSec/fps
    this.x = this.x + Math.cos(this.angleRotation)*this.rotationRadius
    this.y = this.y + Math.sin(this.angleRotation)*this.rotationRadius
  }

  goStraight(angle, speed){
    this.x = this.x + Math.cos(angle)*speed;
    this.y = this.y + Math.sin(angle)*speed;
  }

  // Movements modes
  moveRandomly(speed) {
    if (this.isChangingZone === true){
      this.adjustTrajectoryToBorders()
      this.goStraight(this.angleStraight, speed)
      this.moveZ()
    }
    else{
      this.stayPut()
    }
  }

  moveBackAndForth(speed){
    if ((this.isChangingZone === true) && ((this.angleStraight%(2*Math.PI)).toFixed(1)==="0.0")){
      this.moveUntilBorder('right',0,speed)
    }
    else if ((this.isChangingZone === true) && ((this.angleStraight%(2*Math.PI)).toFixed(1)===Math.PI.toFixed(1))){
      this.moveUntilBorder('left',Math.PI,speed)
    }
    else {
      this.Z = this.nextZ // allows to catchup if nextZ was not exactly reached with interpolation
      this.updateSize()
      this.stayPut()
    }
  }

  makeUTurn(){
    this.isChangingZone= true
    this.angleStraight += Math.PI
    this.defineNewZ()
  }

  moveUntilBorder(borderSide,angle,speed){
    let outOfBondMarginX = ctx.canvas.width *0.1
    console.log('moveUntilBorder')
    this.goStraight(angle, speed)
    this.moveZ()
    switch (borderSide){
      case 'right':
        if((this.isInRightSide(outOfBondMarginX)) ||  this.x > ctx.canvas.width){
          this.isChangingZone= false
          setTimeout( () => {
            this.makeUTurn()
          }, 5000
          )}
        break
      case 'left':
        if(this.isInLeftSide(outOfBondMarginX)||  this.x < 0){
          this.isChangingZone= false
          setTimeout( () => {
            this.makeUTurn()
          }, 5000
          )}
        break
    }
    
  }


  // Perpective
  defineNewZ(){
    this.previousZ = this.nextZ
    this.nextZ =  this.minZ + Math.random()*this.Zvariance
  }

  updateSize(){
    this.currentWidth = this.initWidth * this.Z 
    this.currentHeight = this.initHeight * this.Z
    /* Hack because current initWidth does not get initizalized well */
    this.currentWidth =  (snitchImg.width *sizeCoefficient) * this.Z 
    this.currentHeight = (snitchImg.height *sizeCoefficient)  * this.Z
  }

  moveZ() {
    console.log('this.Z' , this.Z)
    this.Z += (this.nextZ - this.previousZ) / (fps * (this.transitionDuration / 1000))
    this.updateSize()
  return 
}

  // Flutter sound
  updateVolume(){
    this.flutterLeft.volume = Math.max(0,Math.min(1,(ctx.canvas.width - this.x)/(ctx.canvas.width)*((this.Z-this.minZ)/(this.minZ + this.Zvariance))))
    this.flutterRight.volume =  Math.max(0,Math.min(1,(this.x+this.currentWidth)/ctx.canvas.width*((this.Z-this.minZ)/(this.minZ + this.Zvariance))))
  }


  // Gaming
  isCaught(clickX,clickY){
    let x0 = this.x + this.currentWidth/2
    let y0 = this.y + this.currentHeight/2
    let radius = this.currentWidth/2

    if (((clickX-x0)**2+(clickY-y0)**2) <= (radius*1.2)**2){
      return true
    } else {
      return false
    }
  }

  resetX(){
    this.x = ctx.canvas.width*2/10 +  Math.random()*(ctx.canvas.width*6/10)
  }
  resetY(){
    this.y = ctx.canvas.height*2/10 + Math.random()*(ctx.canvas.height*6/10)
  }

  reset(){
    this.resetX()
    this.resetY()
    this.stayPut()
  }

}

/* 

------- GLOBAL FUNCTIONS ------- 

*/

// DRAWING 
function refreshGame(){
  clearAll()
  updateScore()
  updateTimer()
  snitch.moveRandomly(snitch.velocity)
  if (game.isElapsedTime()){
    endGame()
  }
  if (snitch.isFlutterPlaying){snitch.updateVolume()}
  snitch.draw()
}

function refreshIntro(){
  clearAll()
  introSnitch.moveBackAndForth(introSnitch.velocity)
  if (introSnitch.isFlutterPlaying){introSnitch.updateVolume()}
  introSnitch.draw()
}

function clearAll() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// SOUND 
function launchSound(){
  introAudio.play()
  introSnitch.playFlutter()
}

function muteAll(){
  if (!(typeof snitch === 'undefined')){
    snitch.stopFlutter()
  }
  if (!(typeof introSnitch === 'undefined')){
    introSnitch.stopFlutter()
  }
  introAudio.volume = 0
  winAudio.volume = 0
  missAudio.volume = 0
}

function unmuteAll(){
  if (!(typeof snitch === 'undefined')){
    snitch.playFlutter()
  }
  if (!(typeof introSnitch === 'undefined')){
    introSnitch.playFlutter()
  }
  introAudio.volume = 0.4
  winAudio.volume = 1
  missAudio.volume = 0.4
}

function mute(event){
  
  if (isMuted === false){
    event.target.src = './styles/images/mute-icon.png'
    isMuted= true
    muteAll()
  }
  else {
    event.target.src = './styles/images/sound-icon.png'
    isMuted= false
    unmuteAll()
  }
}

function restartIntroAudio(){
  introAudio.currentTime = 0
  introAudio.play()
}

// HTML ELEMENTS UPDATES
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

function addTitle(){
  let gameElement = document.querySelector(".game-container")
  let templateElement = document.querySelector("#title-template") 
  let templateContent = document.importNode(templateElement.content, true);
  gameElement.insertBefore(templateContent, gameElement.firstChild);
}

function removeTitle(){
  let titleElement = document.querySelector(".title-container")
  titleElement.remove()
}

function addScorecard(){
  let gameElement = document.querySelector(".game-container")
  let templateElement = document.querySelector("#result-template") 
  let templateContent = document.importNode(templateElement.content, true);

  let score = templateContent.querySelector("span")
  score.textContent = game.score

  let message = templateContent.querySelector("h1")
  if (game.score < 5){
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

// MANAGE GAME
function launchGame(event){
  
  if ((typeof game === 'undefined') || !game.isOn){
    stopIntro()
    removeTitle()
    removeScorecard()

    snitch = new Snitch(ctx.canvas.width / 2 ,       // x coordinate 
                        ctx.canvas.height/2,         // y coordinate
                        snitchImg.width *sizeCoefficient, // width coordinate
                        snitchImg.height *sizeCoefficient,  // height coordinate
                        50,           // Velocity level
                        0,            // Velocity vector angle
                        true,         // Changing Zone state status 
                        100,    // Transition Duration
                        1.3)          // Zvariance
    snitch.activateGoStraight()
    game = new Game(30)
  }
}


function endGame(){
  game.stop()
  snitch.stop()
  snitch.stopFlutter()
  document.querySelector(".start-btn").textContent = "TRY AGAIN"
  launchIntro()
  updateHighestScore()
  addScorecard()
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

// MANAGE INTRO
function launchIntro(){
  introAudio.currentTime = 0
  introAudio.play()
  introSnitch = new Snitch(ctx.canvas.width / 2,         // x coordinate 
                            ctx.canvas.height * 7 /10,   // y coordinate
                            snitchImg.width *sizeCoefficient, // width coordinate
                            snitchImg.height *sizeCoefficient,  // height coordinate
                            50,    // Velocity level
                            0,     // Velocity vector angle
                            true,  // Changing Zone state status 
                            500,   // Transition Duration
                            4)     // Zvariance
  console.log( introSnitch.currentWidth,introSnitch.currentHeight)
  intervalIntro = setInterval(refreshIntro, (1 / fps) * 1000)
}

function stopIntro(){
  introAudio.pause()
  clearInterval(intervalIntro)
}


/* 

------- LISTENERS ------- 

*/
startButton.addEventListener('click',launchGame)

titleElement.addEventListener('click',launchSound) // Way to enable the sound when autoplay did not work

soundControlerElement.addEventListener('click',function(event) {
  mute(event)
})

canvasElement.addEventListener('mousedown', function(event) {
  tryToCatch(event)
})

/* 

------- INITIALIZATION ------- 

*/
launchIntro()






