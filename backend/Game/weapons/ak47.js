import { Rect } from "../plugins/rect.js"
import { Sprite } from "../plugins/sprite.js"
import { StateManager } from "../plugins/stateManager.js"

export function AK47(socket, player, Game){
    const res = {
        name: `AK-47`,
        src: '',
        bullets: [],
        sprites: [],
        t:0, firetime: 6,
        $bullets: 25,
        $maxbullets: 25,
        $mags: 5,
        $maxmags: 5,
        load(){
            this.rect = Rect(Game, false)
            this.rect.w = 100
            this.rect.h = 60
            this.rect.shouldresolve = false
            this.rect.updateall = ()=>{
                this.rect.update(``)
            }
            this.sprite = Sprite(socket, this.rect, Game).setname('Ak47').set(12, 1)
            .loadImage(`/weapons/AK47/ak47.png`)
            this.sprite.addclip(`Idle`).from(0).to(0).loop(false).play()
            this.sprite.addclip(`Shoot`).from(0).to(12).loop(true).delay(0).play()
            
            this.spritereload= Sprite(socket, this.rect, Game).setname('Akreload').set(16, 1)
            .loadImage(`/weapons/AK47/reload.png`)
            this.spritereload.addclip(`play`).from(0).to(16).loop(false).delay(0)
            .onframe(13, ()=>{
                this.$reloading = false
            })
            this.spritempty= Sprite(socket, this.rect, Game).setname('Akeempty').set(16, 1)
            .loadImage(`/weapons/AK47/reload.png`)
            this.spritempty.addclip(`play`).from(0).to(16).loop().delay(0)

            
            this.sprites.push(this.sprite, this.spritereload, this.spritempty)
            this.stateManager = StateManager()
            this.stateManager.add().name('Idle').cond(()=>!this.$reloading && !this.$attacking && this.$bullets > 0 && this.$mags > 0)
            .cb(()=>{
                this.spritempty.hidden = true
                this.sprite.playclip(`Idle`)
                this.sprite.hidden = false
                this.spritereload.hidden = true
            })
            this.stateManager.setstate(`Idle`)

            this.stateManager.add().name('Shoot').cond(()=>false)
            .cb(()=>{
                this.spritempty.hidden = true
                this.sprite.playclip(`Shoot`)
                this.sprite.hidden = false
                this.spritereload.hidden = true
            })
            this.stateManager.add().name('Empty').cond(()=>false)
            .cb(()=>{
                this.spritempty.hidden = false
                this.sprite.hidden = true
                this.spritereload.hidden = true
                
            })

            this.stateManager.add().name('Reload').cond(()=>false)
            .cb(()=>{
                this.spritempty.hidden = true
                this.sprite.hidden = true
                this.spritereload.hidden = false
                this.spritereload.playclip(`play`)
            })


            player.character.keybinder.onkeyup({key:'a',cb:()=>{
                this.t = 10
                this.$attacking = false
                this.stateManager.setstate(`Idle`)
            }})
        },
        hide(){
            this.spritempty.hidden = true
            this.sprite.hidden = true
            this.spritereload.hidden = true
            return this
        },
        show(){
            this.stateManager.setstate(`Idle`)
            return this
        },
        createBullet(){
            const rect = Rect(Game)
            rect.vx = Math.cos(player.aimangle)
            rect.vy = Math.sin(player.aimangle)
            rect.x = player.character.rect.x + 40
            rect.y = player.character.rect.y + 10
            rect.w = 10
            rect.h = 10
            rect.name = `bullet-${socket.id}`
            rect.addname(player.id)
            rect.id = player.id
            rect.speed =  10
            rect.weight =  0
            rect.exception = [`player-${socket.id}`, `self`, `damage`]
            rect.l = 0
            
            rect.damage = 5
            rect.vx *= rect.speed
            rect.vy *= rect.speed
            rect.id = socket.id
            const sprite = Sprite(socket, rect, Game).setname('bullet').set(1, 1)
            .loadImage(`/weapons/AK47/bullet.png`)

            if(this.spritespark)this.spritespark.remove()

            const spritedust = Sprite(socket, rect, Game).setname('bullet-dust')
            .set(4, 4).loadImage(`/effects/bulletcollision.png`)
            spritedust.addclip(`explode`).from(0).to(15).loop(false).delay(0)
            .onframe(15, ()=>{
                rect.remove()
                rect.delete = true
                spritedust.remove()
            }).play()
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
                if(rect.iscolliding){
                    spritedust.update()
                    rect.name = `damage`
                    rect.vx =0
                    rect.vy =0
                    sprite.remove()

                }
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
                    console.log(`empty`)
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
            this.bullets.forEach((b, x)=>{
                b.updateall()
                if(b.delete)this.bullets.splice(x, 1)
            })
            this.bullets = [...this.bullets.filter(bullet=>!bullet.delete)]
            
        },
    }
    res.load()
    return res
}