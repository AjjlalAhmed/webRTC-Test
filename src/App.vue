<template>
  <router-view
    :peer="peer"
    :conn="conn"
    :videoFeed="videoFeed"
    @connect="connect"
    @sendData="sendData"
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
    const videoFeed = ref(null)
    const router = useRouter();

    // Functions
    const connect = (id) => {
      conn.value = peer.connect(id);
      // on open will be launch when you successfully connect to PeerServer
      conn.value.on("open", function () {
        
        // here you have conn.id
        conn.value.send("hi!");
        router.push({ path: "/game", query: { role: "admin" } });
      });

      conn.value.on("data", function (data) {
        // Will print 'hi!'
       
      });
    };

    const sendData = (data) => {
      
      // if(!conn) return
      
      conn.value.send(data);
    };

    // WebRTC

    peer.on("connection", function (conn) {
      you.value = conn;
      conn.on("data", function (data) {
        // Will print 'hi!'
     
        videoFeed.value  =data
      });
      router.push({ path: "/game", query: { role: "user" } });
    });

    // Returning data
    return { peer, conn,videoFeed, connect, sendData };
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
