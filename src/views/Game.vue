<template>
  <div class="game">
    <canvas width="640" height="640" ref="board" class="board"></canvas>
  </div>
</template>

<script>
// Importing thing we need
import { ref } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";
// Importing helpers functions
import {
  drawPaddle,
  controlPaddlesDown,
  controlPaddlesUP,
} from "../helpers/paddle";
import { drawBall, bounceBall, moveBall } from "../helpers/ball";
import { useRoute } from "vue-router";
export default {
  name: "App",
  setup() {
    // Variables
    const route = useRoute();
    const board = ref(null);
    const ctx = ref(null);
    const box = ref(32);
    const paddleLeft = ref([
      { x: 1 * box.value, y: 1 * box.value },
      { x: 1 * box.value, y: 2 * box.value },
      { x: 1 * box.value, y: 3 * box.value },
      { x: 1 * box.value, y: 4 * box.value },
    ]);
    const paddleRight = ref([
      { x: 18 * box.value, y: 1 * box.value },
      { x: 18 * box.value, y: 2 * box.value },
      { x: 18 * box.value, y: 3 * box.value },
      { x: 18 * box.value, y: 4 * box.value },
    ]);
    const ball = ref({ x: 9 * box.value + 16, y: 9 * box.value });
    const ballSpeed = ref(80);
    const directions = ref({ x: "right", y: "down" });

    // Life cycle
    onMounted(() => {
      ctx.value = board.value.getContext("2d");
      draw();
    });

    // Functions

    // This functions check collision
    const ballCollisionWithPaddle = (ball, paddle, currentPaddle) => {
      paddle.value.forEach((item, index) => {
        if (currentPaddle == "left") {
          if (item.y == ball.value.y && item.x + 16 == ball.value.x) {
            bounceBall(directions, index, ball);
          }
        } else {
          if (item.y == ball.value.y && item.x - 16 == ball.value.x) {
            bounceBall(directions, index, ball);
          }
        }
      });
    };

    const draw = () => {
      // Clearing screen
      ctx.value.fillStyle = "#111";
      ctx.value.fillRect(0, 0, ctx.value.canvas.width, ctx.value.canvas.height);
      // Drawing ball
      drawBall(ball, ctx, "red");
      // Drawing left paddles
      drawPaddle(paddleLeft, ctx, box, "white");
      drawPaddle(paddleRight, ctx, box, "dodgerblue");
      // Checking collision between paddle and ball
      ballCollisionWithPaddle(ball, paddleLeft, "left");
      ballCollisionWithPaddle(ball, paddleRight, "right");
      // Calling draw function
      requestAnimationFrame(draw);
    };
    // Calling moveball function
    setTimeout(
      moveBall.bind(null, directions, ball, ctx, box, ballSpeed),
      ballSpeed.value
    );
    // Adding event listener to keydown
    window.addEventListener("keydown", (e) => {
      // Checking which key is press
      if (e.key == "w") controlPaddlesUP(paddleLeft, box);
      else if (e.key == "s") controlPaddlesDown(paddleLeft, box);
      // Checking which key is press
      if (e.key == "ArrowUp") {
        // Preventing defualt behavior
        e.preventDefault();
        controlPaddlesUP(paddleRight, box);
      } else if (e.key == "ArrowDown") {
        // Preventing defualt behavior
        e.preventDefault();
        controlPaddlesDown(paddleRight, box);
      }
    });

    // Returning data
    return { board };
  },
};
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;

    .board {
      background: #111;
      border-radius: 5px;
    }
  }
}
</style>
