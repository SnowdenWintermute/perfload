function socketMain(io, socket) {
  console.log("socket " + socket.id + " connected");

  socket.on("clientAuth", key => {
    if (key === "aoeu") {
      // valid nodeClient
      socket.join("clients");
    } else if (key === "ee") {
      // valid view client
      socket.join("ui");
    } else {
      // invalid client
      socket.disconnect(true);
    }
  });

  socket.on("perfData", data => {
    console.log(data);
  });
}

module.exports = socketMain;
