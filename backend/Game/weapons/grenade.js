import { Rect } from "../plugins/rect.js"
import { Sprite } from "../plugins/sprite.js"

export function Grenade(socket,player, Game){
    const res = {
        name: `Grenade`,
        src: '',
        damage: 5,
        size: 10,
        array: [],
        stock: 1000,
        time: 120,
        t: 30,
        globalrate: 20,
        $bullets: 2,
        $maxbullets: 2,
        $mags: 2,
        $maxmags: 2,
        load(){
            this.rect = Rect(Game, false)
            this.rect.w -= 20
            this.rect.h -= 20
            this.sprite  = Sprite(socket, this.rect, Game).setname(`grenadebomb`).set(1, 1).loadImage(`weapons/Grenade/grenade.png`)
            this.sprite.addclip(`p`).from(0).to(1).loop(false).play()
            player.character.keybinder.onkeyup({key: 'a', cb:()=>{
                this.t =  31
            }})
        },
        hide(){this.sprite.hidden = true;return this},
        show(){this.sprite.hidden = false;return this},
        update(){
            this?.rect?.update()
            this.rect.x = (player.character.sprite.flip)?player.character.rect.x + 20: player.character.rect.x
            this.rect.y = player.character.rect.y + 10
            this?.sprite?.update()
            
            this?.array?.forEach((arr, x)=>{
                arr.update()
                if(arr.delete)this.array.splice(x, 1)
            })
        },
        createGrenade(){
            this.$bullets --
            if(this.$bullets <= 0){
                if(this.$mags > 0){
                    this.$bullets = this.$maxbullets
                    this.$mags --
                }
            }
            if(this.$bullets <=  0 && this.$mags <= 0){
                this.$bullets = 0
                this.$mags = 0
                return {delete: true,update(){}}
            }
            let del
            const r = player.character.rect
            const rect = Rect(Game)
            rect.x  = r.x + r.w + 2
            rect.lx  = r.x 
            rect.y  = r.y
            rect.weight = 0.5
            const speed = 10
            rect.vx = Math.cos(player.aimangle) * speed
            rect.vy = Math.sin(player.aimangle) * speed
            rect.slidex = 0.2
            rect.exception.push(`player`,`self`)
            rect.addname(`playerexception`)
            let grounded

            rect.oncollisionwith(`player`, (rect)=>{
                if(rect?.id !== player.id && !grounded){
                    rect.vx = 0
                    rect.vy = 0
                    rect.attach(rect)                
                    rect.applygravity = false
                    rect.shouldresolve = false
                    startTimeout()
                    grounded = true
                }
            }) 
            rect.oncollisionwith(`tile`,()=>{
                if(grounded)return
                rect.vx = 0
                rect.vy = 0
                rect.attach(rect)
                rect.applygravity = false
                rect.shouldresolve = false
                startTimeout()
                grounded = true
            })
            
            let timeout
            const startTimeout = ()=>{
                clearTimeout(timeout)
                timeout = setTimeout(()=>{
                    sprite.hidden=true
                    sprite.remove()
                    if(rect.stop)return
                    rect.addname(`damage`)
                    rect.x -=150
                    rect.y -= 150
                    rect.w = 150
                    rect.h = 150
                    rect.stop = true
                    exp.offw = 150
                    exp.offh= 150
                    exp.hidden = false
                    exp.playclip(`explode`)
                
                }, 1000)
            }

            const sprite = Sprite(socket, rect, Game).setname('bomb').set(1, 1).loadImage('/weapons/Grenade/grenade.png')
            const exp = Sprite(socket, rect, Game).setname('exp').set(4, 4).loadImage('/effects/explosion.png')
            exp.addclip('explode').from(0).to(16).loop(false).delay(0)
            .onframe(14, ()=>{
                rect.remove()
                exp.remove()
                del = true
            })
            exp.hidden = true



            return {
                delete :del,
                update(){
                    this.delete = del
                    rect.update()
                    exp.update()
                    sprite.update()
                }
            }
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
                this.array.push(this.createGrenade())
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