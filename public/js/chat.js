const socket = io('localhost:3000');

var {username} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

var {accessToken} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

var {refreshToken} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

var start = Date.now();
setInterval(function() {
    var delta = Date.now() - start; // milliseconds elapsed since start
    var t = Math.floor(delta / 1000);
    if(t==3600){
      socket.emit('refresh_token', refreshToken, accessToken);
      start = Date.now();
    }
}, 1000);

socket.on('get_token', get_token);
function get_token(data){
    if(data==='error'){
        alert(data);
    } else {
        accessToken = data['accessToken'];
        refreshToken = data['refreshToken'];
    }
}

var max_select = 10;
const rooms = [];
var users = [];

let room_id;
let room_pass;

const leave_button = document.querySelector('#leave-button');
const join_button = document.querySelector('#join-button');
const select_win = document.querySelector('#rooms');
const users_lst = document.querySelector('#users');
const current_room = document.querySelector('#room-id');
const chat_messages = document.querySelector('#chat-messages');
const send_button = document.querySelector('#send-button');

// socket functions + helpers
socket.on('get_response', get_response);
function get_response(data){
    console.log(data);
}

socket.on('add_room', add_room);
function add_room(room){
    rooms.push(room);

    room_id = document.querySelector('#room-id-new');
    room_pass = document.querySelector('#room-pass-new');
    room_id_value = room_id.value;
    room_pass_value = room_pass.value;

    hide_all_rooms();

    var opt = document.createElement('option');
    opt.value = room_id.value;
    opt.innerHTML = room_id.value;
    select_win.appendChild(opt);
    select_win.value = room_id.value;
    
    const div = document.createElement('div');
    div.classList.add(room_id.value);
    chat_messages.appendChild(div);

    const divu = document.createElement('ul'); // change
    divu.classList.add(room_id.value+'_users'); // users list )
    users_lst.appendChild(divu);
    document.querySelector('#room-id-new').value = '';
    document.querySelector('#room-pass-new').value = '';
}

socket.on('add_user', add_user);
function add_user(room_id_value, usernamef){
    if(users.includes(usernamef)){
        return;
    }
    users.push(usernamef);
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(usernamef));
    document.getElementsByClassName(room_id_value+'_users')[0].appendChild(li);
}

socket.on('receive_all_users', receive_all_users);
function receive_all_users(room_id_value, users_l){
    var arrayLength = users_l.length;
    for (var i = 0; i < arrayLength; i++) {
        if(!users.includes(users_l[i])){
            users.push(users_l[i]);
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(users_l[i]));
            document.getElementsByClassName(room_id_value+'_users')[0].appendChild(li);
        }
    }
}

socket.on('delete_user', delete_user);
function delete_user(room_id_value, usernamef){
    if(document.getElementsByClassName(room_id_value+'_users')[0]===undefined){
        return;
    }
    const index = users.indexOf(usernamef);
    if (index > -1) {
        users.splice(index, 1);
    }
    var lis = document.getElementsByClassName(room_id_value+'_users')[0].childNodes;
    for(var i=0; li=lis[i]; i++) {
        if(li.outerText===usernamef){
            li.parentNode.removeChild(li);
        }
    }
}

socket.on('leave_room_client', leave_room_client);
function leave_room_client(room_id_value, users_l){
    var lis = select_win.childNodes;
    for(var i=0; li=lis[i]; i++) {
        if(li.value===room_id_value){
            li.parentNode.removeChild(li);
        }
    }
    const index = rooms.indexOf(room_id_value);
    if (index > -1) {
        rooms.splice(index, 1);
    }
    users = users.filter( ( el ) => !users_l.includes( el ) );
    var lis = document.getElementsByClassName(room_id_value+'_users')[0];
    lis.parentNode.removeChild(lis);
    chat_messages.removeChild(document.getElementsByClassName(room_id_value)[0]);
}

socket.on('receive_message', receive_message);
function receive_message(msg, room_id_value){
    output_message(msg, room_id_value);
    chat_messages.scrollTop = chat_messages.scrollHeight;
}
function output_message(message, room_id_value) {
    if(document.getElementsByClassName(room_id_value)[0]===undefined){
        return;
    }
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.getElementsByClassName(room_id_value)[0].appendChild(div);
  }

// html input
join_button.addEventListener('click', () => {
    room_id = document.querySelector('#room-id-new');
    room_pass = document.querySelector('#room-pass-new');
    room_id_value = room_id.value;
    room_pass_value = room_pass.value;
    
    if(rooms.includes(room_id_value)){
        return;
    }

    socket.emit('add_to_room', room_id_value, room_pass_value, username);
});

leave_button.addEventListener('click', () =>{
    var active_room = select_win.options[select_win.selectedIndex].value;
    socket.emit('leave_room', active_room, username);
});

send_button.addEventListener('click', () => {
    msg_field = document.querySelector('#msg');
    message = msg_field.value;
    msg_field.value = null;

    socket.emit('send_message', room_id_value, username, message);
});

select_win.addEventListener('change', function handle_change(event){
    var active_room = select_win.options[select_win.selectedIndex].value;
    hide_all_rooms();
    document.getElementsByClassName(active_room)[0].style.display = '';
    document.getElementsByClassName(active_room+'_users')[0].style.display = '';
});

// helpers
function hide_all_rooms(){
    const childern = chat_messages.childNodes;
    childern.forEach(div => {
        div.style.display = 'none';
    });
    const childern_users = users_lst.childNodes;
    childern_users.forEach(div => {
        div.style.display = 'none';
    });
}