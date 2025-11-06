import { Game } from "./game.js"

export function Room(roomid, socket, io, updates){
    const res ={
        roomid,
        hostid: socket.id,
        players : [],
        add(player){
            // if(!this.players.find(p=>p.id === player.id))
            this.players.push(player)
            console.log(this.players.length, `players in Room ${roomid}`)
        },
        getInfo(){
            return {
                name: this.name, 
                id: this.roomid, 
                hostid: this.hostid,
                players: this.players,
                add: this.add,
                load: this.load
            }
        },
        load(){
            this.game = Game(socket, io, this)
            updates.push(this.game)
        }
    }
    return res
}