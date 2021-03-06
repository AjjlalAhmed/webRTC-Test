// Helper functions

// This function draw ball on canvas
export const drawBall = (ball, ctx, color) => {
    ctx.value.beginPath();
    ctx.value.arc(ball.value.x, ball.value.y, 12, 0, Math.PI * 2);
    ctx.value.fillStyle = color;
    ctx.value.fill();
    ctx.value.closePath();
};
// This function handler physic of ball
export const bounceBall = (directions, index, ball) => {
    // Changing direction X
    if (directions.value.x == "left" && ball.value.x > 400) {
        directions.value.x = "right";
    } else if (ball.value.x < 100) directions.value.x = "left";
    // Changing direction Y
    if (index == 0) directions.value.y = "up";
    else if (index == 1) directions.value.y = "straight";
    else directions.value.y = "down";
};

// This function moves ball
export const moveBall = (
    directions,
    ball,
    ctx,
    box,
    ballSpeed,
    board,
    score,
    conn,
    emit
) => {
    // Checking if ball hit bottom wall
    if (ball.value.y >= ctx.value.canvas.height) {
        // Changing current Y direction
        directions.value.y = "up";
    }
    // Checking if ball hit top wall
    if (ball.value.y <= 0) {
        // Changing current Y direction
        directions.value.y = "down";
    }
    // Checking if ball pass thorugh opppnent wall
    if (ball.value.x > board.value.width) {
        // Resting ball position
        ball.value = { x: 15 * box.value + 16, y: 9 * box.value };
        // Adding point to player
        score.value.playerOne++;
        if (score.value.playerOne == 7) {
            emit("gameFinished");
        }
        conn.send(JSON.stringify({ type: "score", data: score.value }));
    }

    if (ball.value.x < 0) {
        // Resting ball position
        ball.value = { x: 15 * box.value + 16, y: 9 * box.value };
        // Adding point to player
        score.value.playerTwo++;
        if (score.value.playerTwo == 7) {
            emit("gameFinished");
        }
        conn.send(JSON.stringify({ type: "score", data: score.value }));
    }

    // Moving ball according to X direction
    if (directions.value.x == "left") {
        ball.value.x += box.value / 2;
    } else {
        ball.value.x -= box.value / 2;
    }
    // Moving ball according to Y direction
    if (directions.value.y == "down") {
        ball.value.y += box.value / 2;
    } else if (directions.value.y == "up") {
        ball.value.y -= box.value / 2;
    }
    // Calling same function to create loop
    // setTimeout(
    //     moveBall.bind(null, directions, ball, ctx, box, ballSpeed, board, score),
    //     ballSpeed.value
    // );
    // requestAnimationFrame(moveBall.bind(null, directions, ball, ctx, box, ballSpeed))
};