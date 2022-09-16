const rooms = {};

function create_room(name, pass){
    rooms[name] = pass;
}

function delete_room(name){
    delete rooms[name];
}

function check_room(name){
    return name in rooms;
}

function enter_room(name, pass){
    return rooms[name] === pass;
}

module.exports = {
    create_room,
    delete_room,
    check_room,
    enter_room
};