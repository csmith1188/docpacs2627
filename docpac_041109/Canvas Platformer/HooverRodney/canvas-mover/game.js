const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext('2d');

// ctx.fillRect(400, 300, 20, 20);

let player = {
    x: 390,
    y: 290,
    width: 20,
    height: 20,
    speed: 5,
    //spawns the player in the center of the screen, accounting for the size of the player and the dimensions of the canvas
}

function drawPlayer() {
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //player updated here when movement is added
    drawPlayer();
    requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case 'a':
            player.x -= player.speed; //move left
            if (player.x <= 0) {
                player.x = 0;
            }
            break;
        case 's':
            player.y += player.speed; //move down
            if (player.y >= canvas.height - player.height) {
                player.y = 580;
            }
            break;
        case 'w':
            player.y -= player.speed; //move up
            if (player.y <= 0) {
                player.y = 0;
            }
            break;
        case 'd':
            player.x += player.speed; //move right
            if (player.x >= canvas.width - player.width) {
                player.x = 780;
            }
    }
});

window.onload = loop();