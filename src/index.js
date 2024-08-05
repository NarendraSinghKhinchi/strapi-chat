"use strict";
const { Server } = require("socket.io");
const axios = require("axios");

module.exports = {
  register({ strapi }) {},

  bootstrap(/* { strapi } */) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "https://chat-app-one-lyart.vercel.app",
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization", "my-custom-header"],
        credentials: true,
      },
    });
    const activeUsers = {};

    io.on("connection", function (socket) {
      socket.on("joinRoom", (data) => {
        const { room, username, userId } = data;
        console.log("user connected");
        console.log("Room is ", room);

        if (room) {
          socket.join(room);

          if (!activeUsers[room]) {
            activeUsers[room] = [];
          }
          activeUsers[room].push({ username, userId, socketId: socket.id });

          console.log(activeUsers);

          io.to(room).emit("activeUsers", activeUsers[room]);

          socket.emit("welcome", {
            user: "bot",
            text: `${username}, Welcome to the group chat`,
          });
        } else {
          console.log("An error occurred");
        }
      });

      socket.on("sendMessage", async (data) => {
        console.log(data);

        io.to(data.room).emit("newMessage", {
          text: data.text,
          username: data.username,
          userId: data.userId,
        });
      });

      socket.on("disconnect", () => {
        for (const room in activeUsers) {
          activeUsers[room] = activeUsers[room].filter(
            (user) => user.socketId !== socket.id
          );

          io.to(room).emit("activeUsers", activeUsers[room]);
        }
      });
    });
  },
};
