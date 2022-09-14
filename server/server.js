const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require("bcrypt")
require("dotenv").config();

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
                res.sendStatus(201);
            });
        }
        });
    });
}

// login
app.post("/login", (req, res)=> {
    const user = req.body.name
    const password = req.body.password
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
         //get the hashedPassword from result    
                if (await bcrypt.compare(password, hashedPassword)) {
                    console.log("---------> Login Successful");
                    res.send(`${user} is logged in!`);
                } else {
                    console.log("---------> Password Incorrect");
                    res.send("Password incorrect!");
                }
            } 
        });
    });
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

const PORT = 3000 || process.env.PORT;


server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running!');
});