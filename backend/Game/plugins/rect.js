// import { images } from "../../../frontend";

export function Rect(Game, push = true){
    const res = {
        x: Math.random() * 2000, 
        y: 100, 
        w: 50, h: 50,
        vx: 0, vy: 0,color:  "#" + Math.floor(Math.random() * 16777216).toString(16).padStart(6, "0"),
        weight: 1, shouldresolve: true, applygravity: true, applymovement:true,
        exception:[],
        names:[],
        buoyancy: 0,
        lx: 0,
        ly: 0,
        slidex:1,
        slidey:1,
        attachrect: undefined,
        attachoffx: 0, attachoffy: 0, 
        $oncollisiontop:[],
        $oncollisionleft:[],
        $oncollisionright:[],
        $oncollisionbottom:[],
        $oncollisionwith:[],
        oncollisionwith(name, cb){this.$oncollisionwith.push({name, cb});return this},
        oncollisiontop(cb){this.$oncollisiontop.push(cb);return this},
        oncollisionbottom(cb){this.$oncollisionbottom.push(cb);return this},
        oncollisionleft(cb){this.$oncollisionleft.push(cb);return this},
        oncollisionright(cb){this.$oncollisionright.push(cb);return this},
        call(name, prop){this[`$${name}`].forEach(cb=>cb(prop))},
        addname(name){
            if(!this.name)this.name = name
            this.names.push(name)
        },
        attach(rect, no = true){
            const dx = rect.x - this.x
            const dy = rect.y - this.y
            this.attachoffx = dx
            this.attachoffy = dy
            this.attachrect = rect
            if(no){
                this.vx = 0
                this.vy = 0
            }
        },
        load(){
            if(push)
            Game.rects.push(this)
        },
        remove(){
            this.delete = true
            // Game.rects.splice(Game.rects.indexOf(this), 1)
        },
        comparenames(rect, rect2){
            let is
            [...rect.names, rect.name].forEach(name=>{
                if([...rect2.names, rect2.name].includes(name))is = true
            })
            return is
        },
        check(){
            Game.rects.forEach(rect=>{
                if(rect === this)return
                let is= true
                this.exception.forEach(ex=>{
                    
                    if(typeof ex === `string`)if(rect.name === ex)is = false
                    if(typeof ex === `object`)if(rect === ex)is = false
                    if(ex === `self`){
                        if(this.comparenames(this,rect)){
                            is = false
                        }
                    }
                })
                this.resolveCollision(rect, is)
            })
        },
        resolveCollision(rect, ifaccepted){
            const overlapX  = Math.max(0, Math.min(this.x + this.w, rect.x + rect.w) - Math.max(this.x, rect.x))
            const overlapY  = Math.max(0, Math.min(this.y + this.h, rect.y + rect.h) - Math.max(this.y, rect.y))
            if(overlapX > 0 && overlapY > 0){
                if(ifaccepted)
                this.iscolliding = true
                else this.iscolliding = false
                let find  
                this.$oncollisionwith.forEach(e=>{
                    if([...rect.names, rect.name].includes(e.name)) find = e
                })
                if(find?.name === `tile`){
                    // console.log(this.name, find?.cb(rect))
                }
                if(find){
                    find.cb(rect)
                }

                if(overlapX > overlapY){
                    if(this.y < rect.y){
                        if(ifaccepted)
                        if(this.shouldresolve ){
                            if(this.vy > 0)this.vy = 0
                            this.y -= overlapY
                        }
                        if(this.collisiondirection !== `bottom` && (this.vy === this.weight || this.vy === 0))
                        this.call(`oncollisionbottom`, rect)
                        this.collisiondirection = `bottom`

                    }else{
                        if(ifaccepted)
                        if(this.shouldresolve ){
                            if(this.vy < 0)this.vy = 0
                            this.y += overlapY
                        } 
                        if(this.collisiondirection !== `top`)
                        this.call(`oncollisiontop`, rect)
                        this.collisiondirection = `top`
                    }
                }else if(overlapX < overlapY){
                    if(this.x  < rect.x){
                        if(ifaccepted)
                        if(this.shouldresolve ){
                            this.x -= overlapX
                        }
                        if(this.collisiondirection !== `right`)
                        this.call(`oncollisionright`, rect)
                        this.collisiondirection = `right`
                    }else{
                        if(ifaccepted)
                        if(this.shouldresolve ){
                            this.x += overlapX
                        }
                        if(this.collisiondirection !== `left`)
                        this.call(`oncollisionleft`, rect)
                        this.collisiondirection = `left`
                    }
                }
                else this.iscolliding = false

            }

        },
        lerp(a, b, t){return a + (b-a) * t},
       
        updateGravity(){
            if(!this.applymovement)return
            this.lx = this.lerp(this.lx, this.x, this.slidex)
            this.x += this.vx
            this.ly = this.lerp(this.ly, this.y, this.slidey)
            this.y += this.vy
            this.vy += this.weight


        },
        updateAttach(){
            if(!this.attachrect)return  
            this.vx =0
            this.vy =0
            this.x = this.attachrect.x + this.attachoffx
            this.y = this.attachrect.y + this.attachoffy
        },
        update(){
            this.updateGravity()
            this.check()
            this.updateAttach()
        },
    }
    res.load()
    return res
}