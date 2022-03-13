// Helpers functions

// This function draw arena
export const drawArena = (line, ctx, board) => {
    // Setting stroke style
    ctx.value.strokeStyle = "white";
    ctx.value.lineWidth = 2;
    // Drawing lines
    ctx.value.beginPath();
    if (line == "first") {
        ctx.value.moveTo(board.value.width / 2, board.value.height);
        ctx.value.lineTo(board.value.width / 2, 0);
    } else {
        ctx.value.moveTo(board.value.width / 2 - 10, board.value.height);
        ctx.value.lineTo(board.value.width / 2 - 10, 0);
    }
    ctx.value.stroke();

    // Drawing circles
    ctx.value.beginPath();
    if (line == "first") {
        ctx.value.arc(
            board.value.width / 2 - 5,
            board.value.height / 2,
            100,
            0,
            Math.PI * 2
        );
    } else {
        ctx.value.arc(
            board.value.width / 2 - 5,
            board.value.height / 2,
            110,
            0,
            Math.PI * 2
        );
    }
    ctx.value.stroke();
};

export const clearScreen = (ctx) => {
    ctx.value.shadowColor = "white";
    ctx.value.strokeStyle = "white";
    ctx.value.fillStyle = "#000";
    ctx.value.fillRect(0, 0, ctx.value.canvas.width, ctx.value.canvas.height);
};