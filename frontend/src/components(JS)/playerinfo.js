export function playerinfo(socket)
{
    return {
        id: socket.id, 
        info:{name: 'Mao', level: 20},
        mode: 'deathmatch',
        name: 'Mao',
    }
}
