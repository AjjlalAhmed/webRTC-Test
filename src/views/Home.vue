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
export default {
  name: "Home",
  emits: ["connect"],
  props: ["peer", "conn"],
  setup(props, { emit }) {
    // Variables
    const peer = props.peer;
    const conn = props.conn;
    const youid = ref(null);
    const id = ref("");

    peer.on("open", (id) => {
      youid.value = id;
    });

    // peer.on("connection", function (conn) {
    //   conn.on("data", function (data) {
    //     // Will print 'hi!'
    //     console.log(data);
    //   });
    //   setTimeout(() => {
    //     conn.send("hey");
    //   }, 2000);
    // });

    const connect = () => {
      emit("connect", id.value);
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
