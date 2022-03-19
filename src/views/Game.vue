<template>
  <!-- Container  -->
  <div class="container">
    <!-- Game status  -->
    <div class="game-status">
      <ul class="status-bar">
        <li class="playerOne-name">
          <span v-if="players.playerOne == true">ready</span>
          <span v-else>not ready</span>
        </li>
        <li class="playerTwo-name">
          <span v-if="players.playerTwo">ready</span>
          <span v-else>not ready</span>
        </li>
      </ul>
      <div @click="ready" class="start-btn">ready</div>
      <ul class="score">
        <li class="playerOne-score">{{ score.playerOne }}</li>
        <li>vs</li>
        <li class="playerOne-score">{{ score.playerTwo }}</li>
      </ul>
    </div>

    <!-- Game   -->
    <div class="game">
      <!-- Canvas  -->
      <canvas
        v-if="role == 'admin' || role == null"
        width="1000"
        height="640"
        ref="board"
        class="board"
        hidden
      ></canvas>
      <!-- Neon border   -->
      <div class="neon-border">
        <div class="bar-container">
          <div class="bar-one"></div>
          <div class="bar-two"></div>
          <div class="bar-three"></div>
          <div class="bar-four"></div>
        </div>
      </div>
      <!-- Video stream -->
      <video
        v-if="
          role == 'user' || !isGameRunning
          //&& role == 'admin'
        "
        class="video"
      ></video>
      <img v-if="role == 'admin'" class="video-admin" />
    </div>

    <div class="controls">
      <button @click="keydown('w')" class="up">
        <i class="fa-solid fa-angle-up"></i>
      </button>
      <button @click="keydown('s')" class="down">
        <i class="fa-solid fa-angle-down"></i>
      </button>
    </div>

    <div v-if="isGameFinished" class="game-finised">
      <ul>
        <li v-if="score.playerOne > score.playerTwo">playerone won the game</li>
        <li v-else>playerTwo won the game</li>
        <li>score : {{ score.playerOne }} / {{ score.playerTwo }}</li>
        <li><router-link to="/">exits</router-link></li>
      </ul>
    </div>
  </div>
  <!-- Container  -->
</template>

<script>
// Importing thing we need
import { ref } from "@vue/reactivity";
import { onMounted, watch } from "@vue/runtime-core";
import { v4 as uuidv4 } from "uuid";
// Importing helpers functions
import { drawPaddle, controlPaddlesDown, controlPaddlesUP } from "../helpers/paddle";
import { drawBall, bounceBall, moveBall } from "../helpers/ball";
import { clearScreen, drawArena } from "../helpers/board";
import { onBeforeRouteLeave, useRoute } from "vue-router";
export default {
  name: "App",
  emits: ["sendData", "paddleMoves", "changeUserState", "reset"],
  props: ["peer", "conn", "videoFeed", "paddle", "players", "score", "isGameFinished"],
  setup(props, { emit }) {
    // Variables
    const peer = props.peer;
    const conn = props.conn;
    const route = useRoute();
    const role = ref(null);
    const src = ref("null");
    const intervalId = ref(null);
    const caller = ref(null);

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
      { x: 30 * box.value, y: 1 * box.value },
      { x: 30 * box.value, y: 2 * box.value },
      { x: 30 * box.value, y: 3 * box.value },
      { x: 30 * box.value, y: 4 * box.value },
    ]);

    const ball = ref({ x: 15 * box.value + 16, y: 9 * box.value });
    const ballSpeed = ref(100);
    const directions = ref({ x: "right", y: "down" });

    const isGameRunning = ref(false);

    const score = ref({
      playerOne: 0,
      playerTwo: 0,
    });

    const IsReady = ref({
      playerOne: false,
      playerTwo: false,
    });

    const players = ref(props.players);

    const isGameFinished = ref(props.isGameFinished);

    // Life cycle
    onMounted(() => {
      // Setting roles
      if (route.query.role == "admin") role.value = "admin";
      else if (route.query.role == "user") role.value = "user";
      // Creating 2d context
      ctx.value = board.value.getContext("2d");
      // Calling draw function
      draw();
      // Checking if admin
      if (conn) {
        // Capturing stream from canvas
        const stream = board.value.captureStream();
        // Sending stream to oter player
        const call = peer.call(conn.peer, stream);
        call.on("close", () => {
          console.log("call close event");
        });
      }
    });

    onBeforeRouteLeave(() => {
      // Changing isGameRunning value
      isGameRunning.value = false;
      // Checking if conn
      if (!conn) {
        // Stopping video stream
        const video = document.querySelector("video");
        video.pause();
        // Emitting peer event
        emit("reset", "user");
        // Ending call
        caller.value.close();
      } else {
        // Clearing interval
        clearInterval(intervalId.value);
        // Emitting peer event
        emit("reset", "admin");
      }
    });

    // Functions

    // This function make player ready
    const ready = () => {
      // Checking if conn
      if (conn) {
        // Emitting peer event
        emit("changeUserState", "admin");
      } else {
        // Emitting peer event
        emit("changeUserState", "user");
      }
    };

    // This functions check collision
    const ballCollisionWithPaddle = (ball, paddle, currentPaddle) => {
      // Looping through all paddle parts and checking if ball hits any of paddle part
      paddle.value.forEach((item, index) => {
        // Checking current paddle
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
      if (!isGameRunning.value) return;
      const imgVideo = document.querySelector(".video-admin");
      imgVideo.src = board.value.toDataURL();
      // Clearing screen
      clearScreen(ctx);
      // Drawing line
      drawArena("first", ctx, board);
      drawArena("second", ctx, board);
      // Drawing ball
      drawBall(ball, ctx, "white");
      // Drawing left paddles
      drawPaddle(paddleLeft, ctx, box, "#ff0000");
      drawPaddle(paddleRight, ctx, box, "#00f7ff");
      // Checking collision between paddle and ball
      ballCollisionWithPaddle(ball, paddleLeft, "left");
      ballCollisionWithPaddle(ball, paddleRight, "right");
      // Calling draw function
      requestAnimationFrame(draw);
    };

    const keydown = (e) => {
      // Checking which key is press
      if (e == "w") {
        if (role.value == "user") {
          emit("paddleMoves", { key: "w", id: uuidv4() });
        } else {
          controlPaddlesUP(paddleLeft, box);
        }
      } else if (e == "s") {
        if (role.value == "user") {
          emit("paddleMoves", { key: "s", id: uuidv4() });
        } else {
          controlPaddlesDown(paddleLeft, box);
        }
      }
    };

    // Adding event listener to keydown
    window.addEventListener("keydown", (e) => {
      keydown(e.key);
    });

    // Watching props
    watch(
      () => props.videoFeed,
      () => {
        src.value = props.videoFeed;
      }
    );

    watch(
      () => props.paddle,
      () => {
        if (!conn) return;
        if (props.paddle.data == "w") controlPaddlesUP(paddleRight, box);
        else if (props.paddle.data == "s") controlPaddlesDown(paddleRight, box);
      }
    );
    watch(
      () => props.score,
      () => {
        score.value = props.score;
      }
    );
    watch(
      () => props.isGameFinished,
      () => {
        isGameFinished.value = props.isGameFinished;
        isGameRunning.value = false;
        clearInterval(intervalId.value);
      }
    );

    watch(
      () => props.players.playerTwo,
      () => {
        if (props.players.playerOne && props.players.playerTwo) {
          if (isGameRunning.value || !conn) return;
          isGameRunning.value = true;
          draw();
          intervalId.value = setInterval(
            moveBall.bind(
              null,
              directions,
              ball,
              ctx,
              box,
              ballSpeed,
              board,
              score,
              conn,
              emit
            ),
            ballSpeed.value
          );
        }
      }
    );

    watch(
      () => props.players.playerOne,
      () => {
        if (props.players.playerOne && props.players.playerTwo) {
          if (isGameRunning.value || !conn) return;
          isGameRunning.value = true;
          draw();
          intervalId.value = setInterval(
            moveBall.bind(
              null,
              directions,
              ball,
              ctx,
              box,
              ballSpeed,
              board,
              score,
              conn,
              emit
            ),
            ballSpeed.value
          );
        }
      }
    );

    // // Listening for call
    peer.on("call", function (call) {
      caller.value = call;
      // Answer the call, providing our mediaStream
      call.answer();
      call.on("stream", function (remoteStream) {
        const video = document.querySelector("video");
        video.srcObject = remoteStream;
        video.play();
      });
    });

    // Returning data
    return {
      board,
      src,
      role,
      score,
      IsReady,
      players,
      isGameFinished,
      isGameRunning,
      ready,
      keydown,
    };
  },
};
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  .container {
    min-height: 100vh;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #111;
    position: relative;
    padding: 10px;
  }
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 50px;
    max-width: 1000px;
    height: auto;
    width: 100%;
    border: 2px solid #fff;

    position: relative;
    .board {
      background: #000;
      border-radius: 2px;
    }
    .neon-border {
      display: block;
      position: absolute;
      min-width: 100%;
      height: 100%;
      .bar-container {
        position: relative;
        height: 100%;
        .bar-one {
          position: absolute;
          top: -8px;
          display: block;
          width: 45%;
          height: 10px;
          background: red;
          box-shadow: 0 0 2px #f1f1f1, 0 0 4px #ff0000, 0 0 6px #ff0000, 0 0 10px #ff0000,
            0 0 2px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000, 0 0 100px #ff0000;
        }
        .bar-two {
          position: absolute;
          top: -8px;
          right: 0px;
          display: block;
          width: 45%;
          height: 10px;
          background: #00f7ff;
          box-shadow: 0 0 2px #f1f1f1, 0 0 4px #00f7ff, 0 0 6px #00f7ff, 0 0 10px #00f7ff,
            0 0 2px #00f7ff, 0 0 30px #00f7ff, 0 0 40px #00f7ff, 0 0 100px #00f7ff;
        }
        .bar-three {
          position: absolute;
          bottom: -8px;
          display: block;
          width: 45%;
          height: 10px;
          background: red;
          box-shadow: 0 0 2px #f1f1f1, 0 0 4px #ff0000, 0 0 6px #ff0000, 0 0 10px #ff0000,
            0 0 2px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000, 0 0 100px #ff0000;
        }
        .bar-four {
          position: absolute;
          bottom: -8px;
          right: 0px;
          display: block;
          width: 45%;
          height: 10px;
          background: #00f7ff;
          box-shadow: 0 0 2px #f1f1f1, 0 0 4px #00f7ff, 0 0 6px #00f7ff, 0 0 10px #00f7ff,
            0 0 2px #00f7ff, 0 0 30px #00f7ff, 0 0 40px #00f7ff, 0 0 100px #00f7ff;
        }
      }
    }
    video {
      width: 100%;
      height: auto;
    }
    .video-admin {
      width: 100%;
      height: auto;
    }
  }
  .controls {
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 1000px;
    margin: 30px 0px;
    button {
      background: transparent;
      border: 5px solid #fff;
      display: block;
      cursor: pointer;
      border-radius: 50%;

      i {
        font-size: clamp(1.5rem, 2vw + 2rem, 5rem);
        color: #fff;
        padding: 10px 20px;
      }
    }
  }
  .game-status {
    margin-top: 50px;
    max-width: 1280px;
    .score {
      display: flex;
      justify-content: space-between;
      list-style: none;
      margin: 20px 0px;
      li {
        color: #fff;
        font-size: clamp(2rem, 2vw + 2rem, 5rem);
      }
    }
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      gap: 50px;
      li {
        font-size: clamp(0.8rem, 1vw + 1rem, 2.2rem);
        text-transform: capitalize;
        padding: 10px;
        width: 100%;
        border-radius: 3px;
        ul {
          display: flex;
          list-style: none;
          background: #9999;
          justify-content: space-around;
          li {
            font-size: clamp(0.9rem, 1vw + 1.5rem, 3rem);
            text-transform: capitalize;
            padding: 10px;
            width: auto;
            color: #fff;
          }
        }
      }
      .playerOne-name {
        background: red;
        font-weight: bolder;
        text-align: center;
        white-space: nowrap;
        font-size: clamp(0.8rem, 1vw + 1rem, 2.2rem);
        color: #fff;
        font-weight: 700;
      }
      .playerTwo-name {
        background: #00f7ff;
        text-align: center;
        color: #fff;
        white-space: nowrap;
        font-weight: bolder;
        font-size: clamp(0.8rem, 1vw + 1rem, 2.2rem);
        font-weight: 700;
      }
    }
    .start-btn {
      background: #fff;
      max-width: 150px;
      margin: 20px auto;
      padding: 10px;
      font-size: 2rem;
      text-transform: capitalize;
      text-align: center;
      cursor: pointer;
      color: #000;
      font-weight: 700;
    }
  }
  .game-finised {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: grid;
    place-items: center;
    ul {
      background: #f1f1f1;
      padding: 20px;
      margin: 10px;
      li {
        list-style: none;
        font-size: 3rem;
        text-transform: capitalize;
        text-align: center;
        padding: 10px;
        font-weight: 700;
        a {
          text-decoration: none;
          color: #000;
        }
      }
    }
  }
}
</style>
