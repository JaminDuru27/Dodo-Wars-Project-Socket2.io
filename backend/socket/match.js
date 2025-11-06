import { Player } from "../Game/player(socket).js"
import { Room } from "../Game/room.js"

const waitingPlayers = []
const players = {}
const rooms = {}
const updates = []
export function MatchSocket(io){
    let interval = setInterval(()=>{
    updates.forEach(obj=>{
          obj.update()
          if(Object.keys(rooms).length >0)
            io.emit('get-rooms', [...Object.keys(rooms)])
        })
    }, 16)
    io.on('connect', (socket)=>{
        socket.on('disconnect', ()=>{
            console.log(`player ${socket.id} disconnected from MatchSocket`)
            //delete from players list
            delete players[socket.id]

            // remove from waiting players
            const index = waitingPlayers.findIndex(p=>p.id === socket.id)
            if(index !== -1){
                waitingPlayers.splice(index, 1)
                console.log(`Player ${socket.id} removed from waiting players on disconnect`)
            }

            //remove from room
            for(let rmid in rooms){
                const room = rooms[rmid]
                const pIndex = room.players.findIndex(p=>p.id === socket.id)
                if(pIndex !== -1){
                    room.players.splice(pIndex, 1)
                    console.log(`Player ${socket.id} removed from Room ${rmid} on disconnect`)
                    //if room empty, delete room
                    if(room.players.length === 0){
                        delete rooms[rmid]
                        console.log(`Room ${rmid} deleted as it became empty`)
                    }
                }
            }
        })
        socket.on('ping', ()=>{
            socket.emit('pong')
        })
        socket.on('login', (data)=>{
            console.log(`Player ${data.id} logged into MatchSocket with name: ${data.name}`)
        })
        socket.on('cancel-matchmake', (data)=>{
            const index = waitingPlayers.findIndex(p=>p.id === data.id)
            if(index !== -1){
                waitingPlayers.splice(index, 1)
                console.log(`Player ${data.id} cancelled matchmaking`)
            } 
        })
        socket.on('matchmake', (data)=>{
            console.log(`Player ${data.id} is looking for a match with mode: ${data.mode}`)
            const p = {id: data.id, info:data.info, name: data.name, mode: data.mode}
            waitingPlayers.push(p)
            
            const number = 1
            
            if(waitingPlayers.length >= number){
                let players = []
                let roomid = 'match-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
                const room = Room(roomid, socket, io, updates).getInfo()
                rooms[roomid] = room
                for (let i = 0; i < number; i++){
                    players.push(waitingPlayers[i])
                }
                players.forEach(player=>{
                    const socket = io.sockets.sockets.get(player.id)
                    socket.join(roomid)
                    waitingPlayers.splice(waitingPlayers.indexOf(player), 1)
                    room.add(Player(socket, io, player.info).getInfo())  
                })
                
                io.to(roomid).emit('matched', {roomid: roomid, players: players})
                console.log(`successfully matched players into Room ${roomid}`)
                io.emit('get-rooms', [...Object.keys(rooms)])    
                room.load()

            }
            
        })
    })
}