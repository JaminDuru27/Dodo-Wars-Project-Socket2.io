import { Animate } from "../plugins/animation.js"
import { Particles } from "../plugins/particles.js"
import { Rect } from "../plugins/rect.js"
import { Sprite } from "../plugins/sprite.js"
import { StateManager } from "../plugins/stateManager.js"

export function Shotgun(socket, player, Game){
    const res = {
        name: `Shotgun`,
        src: '',
        bullets: [],
        sprites:[],
        t:20, firetime: 20,
        currentstate: `Idle`,
        $reloading: false,
        $bullets: 5,
        $bulletsinc:1,
        $maxbullets: 5,
        $mags:2,
        $maxmags:2,
        load(){
            this.rect = Rect(Game, false)
            this.rect.w = 124
            this.rect.h = 32
            this.rect.shouldresolve = false
            this.rect.updateall = ()=>{
                this.rect.update(``)
            }
            // setTimeout(()=>{
            //     console.log(`added Mags 2`)
            //     this.$mags = 3
            // },20000)
            this.sprite = Sprite(socket, this.rect, Game).setname('shotgun').set(4, 16).loadImage(`/weapons/Shotgun/shotgun.png`)
            this.reloadSprite = Sprite(socket, this.rect, Game).setname('reloadmag').set(14, 1).loadImage(`/weapons/Shotgun/reloadshell.png`)
            this.reloadSprite.addclip('play').from(0).to(14).loop(false).delay(2)
            .onframe(10, ()=>{
                if(this.$bullets < this.$maxbullets){
                    this.$bullets += this.$bulletsinc
                    this.$reloading = true
                    this.reloadSprite.playclip(`play`)
                }

                if(this.$bullets === this.$maxbullets){
                    this.stateManager.setstate(`Idle`)
                    this.$reloading = false
                    this.$bullets = this.$maxbullets
                }
            })
            this.reloadSprite.hidden = true

            this.fullmuzzle = Sprite(socket, this.rect, Game).setname('fullmuzzle').set(14, 1).loadImage(`/weapons/Shotgun/fullmuzzle.png`)
            this.fullmuzzle.addclip('play').from(0).to(14).loop(true).delay(0)
            .onframe(14, ()=>{this.stateManager.setstate(`Idle`)})
            this.shootingshell = Sprite(socket, this.rect, Game).setname('shootingshell').set(14, 1).loadImage(`/weapons/Shotgun/shootingshell.png`)
            this.shootingshell.addclip('play').from(0).to(14).loop(true).delay(0)
            .onframe(14, ()=>{this.stateManager.setstate(`Idle`)})
            
            this.sprite.addclip(`normal`).from(0).to(1).loop(false).delay(0).play()
            this.sprite.addclip(`emptying`).from(0).to(13).loop(true).delay(0)
            this.sprite.addclip(`shooting`).from(32).to(45).loop(true).delay(0)
            this.sprite.playclip(`normal`)
            this.sprites.push(this.sprite, this.fullmuzzle, this.shootingshell, this.reloadSprite)

            this.stateManager = StateManager()
            this.stateManager.add().name(`Idle`).cond(()=>this.$mags > 0 && this.$bullets > 0)
            .cb(()=>{      
                this.sprite.playclip(`normal`)
                this.fullmuzzle.hidden  = true
                this.shootingshell.hidden  = true
                
            })
            this.stateManager.add().name(`Empty`).cond(()=>false)
            .cb(()=>{ 
                this.reloadSprite.hidden = true
                this.sprite.hidden = false
                this.sprite.playclip(`emptying`)
                this.fullmuzzle.hidden  = true
                this.shootingshell.hidden  = true
            })
            this.stateManager.add().name(`Reload`).cond(()=>false)
            .cb(()=>{ 
                this.$reloading = true
                this.$mags --
                console.log(this.$mags)
                this.reloadSprite.hidden = false
                this.reloadSprite.playclip(`play`)
                this.sprite.hidden = true
                this.fullmuzzle.hidden  = true
                this.shootingshell.hidden  = true
            })
            this.stateManager.add().name(`Shoot`).cond(()=>false)
            .cb(()=>{ 
                this.sprite.playclip(`shooting`)
                this.fullmuzzle.hidden = false
                this.shootingshell.hidden = false
                this.fullmuzzle.playclip(`play`)
                this.shootingshell.playclip(`play`)
            })

            let prevangle = 0
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
                this.t = 30
                this.sprite.playclip(`normal`)
                this.fullmuzzle.hidden  = true
                this.shootingshell.hidden  = true
                
            }})
        },
        hide(){
            this.reloadSprite.hidden = true
            this.sprite.hidden = true
            this.fullmuzzle.hidden  = true
            this.shootingshell.hidden  = true
            return this
        },
        show(){
            this.stateManager.setstate(`Idle`)
            return this
        },
        createBullet(aimangle){
            
            const rect = Rect(Game)
            rect.vx = Math.cos(aimangle)
            rect.vy = Math.sin(aimangle)
            rect.x = player.character.rect.x
            rect.y = player.character.rect.y
            rect.w = 10
            rect.h = 10
            rect.speed =  10
            rect.weight =  0
            rect.exception = [`player-${socket.id}`, `self`, `damage`]
            rect.l = 0

            rect.name = `bullet-${socket.id}`
            rect.addname(player.id)
            rect.id = player.id
            rect.damage = 25
            rect.vx *= rect.speed
            rect.vy *= rect.speed
            rect.id = socket.id
            const sprite = Sprite(socket, rect, Game).setname('bullet').set(1, 1)
            .loadImage(`/weapons/Shotgun/bullet.png`)

        
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
                if(this.$bullets > 0){
                    if(this.$reloading)return
                    const bullet = this.createBullet(player.aimangle)
                    const bullet2 = this.createBullet(player.aimangle +.1)
                    const bullet3 = this.createBullet(player.aimangle -.1)
                    const bullet5 = this.createBullet(player.aimangle -.2)
                    const bullet6 = this.createBullet(player.aimangle +.2)
                    this.bullets.push(bullet, bullet2, bullet3, bullet5, bullet6)
                    this.t  = 0
                    this.stateManager.setstate(`Shoot`)
                    this.animator.playAnimation(`recoil`)
                }
                if(this.$bullets <= 0 && this.$mags <= 0){
                    this.stateManager.setstate(`Empty`)
                    return
                }
                if(!this.$reloading)
                this.$bullets --
                if(this.$bullets <= 0 && this.$mags > 0 && !this.$reloading){
                    this.stateManager.setstate(`Reload`)
                    this.$reloading = true
                }
                if(this.$bullets < 0)this.$bullets = 0
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
            this.animator.update()
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