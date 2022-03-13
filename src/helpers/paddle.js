// Helpers functions

// This fucntion help to go paddle up
export const controlPaddlesUP = (paddle, box) => {
    if (paddle.value[0].y < box.value) return;
    let paddleY = paddle.value[0].y - box.value;
    paddle.value.pop();
    paddle.value.unshift({
        x: paddle.value[0].x,
        y: paddleY,
    });
};
// This fucntion help to go paddle down
export const controlPaddlesDown = (paddle, box) => {
    if (paddle.value.slice(-1)[0].y > box.value * 19) return;
    let paddleY = paddle.value.slice(-1)[0].y + box.value;
    paddle.value.shift();
    paddle.value.push({ x: paddle.value[0].x, y: paddleY });
};

// This function draw paddles
export const drawPaddle = (paddle, ctx, box, color) => {
    ctx.value.lineWidth = 5;
    ctx.value.shadowBlur = 10;
    ctx.value.shadowColor = color;
    ctx.value.strokeStyle = color;
    ctx.value.strokeRect(paddle.value[0].x, paddle.value[0].y, 16, box.value * 3);
};