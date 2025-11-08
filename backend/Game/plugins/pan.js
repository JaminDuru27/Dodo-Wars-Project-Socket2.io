
export function Pan(socket,Game, player,rect){
    const res ={
        offx: 0, offy: 0, offw: Game.W/2, offh: Game.W/2,
        originaloffw: Game.W/2, originaloffh: Game.W/2,
        sx: 1, sy: 1,
        $onoutsidegameleft:[],
        $onoutsidegametop:[],
        $onoutsidegameright:[],
        $onoutsidegamebottom:[],
        onoutsidegameright(cb){this.$onoutsidegameright.push(cb);return this},
        onoutsidegameleft(cb){this.$onoutsidegameleft.push(cb);return this},
        onoutsidegametop(cb){this.$onoutsidegametop.push(cb);return this},
        onoutsidegamebottom(cb){this.$onoutsidegamebottom.push(cb);return this},
        centerX(){this.offx = (-this.offw/2 + rect.w/2)},
        centerY(){this.offy = (-this.offh/2 + rect.h/2)},
        center(){
            this.centerX()
            this.centerY()
        },
        outBottom(){return rect.y + this.ty > Game.world.h},
        outRight(){return rect.x + this.tx > Game.world.w},
        outTop(){return rect.y - this.ty < 0},
        outLeft(){return rect.x - this.tx < 0},

        checkleft(){return this.x < -this.tx},
        checktop(){return this.y < -this.ty},
        checkright(){return this.x + this.offw + this.tx > player.gameW },
        checkbottom(){return this.y + this.offh  + this.ty> player.gameH },
        checkoutsideveiwport(){
            return (
                this.checkleft() ||
                this.checkright() ||
                this.checkbottom() ||
                this.checktop()
            )
        },
        checkoutsidegame(){
            return (
                // this.outleft()||
                this.outbottom()
            )
        },
        load(){
            this.center()
            socket.on(`get-sx`, (sx)=>{
                this.sx  =sx
                this.centerX()
            })    
            socket.on(`get-sy`, (sy)=>{
                this.sy  =sy
                this.centerY()
            })                    
        },
        setty(ty){
            socket.emit(`set-ty`, (ty))
        },
        settx(tx){
            socket.emit(`set-tx`, (tx))
        },
        resolve(){
            if(rect.vy < 0 && this.checktop()){
                socket.emit(`translate-y`, (rect.vy))
            }
            if(rect.vy > 0 && this.checkbottom()){
                socket.emit(`translate-y`, (rect.vy))
            }
            if(rect.vx > 0 && this.checkright()){
                socket.emit(`translate-x`, (rect.vx))
            }
            if(rect.vx < 0 && this.checkleft()){
                socket.emit(`translate-x`, (rect.vx))
            }
        },
        call(name){this[`$${name}`].forEach(cb=>cb())},
        events(){
            if(this.outRight())this.call(`onoutsidegameright`)
            if(this.outLeft())this.call(`onoutsidegameleft`)
            if(this.outTop())this.call(`onoutsidegametop`)
            if(this.outBottom())this.call(`onoutsidegamebottom`)
        },
        update(){
            this.x = rect.x + this.offx * this.sx 
            this.y = rect.y + this.offy  * this.sy
            this.offw = this.originaloffw *  this.sx
            this.offh = this.originaloffh *this.sy
            this.resolve()
            this.events()
            // console.log(this.checkoutsidegame())
        }
    }
    res.load()
    socket.on(`translate`, ({tx, ty})=>{
        res.tx = tx
        res.ty = ty
    })
    return res
}