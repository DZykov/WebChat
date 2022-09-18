const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const formatMessage = require("./utils/messages");
const {
    create_room,
    delete_room,
    check_room,
    enter_room,
    add_user,
    delete_user,
    get_users
  } = require("./utils/rooms");
require("dotenv").config({path: `${__dirname}/.env`});

const app = express();

// app itself
app.use(express.json());
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

// db
const db = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb",
    port: "3306" // port name, "3306" by default
 });
 
 db.getConnection( (err, connection)=> {   if (err) throw (err)
    console.log ("DB connected successful: " + connection.threadId)})

// POST GET
app.get('/', function(request, response) {
	// Render login template
	response.sendFile("index.html", { root: path.join("public")});
    console.log('login page')
    console.log(request)
    console.log(response)
});

// create user
async function create_user(req,res) {
    const user = req.body.name;
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    db.getConnection( async (err, connection) => { 
        if (err) throw (err) 
    const sqlSearch = 'SELECT * FROM users WHERE username = ?';
    const search_query = mysql.format(sqlSearch,[user]);
    const sqlInsert = 'INSERT INTO users VALUES (?,?)';
    const insert_query = mysql.format(sqlInsert,[user, hashedPassword]);
    
    await connection.query (search_query, async (err, result) => {
        if (err) throw (err)
        console.log("------> Search Results")
        console.log(result.length);
        if (result.length != 0) {
            connection.release();
            console.log("------> User already exists");
            res.sendStatus(409);
        } else {
            await connection.query (insert_query, (err, result)=> {
                connection.release();
                if (err) throw (err);
                console.log ("--------> Created new User");
                console.log(result.insertId);
                const accessToken = generateAccessToken({user: req.body.name});
                const refreshToken = generateRefreshToken({user: req.body.name});
                res.json({accessToken: accessToken, refreshToken: refreshToken});
            });
        }
        });
    });
}

// login
app.post("/login", (req, res)=> {
    const user = req.body.name;
    const password = req.body.password;
    if(password.length==0){
        const accessToken = generateAccessToken({user: req.body.name});
        const refreshToken = generateRefreshToken({user: req.body.name});
        res.json({accessToken: accessToken, refreshToken: refreshToken});
        return;
    }
    db.getConnection ( async (err, connection)=> { 
        if (err) throw (err)
        const sqlSearch = "Select * from users where username = ?";
        const search_query = mysql.format(sqlSearch,[user]);
        
        await connection.query (search_query, async (err, result) => {
            connection.release();
            if (err) throw (err)
            
            if (result.length == 0) {
                console.log("--------> User does not exist");
                // create user
                create_user(req, res);
            } else {
                const hashedPassword = result[0].password;
                if (await bcrypt.compare(password, hashedPassword)) {
                    console.log("---------> Login Successful");
                    const accessToken = generateAccessToken({user: req.body.name});
                    const refreshToken = generateRefreshToken({user: req.body.name});
                    res.json({accessToken: accessToken, refreshToken: refreshToken});
                } else {
                    console.log("---------> Password Incorrect");
                    res.send("Password incorrect!");
                }
            } 
        });
    });
});

// login tokens
// accessToken
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "60m"});
}

// refreshToken
let refreshTokens = []; // change for redis or other dic server lib
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "65m"});
    refreshTokens.push(refreshToken)
    return refreshToken;
}

//refresh token
app.post("/refreshToken", (req,res) => {
    var accessToken = req.query.accessToken;
    var refreshToken = req.query.refreshToken;
    if (!refreshTokens.includes(refreshToken )) 
        res.status(400).send("Refresh Token Invalid");
    refreshTokens = refreshTokens.filter( (c) => c != refreshToken);
    //remove the old refreshToken from the refreshTokens list
    const n_accessToken = generateAccessToken ({user: req.body.name});
    const n_refreshToken = generateRefreshToken ({user: req.body.name});
    //generate new accessToken and refreshTokens
    res.json({accessToken: n_accessToken, refreshToken: n_refreshToken});
});

app.delete("/logout", (req,res) => {
    var accessToken = req.query.accessToken;
    var refreshToken = req.query.refreshToken;
    refreshTokens = refreshTokens.filter( (c) => c != refreshToken)
    //remove the old refreshToken from the refreshTokens list
    res.status(204).send("Logged out!")
});

app.get('/chat', (req, res) => {
	// Render chat template
    var accessToken = req.query.accessToken;
    var refreshToken = req.query.refreshToken;
    validateToken(req, res, accessToken);
});

function validateToken(req, res, token){
    if (token == null){
        res.status(400).send("Token not present");
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) { 
                res.status(403).send("Token is invalid");
            } else {
                res.sendFile("chat.html", { root:  path.join("public")});
            }
        });
    }
}

app.get('/about', function(request, response) {
	// Render login template
	response.sendFile("about.html", { root:  path.join("public")});
});

// Polling with socket
io.on('connection', socket => {

    socket.on('add_to_room', (room_id_value, room_pass_value, username) => {        
        if(check_room(room_id_value)){
            if(enter_room(room_id_value, room_pass_value)){
                socket.join(room_id_value);
                socket.emit('get_response', 'Connected!');
                socket.emit('add_room', room_id_value);
                io.to(room_id_value).emit('receive_message', formatMessage(username, 'Join room!'), room_id_value);
                io.to(room_id_value).emit('add_user', room_id_value, username);
                io.to(room_id_value).emit('receive_all_users', room_id_value, get_users(room_id_value));
                add_user(room_id_value, username);
            } else{
                socket.emit('get_response', 'Wrong password!');
            }
        } else {
            create_room(room_id_value, room_pass_value);
            socket.join(room_id_value);
            socket.emit('get_response', 'Room was created!');
            socket.emit('get_response', 'Connected!');
            socket.emit('add_room', room_id_value);
            io.to(room_id_value).emit('receive_message', formatMessage(username, `Created room ${room_id_value}!`), room_id_value);
            io.to(room_id_value).emit('receive_message', formatMessage(username, 'Join room!'), room_id_value);
            io.to(room_id_value).emit('add_user', room_id_value, username);
            io.to(socket.id).emit('receive_all_users', room_id_value, get_users(room_id_value));
            add_user(room_id_value, username);
        }
    });

    socket.on('send_message', (room_id_value, username, msg) => {
        if(msg === ''){
            return;
        }
        io.to(room_id_value).emit('receive_message', formatMessage(username, msg), room_id_value);
        io.to(room_id_value).emit('add_user', room_id_value, username);
    });
    
    socket.on('leave_room', (room_id_value, username) => {
        io.to(socket.id).emit('leave_room_client', room_id_value, get_users(room_id_value));
        delete_user(room_id_value, username);
        io.to(room_id_value).emit('delete_user', room_id_value, username);
        io.to(room_id_value).emit('receive_message', formatMessage(username, 'left room!'), room_id_value);
        
        const clients = io.sockets.adapter.rooms.get(room_id_value);
        const num_clients = clients.size;
        socket.leave(room_id_value);
        if(num_clients == 0){
            delete_room(room_id_value);
        }

    });
});

const PORT = 3000 || process.env.PORT;


server.listen(PORT, () => {
    console.log('Server is running!');
});
