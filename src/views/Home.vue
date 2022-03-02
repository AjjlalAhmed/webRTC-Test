<template>
  <div class="home">
    <main>
      <h1 class="id">
        <span>your id</span>
        : {{ youid }}
      </h1>
      <input placeholder="Enter Oppnent Id" v-model="id" type="text" />
      <button @click="connect">connect</button>
    </main>
  </div>
</template>

<script>
import { onUpdated, ref, watch } from "vue";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";
export default {
  name: "Home",
  setup() {
    // Variables
    var peer = new Peer();
    var conn = ref(null);
    // const conn = new Peer();
    const youid = ref(null);
    const Aconn = ref(undefined);
    const id = ref("");

    peer.on("open", (id) => {
      youid.value = id;
    });

    // conn.on("data", (data) => {
    //   console.log(data);
    // });

    // conn.on("connection", (NaConn) => {
    //   console.log(1);
    //   if (Aconn.value != undefined) Aconn.value.close();
    //   oppnentid.value = NaConn.peer;
    //   Aconn.value = NaConn;

    // });

    peer.on("connection", function (conn) {
      conn.on("data", function (data) {
        // Will print 'hi!'
        console.log(data);
      });
      setTimeout(() => {
        conn.send("hey");
      }, 2000);
    });

    const connect = () => {
      conn.value = peer.connect(id.value);
      // on open will be launch when you successfully connect to PeerServer
      conn.value.on("open", function () {
        // here you have conn.id
        conn.value.send("hi!");
      });

      conn.value.on("data", function (data) {
        // Will print 'hi!'
        console.log(data);
      });
      // Aconn.value = conn.connect(id.value);
      // oppnentid.value = Aconn.value.peer;
      // Aconn.value.send("hey");
    };

    return { connect, youid, id };
  },
};
</script>

<style lang="scss">
.home {
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 10px;
    gap: 20px;
    .id {
      font-size: 1.5rem;
      span {
        text-transform: capitalize;
        color: dodgerblue;
      }
    }
    input {
      min-width: 500px;
      padding: 10px 0px;
      text-indent: 10px;
      border-radius: 3px;
      border: 1px solid #5555;
      font-size: 1.5rem;
    }
    button {
      padding: 10px 50px;
      font-size: 1.5rem;
      text-transform: capitalize;
      background: dodgerblue;
      color: #fff;
      border: 0px;
      border-radius: 3px;
      font-weight: 700;
      cursor: pointer;
      &:hover {
        background: rgb(8, 132, 255);
      }
    }
  }
}
</style>
