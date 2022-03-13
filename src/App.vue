<template>
  <router-view
    :peer="peer"
    :conn="conn"
    :videoFeed="videoFeed"
    :paddle="paddle"
    :players="players"
    :score="score"
    :isGameFinished="isGameFinished"
    @connect="connect"
    @sendData="sendData"
    @paddleMoves="paddleMoves"
    @changeUserState="changeUserState"
    @reset="reset"
    @gameFinished="gameFinished"
  />
</template>

<script>
import Peer from "peerjs";
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {
  name: "App",
  setup() {
    // Variables
    const peer = new Peer();
    const conn = ref(null);
    const you = ref(null);
    const videoFeed = ref(null);
    const paddle = ref(null);
    const router = useRouter();
    const players = ref({
      playerOne: false,
      playerTwo: false,
      playerOneName: "playerOne",
      playerTwoName: "playerTwo",
    });
    const score = ref(null);
    const isGameFinished = ref(false);

    // Functions

    const resetPlayersValue = () => {
      players.value = {
        playerOne: false,
        playerTwo: false,
        playerOneName: "playerOne",
        playerTwoName: "playerTwo",
      };
    };

    const connect = (id) => {
      // Storing connection id to varaible
      conn.value = peer.connect(id);
      // Listening for open event
      conn.value.on("open", function () {
        // Changing current route
        router.push({ path: "/game", query: { role: "admin" } });
      });

      // Listening for data event
      conn.value.on("data", function (data) {
        // parsing data
        const parsedData = JSON.parse(data);
        // Checking if type is equal ready
        if (parsedData.type === "ready") {
          // Checking if data is equal to user
          if (parsedData.data === "user") players.value.playerTwo = true;
          // Checking if data is equal to user
          if (parsedData.data === "admin") players.value.playerOne = true;
        }
        // Checking if type is equal paddlemove
        if (parsedData.type === "paddleMove") paddle.value = parsedData;
        // Checking if data type is equal to reset
        if (parsedData.type === "reset") resetPlayersValue();
      });
    };

    // This fucntion video stream of canvas
    const sendData = (data) => {
      // Sending data to other peers connection
      conn.value.send(data);
    };

    // This function move paddle
    const paddleMoves = (data) => {
      you.value.send(JSON.stringify({ type: "paddleMove", data: data.key }));
    };

    // This function change user state
    const changeUserState = (data) => {
      // Checking if data is equal to user
      if (data == "user") {
        // Sending data to peer connection
        you.value.send(JSON.stringify({ type: "ready", data: data }));
        players.value.playerTwo = true;
      } else {
        // Changing playerOne value
        players.value.playerOne = true;
        // Sending data to peer connection
        conn.value.send(JSON.stringify({ type: "ready", data: data }));
      }
    };

    const reset = (role) => {
      resetPlayersValue();
      if (role == "user") {
        you.value.send(JSON.stringify({ type: "reset", data: "reset" }));
        isGameFinished.value = false;
      } else {
        conn.value.send(JSON.stringify({ type: "reset", data: "reset" }));
        isGameFinished.value = false;
        conn.value = null;
      }
    };

    const gameFinished = () => {
      resetPlayersValue();
      isGameFinished.value = true;
      if (!conn.value) return;
      conn.value.send(JSON.stringify({ type: "gameFinished", data: "gameFinished" }));
    };

    // WebRTC

    peer.on("connection", function (conn) {
      // Storing peer connection to variable
      you.value = conn;
      // Listening for data event
      conn.on("data", function (data) {
        // Parsing data
        const parsedData = JSON.parse(data);
        // Checking if data type is equal to ready
        if (parsedData.type === "ready") {
          // Sending data to peer connection
          you.value.send(JSON.stringify({ type: "ready", data: data }));
          // Changing playerTwo value
          if (parsedData.data === "user") players.value.playerTwo = true;
          // Checking if data is equal to user
          if (parsedData.data === "admin") players.value.playerOne = true;
        }
        // Checking if data type is equal to reset
        if (parsedData.type === "reset") resetPlayersValue();
        // Checking if data type is equal to score
        if (parsedData.type === "score") score.value = parsedData.data;
        if (parsedData.type === "gameFinished") gameFinished();

        // videoFeed.value = data;
      });
      // Changing current route
      router.push({ path: "/game", query: { role: "user" } });
    });

    // Returning data
    return {
      peer,
      conn,
      videoFeed,
      paddle,
      players,
      score,
      isGameFinished,
      connect,
      sendData,
      paddleMoves,
      changeUserState,
      reset,
      gameFinished,
    };
  },
};
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: monospace;
}
</style>
