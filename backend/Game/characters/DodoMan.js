import { Animate } from "../plugins/animation.js"
import { Controls } from "../plugins/controls(phone).js"
import { Health } from "../plugins/health.js"
import { Keybinder } from "../plugins/keybinder.js"
import { Pan } from "../plugins/pan.js"
import { Particles } from "../plugins/particles.js"
import { Rect } from "../plugins/rect.js"
import { Sprite } from "../plugins/sprite.js"
import { StateManager } from "../plugins/stateManager.js"
import { Text } from "../plugins/text.js"

export function DodoMan(player, socket, io, Game){
    const res = {
        falsestate: false,
        spawn(groupname = `spawn-location`, target=true){
            let ft
            const cw = Game.world.cw
            const ch = Game.world.ch
            const array = Game.world[groupname]
            const randomIndex = Math.floor(Math.random() * ((array.length-1) - 0))
            const x= array[randomIndex].indx * cw
            const y= array[randomIndex].indy * ch
            this.rect.x = x
            this.rect.y = y
            if(target)this.target(this.rect)
            console.log(`respawning..`,socket.id, x, y)
            clearTimeout(ft)
            ft = setTimeout(()=>{
                socket.emit(`set-effect`, `normal`)
            }, 1000)
        },
        target(rect, lerp = true){
            const rec = (rect)?rect:this.rect
          
            if(lerp){
                socket.emit(`set-intvalue`, (0.05))
                socket.emit(`set-ltx`, -rec.x + Game.W/2)
                socket.emit(`set-lty`, -rec.y + Game.H/2)
            }else {
                socket.emit(`set-tx`, -rec.x + Game.W/2)
                socket.emit(`set-ty`, -rec.y + Game.H/2)
            }
        },
        load(){
            //RECT
            socket.emit(`set-effect`, `normal`)

            this.rect= Rect(Game)
            this.rect.name = `player-${socket.id}`
            this.rect.slidex = 0.3
            this.rect.slidey = 0.8
            this.rect.addname('player')
            this.rect.addname(player.id)
            this.rect.id = player.id
            this.rect.exception.push(`playerexception`,`bomb${socket.id}`, `bullet-${socket.id}`, player.id, `damage`, `pickup`, `zoom-1`, `zoom-1.25`,`zoom-.75`, `zoom-.25`, `zoom-.50`)
            this.rect.oncollisionwith(`damage`, (rect)=>{
                if(rect.damage === 0)return
                if(rect.id === this.rect.id)return
                rect.damagecb()
                this.health.decrement = rect.damage
                this.health.decrease()
                rect.damage = 0
                if(rect.id === socket.id)return 
                this.attackerId = rect.id
                this.bullet = rect
            })  
            this.rect.oncollisionwith(`zoom-.75`, (rect)=>{
                socket.emit(`set-sx`, 0.75)
                socket.emit(`set-sy`, 0.75)
            })
            this.rect.oncollisionwith(`zoom-1`, (rect)=>{
                socket.emit(`set-sx`, 1)
                socket.emit(`set-sy`, 1)
            })
            this.rect.oncollisionwith(`zoom-.50`, (rect)=>{
                socket.emit(`set-sx`, 0.50)
                socket.emit(`set-sy`, 0.50)
            })
            this.rect.oncollisionbottom(()=>{
                if(this.hardlanding){
                    const hard = {
                        number: 100, size: 20, type: `rect`, 
                        wb: 500, hb: 5, 
                        dec:0.03, offx: -250,offy: this.rect.h - 5,}
                    this.particles.populate(hard)
                    this.hardlanding = false
                }
            })

            //TEXT
            this.text = Text(this.rect).set(player.name)
            this.text.offy =-30
            //KEYBINDER\    
            let keyup = false
            this.keybinder = Keybinder(socket, io)
            this.isgrounded = ()=>this.rect.iscolliding && (this.rect.vy === this.rect.weight || this.rect.vy === 0) && keyup

            this.keybinder.onkeydown({key: 'ArrowUp',cb:()=>{
                if(this.isgrounded()){
                    this.rect.vy = -25
                    keyup = false
                }
            }})
            this.keybinder.onkeyup({key: 'ArrowUp',cb:()=>{
                keyup = true
            }})
            .onkeydown({key: 'a',cb:()=>{
                player.loadouts?.weapon?.shoot()
            }})
            .onkeydown({key: 'ArrowLeft',cb:()=>{
                this.rect.vx = -5
                this.particles.populate(this.runparticlesdata)
            }})
            .onkeyup({key: `ArrowLeft`, cb:()=>{
                this.rect.vx = 0
                this.particles.populate(this.stopparticlesdata)
            }})
            .onkeydown({key: `ArrowRight`, cb:()=>{
                this.rect.vx = 5
                this.particles.populate(this.runparticlesdata)

            }})
            .onkeyup({key: `ArrowRight`, cb:()=>{
                this.rect.vx = 0
                this.particles.populate(this.stopparticlesdata)
            }})
            .onkeydown({key: `ArrowDown`, cb:()=>{
                this.slamming = true
            }})
            .onkeydown({key: `ArrowDown`, cb:()=>{
                this.slamming = true
            }})
            .onkeyup({key: `ArrowUp`, cb:()=>{
                this.slamming = false
            }})
            .onkeyup({key: `s`, cb:()=>{
                this.stateManager.setstate(`Roll`)
                
            }})
            .onkeyup({key: `d`, cb:()=>{
                this.stateManager.setstate(`Slam`)
            }})

            //PAN
            let ft
            this.pan = Pan(socket, Game,  player,  this.rect)
            this.pan.onoutsidegamebottom(()=>{
                socket.emit(`set-effect`, `death`)
                this.spawn(`spawn-location`)

            })


            this.sprite = Sprite(socket, this.rect, Game)
            .setname('dodoman').set(8, 8).loadImage('/players/dodoman.png')
            this.sprite.offx = -40
            this.sprite.offy = -57
            this.sprite.offw = 75
            this.sprite.offh = 70
            this.sprite.zIndex = 6

            this.rolleffect = Sprite(socket, this.rect, Game)
            .setname('rollEffect').set(10, 7).loadImage('/effects/firesparkeffect-compact.png')
            this.rolleffect.addclip(`play`).from(0).to(60).delay(0)
            .onframe(20,()=>{
                this.rolleffect.hidden = true
            })
            this.rolleffect.offw = 100
            this.rolleffect.offh = 100
            this.rolleffect.offx = -65
            this.rolleffect.offy = -35
            this.rolleffect.hidden = true
            let count = 0
            this.sprite.addclip(`Idle`).from(0).to(3).loop().delay(2).play()
            this.sprite.addclip(`Run`).from(17).to(31).loop().delay(1)
            this.sprite.addclip(`Roll`).from(40).to(48).loop().delay(1)
            .onframe(48,()=>{
                if(this.rolling){
                    this.rolling = false
                    this.stateManager.setstate(`Idle`)
                    this.rect.vx = 0
                    
                }
                if(this.isslamming)
                if(count === 2){
                    this.rect.vy  = 25
                }
                if(this.slamming){
                    count = (count + 1) % 4
                    if(count >= 3){
                        this.slammin = false
                        this.stateManager.setstate(`Idle`)
                    }
                                       
                }
            })
            this.sprite.addclip(`Hit`).from(49).to(51).loop().delay(0).
            onframe(50, ()=>{
                this.sprite.playclip(`Idle`)
                this.stateManager.setstate(`Idle`)
            })
            
            this.sprite.addclip(`Death`).from(56).to(58).loop(false).delay(5)
 
            //HEALTH
            this.health = Health(this.rect)
            this.health.addbar().color(`green`).health(100)
            this.health.addbar().color(`green`).health(100)
            this.health.addbar().color(`green`).health(100)
            this.health.addbar().color(`green`).health(100)
            this.health.ondecrement(()=>{
                this.falsestate = true
                this.sprite.playclip(`Hit`)

                const l = this.health.bars.filter(h=>h.$health > 0)
                if(l.length <= 2){
                    socket.emit(`set-effect`, `injure`)
                }
                setHealTimer()
            })
            let timeout
            let interval
            const setHealTimer = ()=>{
                clearTimeout(timeout)
                timeout = setTimeout(()=>{
                    clearInterval(interval)
                    if(this.dead)return
                    interval = setInterval(()=>{
                        if(this.dead)return
                        this.health.increase()
                    }, 500)
                }, 1000)
            }
            this.health.onhealthfull(()=>{
                clearInterval(interval)
            })
            this.health.onhealthempty(()=>{
                this.falsestate = true
                this.dead = true
                if(this.dead)
                this?.bullet?.awardwinner()                
                this.keybinder.shouldupdate = false
                this.controls.shouldupdate = false
                this.stateManager.shouldupdate = false
                this.particles.shouldupdate = false
                this.animator.playAnimation(`Death`)
                socket.emit(`set-effect`, `death`)
                console.log(socket.id, `dead`)
                
            })

            //PARTICLES
            this.particles = Particles(this.rect)
            this.runparticlesdata = {number: 3, size: 10, type: `rect`, wb: this.rect.w, hb: 5, dec:0.09, offy: this.rect.h - 5,}
            this.stopparticlesdata = {number: 5, size: 15, type: `rect`, wb: this.rect.w, hb: 5, dec:0.01, offy: this.rect.h - 5,}
 
            //MANAGER
            this.stateManager = StateManager()
            this.stateManager.add().name('Idle').cond(()=>!this.slamming && !this.rolling && !this.falsestate && this.rect.vx === 0 && (this.rect.vy === this.rect.weight || this.rect.vy === 0))
            .cb(()=>{
                this.sprite.playclip('Idle')
            })
            this.stateManager.add().name('RunLeft').cond(()=>!this.slamming && !this.rolling && !this.falsestate && this.rect.vx < 0)
            .cb(()=>{
                this.sprite.playclip('Run')
                this.sprite.flip = true
            })
            this.stateManager.add().name('RunRight').cond(()=>!this.slamming && !this.rolling && !this.falsestate && this.rect.vx > 0)
            .cb(()=>{
                this.sprite.playclip('Run')
                this.sprite.flip = false
            })
            this.stateManager.add().name('Fall').cond(()=>!this.slamming && !this.rolling && !this.falsestate && this.rect.vy > this.rect.weight)
            .cb(()=>{
                this.sprite.playclip('Roll')
                this.sprite.flip = false
            })
            let rollcount = 0
            this.stateManager.add().name('Roll').cond(()=>false)
            .cb(()=>{
                this.rolling = true
                this.rect.vx = (!this.sprite.flip)?15:-15
                this.sprite.playclip('Roll')
                rollcount = (rollcount + 1) % 6
                if(rollcount >= 3){
                    this.rolleffect.hidden = false
                    this.rolleffect.playclip(`play`)
                    this.rect.vx = (!this.sprite.flip)?25:-25
                }
            })
            this.stateManager.add().name('Slam').cond(()=>false)
            .cb(()=>{
                this.slamming = true
                this.rect.vy =  -20
                this.sprite.playclip('Roll')
                this.hardlanding = true

            })

            //CONTROLS
            this.controls = Controls(socket)
            this.controls.createbtn({style:'bottom: 31%; left: 13%;', size:`4rem`, src: 'buttons/DodoMan/jump.png'})
            .cbdown(()=>{
                this.rect.vy = -15
            })
            this.controls.createbtn({style:'bottom: 10%; left: 5%;', size:`4rem`,src: 'buttons/DodoMan/run-left.png'})
            .cbdown(()=>{
                this.rect.vx = -5
            })
            .cbup(()=>{
                this.rect.vx = 0
            })
            this.controls.createbtn({style:'bottom: 10%; left: 21%;', size:`4rem`, src: 'buttons/DodoMan/run-right.png'})
            .cbdown(()=>{
                this.rect.vx = 5
            })
            .cbup(()=>{
                this.rect.vx = 0
            })
            this.controls.createjoystick({style:'bottom: 10%; right: 10%;', maxdist:70, size: `8rem`})
            .axischange(({angle, dist})=>{
                if(dist > 0){
                    player.aimangle = angle
                }
                if(dist === 0){
                    player.shoot = false
                }
                if(dist > 30){
                    if(!player.shoot){
                        player.loadouts?.weapon?.shoot()
                        player.shoot = true
                    }

                }
            })
            this.controls.send()
            
            this.animator = Animate()
            this.animator.addAnimation(`Intro`) 
            .from(this.rect)
            .key(0,{vx: 1})
            .key(10,{vy: -10})
            .key(15,{vx: -1})
            .key(20,{vx: 0})
            .from(this.sprite)
            .key(0, ()=>{
                this.sprite.playclip(`Run`)
                this.sprite.flip = false
            })
            .key(15, ()=>{
                this.sprite.playclip(`Run`)
                this.sprite.flip = true
            }).play()

            this.animator.addAnimation(`Death`) 
            .from(this.rect)
            .key(0, ()=>{
                this.rect.vx = (this.sprite.flip)?-1.5:1.5
            })
            .key(10,{vy: -18})
            .key(11,{vy: 10})
            .key(12,()=>{
                this.hardlanding = true
                this.sprite.playclip(`Death`)
                this.rect.vx= 0
                //respawn - delete ltr
                
                const int = setInterval(()=>{
                    this.health.increase()
                }, 20)
                this.health.onhealthfull(()=>{
                    clearInterval(int)
                    if(!this.dead)return
                    this.falsestate = false
                    this.spawn()
                    this.dead = false
                    this.keybinder.shouldupdate = true
                    this.controls.shouldupdate = true
                    this.stateManager.shouldupdate = true
                    this.particles.shouldupdate = true
                    this.stateManager.setstate(`Idle`)
                    socket.emit(`set-effect`, `normal`)
                    console.log(socket.id, `revived`)
                })
            })
            
        },
    }
    res.load()
    return res
}