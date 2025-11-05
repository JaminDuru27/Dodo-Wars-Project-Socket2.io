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
                p.onkill(()=>{
                    console.log(p.score, p.id)
                })
            })
        },
        startAnimation(){
            this.animator = Animate()
            this.animator.addAnimation(`intro`)
            .from(this)
            .key(0, ()=>{
                io.to(Room.id).emit(`set-ltx`, (0))
                io.to(Room.id).emit(`set-intvalue`, (0.02))
            })
            .key(2, ()=>{
                io.to(Room.id).emit(`set-ltx`, (-Game.world.w/2 + Game.W))
                // io.to(Room.id).emit(`set-lty`, (-Game.world.h/3 + Game.H))
                io.to(Room.id).emit(`set-intvalue`, (0.007))

            })
            .key(8, ()=>{
                io.to(Room.id).emit(`set-ltx`, (-Game.world.w + Game.W))
                io.to(Room.id).emit(`set-lty`, (-Game.world.h + Game.H))
            })
            .key(20, ()=>{
                io.to(Room.id).emit(`set-ltx`, (-Game.world.w + Game.W))
                io.to(Room.id).emit(`set-lty`, (0))
                io.to(Room.id).emit(`set-intvalue`, (0.05))
            })
            .key(30, ()=>{
                io.to(Room.id).emit(`set-ltx`, (0))
                io.to(Room.id).emit(`set-lty`, (0))
                // Game.loadPlayerObject()
            })
            .key(35, ()=>{
                io.to(Room.id).emit(`set-ltx`, (-0))
                io.to(Room.id).emit(`set-lty`, (-Game.world.h + Game.H))
                Game.loadPlayerObject()
                
            })
            .key(36, ()=>{
                this.configplayers()
            })
            .key(36, ()=>{
                Game.players.forEach(player=>{
                    player.character.target(undefined, false)
                })
            })
            this.animator.playAnimation(`intro`)
        },
        update(){
            this?.animator?.update()
        },       
    }
    return res
}