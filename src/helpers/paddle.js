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
    Object.values(paddle.value).forEach((item, index) => {
        if (index == 3) return
        ctx.value.fillStyle = color;
        ctx.value.fillRect(item.x, item.y, 16, box.value);
    });
};