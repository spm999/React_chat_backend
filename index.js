const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const { addUser, removeUser, getUser,
	getUsersInRoom } = require("./users.js");

process.env.PORT="https://reactchat-ijnk.onrender.com/"
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(cors())

// const io = new Server(server, {
//   // http://localhost:3000
//   // `https://multiplayer-chess-site.onrender.com`
//   cors: {
//     origins: `https://reactchat-ijnk.onrender.com`,

//     // location of frontend (need to somehow specify port to render so that this code works)
//     // I might be able just pass the render site link
//     // I also forgot to add socket.io connect link to frontend in chessGame which is probably why I received an error
//     methods: ["GET", "POST"],
//   },
//   pingInterval: 2000,
//   pingTimeout: 10000,
// });



io.on("connection", (socket) => {
	socket.on('join', ({ name, room }, callback) => {

		const user = addUser(
			{ id: socket.id, name, room });



		// if (error) return callback(error);

		// Emit will send message to the user
		// who had joined
		socket.emit('message', {
			user: 'admin', 
			text:`${user.name},welcome to room ${user.room}.`
		});

		// Broadcast will send message to everyone
		// in the room except the joined user
		socket.broadcast.to(user.room).emit('message', {
				user: "admin",
				text: `${user.name}, has joined`
			});

		socket.join(user.room);

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});
		callback();
	})


	socket.on('sendMessage', (message, callback) => {

		const user = getUser(socket.id);
		io.to(user.room).emit('message',
			{ user: user.name, text: message });

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});
		callback();
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		// socket.leave(user.room, socket.user);

		if (user) {
			io.to(user.room).emit('message',
				{
					user: 'admin', text:
						`${user.name} had left`
				});
		}

	})

})


server.listen(process.env.PORT || 5000,
	() => console.log(`Server has started.`));


