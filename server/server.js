const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

app.use(express.static(path.join("public")));
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origins: ["*"], // change for the front??? Do I have a server for front?
        methods: ["GET", "POST", "POLLING"],
      allowedHeaders: ["content-type"],
        handlePreflightrequest:(req, res) => {
            res.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": ["GET", "POST", "POLLING"]
            });
            res.end();
        }
    }
});

// POST GET
app.get('/', function(request, response) {
	// Render login template
	response.sendFile("index.html", { root: path.join("public")});
    console.log('login page')
    console.log(request)
    console.log(response)
});

app.get('/chat', function(request, response) {
	// Render chat template
	response.sendFile("chat.html", { root:  path.join("public")});
    console.log('chat page')
    console.log(request)
    console.log(response)
});

app.get('/about', function(request, response) {
	// Render login template
	response.sendFile("about.html", { root:  path.join("public")});
    console.log('about page')
    console.log(request)
    console.log(response)
});

// Polling with socket
io.on('connection', socket => {
    console.log("Connected")
    console.log(socket.id)
});

const PORT = 3000 || process.env.PORT


server.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);