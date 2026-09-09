let player = {
    'x': 400,
    'y': 300,
    'width': 10,
    'height': 10,
    'moveSpeed': 5
}

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

function drawPlayer() {
    ctx.fillStyle = 'red'
    ctx.fillRect(player['x'], player['y'], player['width'], player['height'])
}


document.addEventListener('keydown', function (event) {
    if (event.key == 'i') {
        player['y'] -= player['moveSpeed']
    }
    else if (event.key == 'j') {
        player['x'] -= player['moveSpeed']
    }
    else if (event.key == 'k') {
        player['y'] += player['moveSpeed']
    }
    else if (event.key == 'l') {
        player['x'] += player['moveSpeed']
    }
})



function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawPlayer()
    requestAnimationFrame(loop)
}
loop()