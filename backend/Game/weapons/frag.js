import { Rect } from "../plugins/rect.js"
import { Sprite } from "../plugins/sprite.js"

export function Frag(socket,player, Game){
    const res = {
        name: `Frag`,
        src: '',
        damage: 5,
        size: 10,
        array: [],
        stock: 1000,
        time: 120,
        t: 30,
        globalrate: 20,
        load(){
            player.character.keybinder.onkeyup({key: 'a', cb:()=>{
                this.t =  31
            }})
        },
        update(){
            this?.array?.forEach((arr, x)=>{
                arr.update()
                arr.updatebomb()
                if(arr.delete)this.array.splice(x, 1)
            })
        },
        createFrag(){
            const r = player.character.rect
            const rect = Rect(Game)
            const sprite = Sprite(socket, rect, Game).setname('bomb').set(1, 1).loadImage('weapons/bomb.png')
            const exp = Sprite(socket, rect, Game).setname('exp').set(4, 4).loadImage('effects/explosion.png')
            exp.addclip('explode').from(0).to(16).loop(false).delay(0)
            .onframe(14, ()=>{
                rect.remove()
                exp.remove()
            }).play()

            sprite.offw = 20
            sprite.offh = 20
            sprite.offx = -10
            sprite.offy = -10
            exp.offw = 50
            exp.offh = 50
            exp.offx = -30
            exp.offy = -30
            const signx = Math.sign(Math.sin(player.aimangle))
            const signy = Math.sign(Math.cos(player.aimangle))
            rect.vy = Math.sin(player.aimangle) * 10
            rect.vx = Math.cos(player.aimangle) * 15 
            rect.w = this.size
            rect.h = this.size
            rect.weight = 0.5
            rect.x = r.x + r.w /2
            rect.y = r.y + r.h/2
            rect.name = `bullet-${socket.id}`
            rect.addname(player.id)
            rect.id = player.id
            rect.exception.push(`player-${socket.id}`, `self`)
            rect.exception.push(rect.name)
            rect.timer = 0
            rect.time = this.time
            rect.oncollisionbottom(()=>{
                rect.vy = 0
                rect.vx = 0
            })
            let popped = false
            const pop =()=>{
                sprite.remove()
                rect.x -= this.size * 10
                rect.y -= this.size * 10
                rect.w =  this.size * 20
                rect.h =  this.size * 20
                rect.vx  =0
                rect.vy  =0
                rect.applygravity =false
                rect.name = `damage`
                rect.damage = this.damage
            }
            rect.updatebomb = ()=>{
                rect.timer ++
                if(rect.timer > rect.time - 30){
                    if(!popped){
                        pop()
                    }
                    popped = true
                    exp.update()
                    
                }
                if(rect.timer > rect.time){
                    this.array.splice(this.array.indexOf(rect), 1)
                    exp.remove()
                }

                sprite.update()
            }
            if(rect.iscolliding){rect.vx=0; rect.vy=0}
            return rect
        },
        lerp(a, b, t){return a + (b - a) * t},
        delay(cb){
            if(this.t > this.globalrate){
                cb()
                this.t =0
            }else this.t++
        },
        shoot(){
            this.delay(()=>{
                if(this.stock <= 0)return
                this.array.push(this.createFrag())
                if(this.stock !== Infinity){
                    this.stock --            
                }
            })
        },
        getstats(){
            return {
                src: this.src,
                damage: this.damage,

            }
        },
    }
    res.load()
    return res
}