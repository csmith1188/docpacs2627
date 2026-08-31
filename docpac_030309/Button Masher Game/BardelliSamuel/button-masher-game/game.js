let indx = 0
let prevFA = false
let Apressed = false
let Startpressed = false
let prevFS = false
let ASC = false
let SSC = false
let gameEnded = false

let score = 0
let timer = 20
let direction
let controllerStatus = document.getElementById("controllerStatus")
let scoreBox = document.getElementById("scoreBox")
let directionBox = document.getElementById("directionBox")
let timerBox = document.getElementById("timerBox")
const dirMap = ["Up", "Right", "Down", "Left"]
let gamepad

let timerID = setInterval(function () {
    if (timer > 0) {
        timer--
        timerBox.textContent = `Time:  ${timer}`
    }
    if (timer == 0) {
        gameEnded = true
        timerBox.textContent = "Game Over!"
        clearInterval(timerID)
    }
}, 1000)
let directionID = setInterval(function () {
    if (gameEnded == false) {
        direction = Math.floor(Math.random() * 4)
        directionBox.textContent = dirMap[direction]
    }
    else {
        clearInterval(directionID)
    }
}, 2000)

function pollGamepad() {
    gamepad = navigator.getGamepads()[indx]

    if (gamepad.buttons[0].pressed) {
        Apressed = true
        if (prevFA == false) {
            ASC = true
        }
        else{
            ASC = false
        }
    }
    else {
        Apressed = false
    }

    if (gamepad.buttons[9].pressed) {
        Startpressed = true
        if (prevFS == false) {
            SSC = true
        }
        else{
            SSC = false
        }
    }
    else {
        Startpressed = false
    }

    console.log(gamepad.axes[1])

    prevFA = Apressed
    prevFS = Startpressed
    requestAnimationFrame(pollGamepad)
}

window.addEventListener("gamepadconnected", function (event) {
    indx = event.gamepad.index
    console.log(indx)
    controllerStatus.textContent = "Controller connected"
    pollGamepad()
})
window.addEventListener("gamepaddisconnected", function (event) {
    controllerStatus.textContent = "Controller disconnected"
    indx = null
})