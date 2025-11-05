import { Animate } from "../plugins/animation.js"
import { Rect } from "../plugins/rect.js"
import { Sprite } from "../plugins/sprite.js"
import { StateManager } from "../plugins/stateManager.js"

export function Bazooka(socket, player, Game){
    const res = {
        name: `Bazooka`,
        src: '',
        bullets: [],
        sprites: [],
        t:30, firetime: 30,
        $bullets: 2,
        $maxbullets: 2,
        $mags: 5,
        $maxmags: 5,
        load(){
            let prevangle = 0
            this.rect = Rect(Game, false)
            this.rect.w = 160
            this.rect.h = 60
            this.rect.shouldresolve = false
            this.rect.updateall = ()=>{
                this.rect.update(``)
            }
            this.sprite = Sprite(socket, this.rect, Game).setname('Bazooka').set(8, 1)
            .loadImage(`/public/weapons/Bazooka/bazooka.png`)
            this.sprite.addclip(`Shoot`).from(0).to(8).loop(false).delay(0)
            .onframe(8, ()=>{
                this.stateManager.setstate(`Idle`)
            })
            
            this.spritereload= Sprite(socket, this.rect, Game).setname('ccBazookareload').set(16, 1)
            .loadImage(`/public/weapons/Bazooka/load.png`)
            this.spritereload.addclip(`play`).from(0).to(16).loop(true).delay(2)
            .onframe(16, ()=>{
                console.log(`rekoad aubun`)
                this.$reloading = false
            }).play()
            
            this.sprites.push(this.sprite, this.spritereload)
            this.stateManager = StateManager()
            this.stateManager.add().name('Idle').cond(()=>!this.$reloading && !this.$attacking && this.$bullets > 0 && this.$mags > 0)
            .cb(()=>{
                this.sprite.playclip(`Idle`)
                this.sprite.hidden = false
                this.spritereload.hidden = true
            })
            this.stateManager.setstate(`Idle`)

            this.stateManager.add().name('Shoot').cond(()=>false)
            .cb(()=>{
                this.sprite.playclip(`Shoot`)
                this.sprite.hidden = false
                this.spritereload.hidden = true
            })
            this.stateManager.add().name('Empty').cond(()=>false)
            .cb(()=>{
                this.stateManager.setstate(`Idle`)
            })

            this.stateManager.add().name('Reload').cond(()=>false)
            .cb(()=>{
                this.sprite.hidden = true
                this.spritereload.hidden = false
                this.spritereload.playclip(`play`)
            })
             this.animator = Animate()
                this.animator.addAnimation(`recoil`)
                .from(player.character.rect)
                .key(0,()=>{
                    if(!(player.character.sprite.flip))player.character.rect.vx = -5 
                    else player.character.rect.vx = 5 
                    prevangle = player.aimangle
                    if(Math.sin(player.aimangle) > 0)player.character.rect.vy = -8
                    player.aimangle += 0.3
                })
                .key(1,{vx: 0})
                .key(2,()=>{
                    player.aimangle -= 0.3
            })


            player.character.keybinder.onkeyup({key:'a',cb:()=>{
                this.t = 40
                this.$attacking = false

            }})
        },
        hide(){
            this.sprite.hidden = false
            this.spritereload.hidden = false
            return this
        },
        show(){
            this.stateManager.setstate(`Idle`)
            return this
        },
        createBullet(){
            let set  = true
            const rect = Rect(Game)
            rect.vx = Math.cos(player.aimangle)
            rect.vy = Math.sin(player.aimangle)
            rect.x = player.character.rect.x + 40
            rect.y = player.character.rect.y + 10
            rect.w = 20
            rect.h = 10
            rect.speed =  6
            rect.weight =  0
            rect.exception = [`player-${socket.id}`, `self`, `damage`]
            rect.l = 0
            rect.name = `bullet-${socket.id}`
            rect.addname(player.id)
            rect.id = player.id
            rect.damage = 20
            rect.vx *= rect.speed
            rect.vy *= rect.speed
            rect.id = socket.id
            const sprite = Sprite(socket, rect, Game).setname('bullet').set(1, 1)
            .loadImage(`/public/weapons/Bazooka/ammo.png`)
            sprite.rotation = player.aimangle
            if(this.spritespark)this.spritespark.remove()

            const spritedust = Sprite(socket, rect, Game).setname('bullet-dust')
            .set(4, 4).loadImage(`/public/effects/explosion.png`)
            spritedust.addclip(`explode`).from(0).to(15).loop(false).delay(0)
            .onframe(15, ()=>{
                rect.remove()
                rect.delete = true
                spritedust.remove()
            })
            spritedust.hidden = true
            spritedust.offw = 10
            spritedust.offh = 10
            
            sprite.offw = 5
            sprite.offh = 5
            rect.updateall = ()=>{
                rect.update()
                sprite.update()
                rect.x += rect.vx
                rect.y += rect.vy
                rect.l += rect.vx
                if(rect.l > 350){
                    rect.vx =0
                    rect.vy =0
                    rect.remove()
                    sprite.remove()
                    rect.delete = true
                }
                if(rect.iscolliding && set){
                    rect.x  -= 100
                    rect.y  -= 100
                    rect.w  = 200
                    rect.h  = 200
                    spritedust.playclip(`explode`)
                    rect.name = `damage`
                    rect.vx =0
                    rect.vy =0
                    spritedust.hidden = false

                    sprite.remove()
                    set = false
                }
                spritedust.update()

            }
            return rect
        },
        shoot(){
            this.t ++
            if(this.t >= this.firetime){
                 if(this.$reloading)return
                if(this.$bullets <= 0 && this.$mags >0){
                    this.stateManager.setstate('Reload')
                    console.log(`reload`)
                    this.$bullets = this.$maxbullets
                    this.$mags --
                    this.$reloading  = true
                }
                else if(this.$bullets <=0 && this.$mags <= 0){
                    this.stateManager.setstate('Empty')
                    this.$mags = 0
                    this.$bullets = 0
                }
                else {
                    const bullet = this.createBullet()
                    this.bullets.push(bullet)
                    this.t  = 0
                    this.$bullets --
                    this.stateManager.setstate('Shoot')
                    this.$attacking  = true
                    this.animator.playAnimation(`recoil`)
               }
            }
        },
        update(){
            this?.rect?.updateall()
            this.rect.x = player.character.rect.x
            this.rect.y = player.character.rect.y
            this.sprites.forEach(sprite=>{
                sprite.update()
                sprite.rotation = player.aimangle
                sprite.flip = player.character.sprite.flip
                
            })
            this.stateManager.update()
            this.bullets.forEach(b=>b.updateall())
            this.bullets = [...this.bullets.filter(bullet=>!bullet.delete)]
            this.animator.update()            
        },
    }
    res.load()
    return res
}