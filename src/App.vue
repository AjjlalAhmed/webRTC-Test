<template>
  <router-view
    :peer="peer"
    :conn="conn"
    :videoFeed="videoFeed"
    :paddle="paddle"
    @connect="connect"
    @sendData="sendData"
    @paddleMoves="paddleMoves"
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

    // Functions
    const connect = (id) => {
      conn.value = peer.connect(id);
      // on open will be launch when you successfully connect to PeerServer
      conn.value.on("open", function () {
        router.push({ path: "/game", query: { role: "admin" } });
      });

      conn.value.on("data", function (data) {
        paddle.value = data;
      });
    };

    // This fucntion video stream of canvas
    const sendData = (data) => {
      // Sending data to other peers connection
      conn.value.send(data);
    };

    const paddleMoves = (data) => {
      you.value.send(data);
    };
    
    // WebRTC

    peer.on("connection", function (conn) {
      you.value = conn;
      conn.on("data", function (data) {
        videoFeed.value = data;
      });
      router.push({ path: "/game", query: { role: "user" } });
    });

    // Returning data
    return { peer, conn, videoFeed, paddle, connect, sendData, paddleMoves };
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
