const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(express.static(path.join("..", "public")));
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origins: ["*"],
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
app.get('/auth', function(request, response) {
	// Render login template
	response.sendFile("index.html", { root: __dirname});
    console.log('get req')
});

// Run when clinet connects to socket
io.on('connection', socket => {
    console.log("Connected")
    console.log(socket.id)
});

const PORT = 3000 || process.env.PORT


server.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);