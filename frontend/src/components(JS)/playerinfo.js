export function playerinfo(socket)
{
    return {
        id: socket.id, 
        info:{
            name: 'Mao', 
            level: 1,
            levelperc: 10,
            character: 'DodoMan',
        },
    }
}
