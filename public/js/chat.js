const socket = io('localhost:3000');

let room_id = document.querySelector('#room-id-new');
let room_pass = document.querySelector('#room-pas-new');
let leave_button = document.querySelector('#leave-button');
let join_button = document.querySelector('#join-button');
let select_win = document.querySelector('#rooms');
let users_lsy = document.querySelector('#users');
let current_room = document.querySelector('#room-id');
// send button + form