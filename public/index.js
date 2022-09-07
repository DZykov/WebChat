const startChatBtn = document.querySelector('#startChatBtn');
const menuModel = document.querySelector('#menuModel');
const room_id = document.querySelector('#room_id');
const room_password = document.querySelector('#room_password');
const user_name = document.querySelector('#user_name');
const user_password = document.querySelector('#user_password');

let room_id_value;
let room_password_value;
let user_name_value;
let user_password_value;

// input from hml
startChatBtn.addEventListener('click', () => {
    room_id_value =  room_id.value;
    room_password_value = room_password.value;
    user_name_value = user_name.value;
    user_password_value = user_password.value;

    console.log(room_id_value )
    console.log(room_password_value )
    console.log(user_name_value )
    console.log(user_password_value )
});