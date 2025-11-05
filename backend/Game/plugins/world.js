import { catacombs } from '../maps/catacombs-CollisionDatascript.js'
import { cave } from '../maps/cave-CollisionDatascript.js'
import { Caves } from '../maps/Caves-CollisionDatascript.js'
import {dodomap} from '../maps/dodo map-CollisionDatascript.js'
import { Animate } from './animation.js'
import { Rect } from './rect.js'
import { Sprite } from './sprite.js'
export function World(socket,io, Room, Game){
    const res = {
        splitby: [
            'tile', 'spawn-location', 'weapon-location', 
            'sprite-location', `zoom-.75`, `zoom-.25`, `zoom-.50`, 
            `teamA-location`, `teamB-location`, //sprite eg `tree-sprite`, must have suffix `-sprite`
        ], 
        array: 0,
        cw: 50, ch: 50,
        x: 0, y: 0,
        sprites:[],
        rects: [],
        load(){
            this.data = Caves()
            this.w = this.data.griddata.rows * this.cw
            this.h = this.data.griddata.cols * this.ch
            this.splitdata()
            this.sprite = Sprite(socket, this, Game)
            .setname('map').set(1, 1).loadImage(this.data.src)
            io.to(Room.id).emit(`load-image`, ({src:this.data.src,  id: this.sprite.name}))
            this.sprites.push(this.sprite)
            const weaponsList = [
                {src:`public/weapons/Shotgun/ref.png`, name: `Shotgun`, w: 124, h:32}, 
                {src:`public/weapons/AK47/ref.png`, name: `AK-47`,w: 100, h:32}, 
                {src:`public/weapons/Rifle/ref.png`, name: `Rifle`,w: 100, h:32}, 
                {src:`public/weapons/Rifle/ref.png`, name: `Rifle`,w: 100, h:32}, 
            ]

            
            this[`weapon-location`].forEach((loc, i)=>{
                const weapon = weaponsList[Math.floor(Math.random() * (weaponsList.length-1))]
                if(!weapon)return

                const x = loc.indx * this.cw
                const y = loc.indy * this.ch
                const rect = Rect(Game)
                rect.x = x
                rect.y = y
                rect.w  = weapon.w
                rect.h  = weapon.h
                rect.name = weapon.name
                rect.exception = ['player', `self`]
                rect.addname(`pickup`)
                const sprite = Sprite(socket, rect, Game).setname(`weapon${i}`).set(1, 1).loadImage(weapon.src)
                sprite.addclip('s').from(0).to(0).play()
                sprite.updateall = ()=>{
                    if(rect.delete)sprite.remove()
                }
                this.sprites.push(sprite)
                this.rects.push(rect)
            })

            

        },
        splitdata(){
            this.splitby.forEach(split=>{
                this[split] = []
                this.data.collision2d.forEach((col, y)=>{
                    col.forEach((row, x)=>{
                        if(row === 0)return
                        // if(row.groupname === 'tile')console.log(`tiles present`)
                        // if(row.groupname === `tile`)console.log(row.groupname, split, row.groupname.includes(split))
                        if(row.groupname.includes(split)){
                            if(row.groupname.includes(`tile`)){
                                const rect = Rect(Game)
                                rect.x = this.cw * x * row.ratio.x
                                rect.y = this.ch * y * row.ratio.y
                                rect.ratio = row.ratio
                                rect.addname(`tile`)
                                return
                            }
                            this[row.groupname].push({indx: x, indy:y})
                        }
                    })
                })
            })
        },
        update(){
            this?.rects?.forEach(rect=>{rect.update()})
            this?.sprites?.forEach(sprite=>{sprite.update();if(sprite?.updateall)sprite.updateall()})
            this?.animator?.update()
        }
    }
    res.load()
    return res
}