const rooms = {};
const rooms_users = {};

function create_room(name, pass){
    rooms[name] = pass;
    rooms_users[name] = [];
}

function delete_room(name){
    delete rooms[name];
    delete rooms_users[name];
}

function check_room(name){
    return name in rooms;
}

function enter_room(name, pass){
    return rooms[name] === pass;
}

function add_user(name, user){
    rooms_users[name].push(user);
}

function delete_user(name, user){
    const index = rooms_users[name].indexOf(user);
    if (index > -1) {
        rooms_users[name].splice(index, 1);
    }
}

function get_users(name){
    return rooms_users[name];
}

module.exports = {
    create_room,
    delete_room,
    check_room,
    enter_room,
    add_user,
    delete_user,
    get_users
};