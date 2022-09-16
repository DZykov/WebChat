const socket = io('localhost:3000');

const {username} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

var max_select = 10;

let room_id;
let room_pass;

const leave_button = document.querySelector('#leave-button');
const join_button = document.querySelector('#join-button');
const select_win = document.querySelector('#rooms');
const users_lst = document.querySelector('#users');
const current_room = document.querySelector('#room-id');

// send button + form

socket.on('get_response', get_response);
function get_response(data){
    console.log(data);
}

socket.on('add_room', add_room);
function add_room(room){
    var opt = document.createElement('option');
    opt.value = room;
    opt.innerHTML = room;
    select_win.appendChild(opt);
    select_win.value = room;
}

// html input
join_button.addEventListener('click', () => {
    room_id = document.querySelector('#room-id-new');
    room_pass = document.querySelector('#room-pass-new');
    room_id_value = room_id.value;
    room_pass_value = room_pass.value;
    socket.emit('add_to_room', room_id_value, room_pass_value, username);
});