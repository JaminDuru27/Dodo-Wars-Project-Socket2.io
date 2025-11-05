import { DeathMatch } from "./objects/deathmatch.js"

export function Modes(socket, io, Game, Room){
    const res = {
        modes: [DeathMatch(socket, io, Game, Room)],
        mode: undefined,
        setmode(name){
            this.modes.forEach(mode=>{
                if(mode.name === name){
                    this.mode = mode
                    this.mode.setup()
                }
            })
        },
        load(){
            this.setmode(`DeathMatch`)
        },
        update(){
            this?.mode?.update()
        },
    }
    res.load()
    return res
}