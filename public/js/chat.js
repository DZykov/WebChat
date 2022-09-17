const socket = io('localhost:3000');

const {username} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

var max_select = 10;
const rooms = [];

let room_id;
let room_pass;

const leave_button = document.querySelector('#leave-button');
const join_button = document.querySelector('#join-button');
const select_win = document.querySelector('#rooms');
const users_lst = document.querySelector('#users');
const current_room = document.querySelector('#room-id');
const chat_messages = document.querySelector('#chat-messages');

// socket functions + helpers
socket.on('get_response', get_response);
function get_response(data){
    console.log(data);
}

socket.on('add_room', add_room);
function add_room(room){
    rooms.push(room);
}

socket.on('receive_message', receive_message);
function receive_message(msg, room_id_value){
    output_message(msg, room_id_value);
    chat_messages.scrollTop = chat_messages.scrollHeight;
}
function output_message(message, room_id_value) {
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
    
    hide_all_rooms();

    const children_chat = chat_messages.childNodes;
    var opt = document.createElement('option');
    opt.value = room_id.value;;
    opt.innerHTML = room_id.value;;
    select_win.appendChild(opt);
    select_win.value = room_id.value;;
    
    const div = document.createElement('div');
    div.classList.add(room_id.value);
    document.querySelector('#chat-messages').appendChild(div);

    socket.emit('add_to_room', room_id_value, room_pass_value, username);
});

select_win.addEventListener('change', function handle_change(event){
    var active_room = select_win.options[select_win.selectedIndex].value;
    hide_all_rooms();
    document.getElementsByClassName(active_room)[0].style.display = '';
});

// helpers
function hide_all_rooms(){
    const childern = chat_messages.childNodes;
    childern.forEach(div => {
        div.style.display = 'none';
    });
}