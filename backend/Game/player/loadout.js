import { AK47 } from "../weapons/ak47.js"
import { Bazooka } from "../weapons/bazooka.js"
import { Frag } from "../weapons/frag.js"
import { Grenade } from "../weapons/grenade.js"
import { TripMine } from "../weapons/mine.js"
import { Rifle } from "../weapons/rifle.js"
import { Shotgun } from "../weapons/shotgun.js"
import { StickyBomb } from "../weapons/sticky.js"
export function Loadouts(socket, player, Game){
    const res = {
        arsenal: {
            assault: [
                Rifle(socket, player, Game), Shotgun(socket, player, Game), 
                AK47(socket, player, Game), Bazooka(socket, player, Game)
            ],
            bombs:[
                Grenade(socket, player, Game), StickyBomb(socket, player, Game),
                TripMine(socket, player, Game), Frag(socket, player, Game)
            ],
        },
        
        load(){
            this.array= [
                {
                    id: 0,
                    primary_assault: undefined,
                    secondary_assault: undefined,
                    primary_bomb: 'Grenade',
                    secondary_bomb: 'Sticky Bomb',
                    primary_meelee: undefined,
                    secondary_meelee: undefined,
                },
            ]
            this.loadout = this.array[0]
            this.setWeapon(`Rifle`)

            const grab = (rect, name)=>{
                rect.remove()
                // this.loadout[name] = rect.name
                // this.setWeapon(rect.name)
                // this.weapon.$mags = this.weapon?.$maxmags
                // this.weapon.$bullets = this.weapon?.$maxbullets
                // console.log(this.weapon.$maxmags, this.weapon.$maxbullets)
            }

            player.character.rect.oncollisionwith(`pickup`, (rect)=>{
                const primary_assault = this.getWeapon(this.loadout?.primary_assault)
                const secondary_assault = this.getWeapon(this.loadout?.secondary_assault)
                if(rect.name === 'Shotgun' || rect.name === 'Rifle' ||  rect.name ===`AK-47` || rect.name === `Bazooka`){
                    if(!this.loadout.primary_assault){grab(rect, `primary_assault`)} 
                    else if(!this.loadout.primary_assault){grab(rect, `secondary_assault`)}
                    else if(primary_assault?.$mags <= 0){grab(rect, `primary_assault`)}
                    else if(secondary_assault?.$mags <= 0){grab(rect, `secondary_assault`)}
                    else if(this.weapon.name === rect.name && primary_assault?.$bullets < primary_assault?.$maxbullets){grab(rect, `primary_assault`)}  //works
                    else if(this.weapon.name === rect.name && secondary_assault?.$bullets < secondary_assault?.$maxbullets){grab(rect, `secondary_assault`)}  //works
                    
                }
            
            })
            

        },
        getWeapon(name){
            let weapon
            for(let x in this.arsenal){
                const find = this.arsenal[x].find(e=>e.name === name)
                if(find){
                    weapon = this.arsenal[x][this.arsenal[x].indexOf(find)]
                }
            }
            return weapon
        },
        setWeapon(name){
            for(let x in this.arsenal){
                const find = this.arsenal[x].find(e=>e.name === name)
                if(find){
                    if(this.weapon)this.weapon?.hide()
                    this.weapon = this.arsenal[x][this.arsenal[x].indexOf(find)]
                    this.weapon?.show()
                    break
                }
            }
        },
        setLoadout(id){
            this.loadout = this.array[id]
        },
        update(){
            if(player.character.falsestate)return
            this?.weapon?.update()
        },
    }
    res.load()
    return res
}