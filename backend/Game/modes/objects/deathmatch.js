import { Animate } from "../../plugins/animation.js"

export function DeathMatch(socket, io, Game, Room){
    const res = {
        name: `DeathMatch`,
        scores: [],        
        scoreinc:2,
        setup(){
            this.startAnimation()
        },
        
        configplayers(){
            
            Game.players.forEach(p=>{
                p.score = 0
            })
        },
        startAnimation(){
            Game.world.data.introanimation(()=>{
            this.animator.playAnimation(`intro`)
            })

            this.animator = Animate()
            this.animator.addAnimation(`intro`)
            .from(this)
            .key(0, ()=>{
                io.to(Room.id).emit(`set-ltx`, (0))
                io.to(Room.id).emit(`set-lty`, (0))
                // Game.loadPlayerObject()
            })
            .key(5, ()=>{
                io.to(Room.id).emit(`set-ltx`, (-0))
                io.to(Room.id).emit(`set-lty`, (-Game.world.h + Game.H))
                Game.loadPlayerObject()
                
            })
            .key(6, ()=>{
                this.configplayers()
            })
            .key(6, ()=>{
                Game.players.forEach(player=>{
                    player.character.target(undefined, false)
                })
            })
        },
        update(){
            this?.animator?.update()
            Game.world.data?.update()
        },       
    }
    return res
}