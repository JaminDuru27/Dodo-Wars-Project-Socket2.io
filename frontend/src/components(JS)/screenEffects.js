export function screenEffects(game, socket){
    const res = {
        normalstyle(){return`position: absolute;top: 0;left: 0;width: 100%;height: 100%;background:radial-gradient(transparent 80%, #000000cd 117%);`},
        shootstyle(){return`position: absolute;top: 0;left: 0;width: 100%;height: 100%;background:radial-gradient(transparent 70%, #000000cd 117%);`},
        focusstyle(){return`position: absolute;top: 0;left: 0;width: 100%;height: 100%;background:radial-gradient(transparent 15%, #590000cd 117%);`},
        injurestyle(){return`position: absolute;top: 0;left: 0;width: 100%;height: 100%;background:radial-gradient(transparent 15%, #000000cd 117%);`},
        grimstyle(){return`position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000cd 100%)`},
        heartbeatstyle(){return`position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000cd 100%)`},
        deathstyle(){return`backdrop-filter:grayscale(1);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        contraststyle(){return`backdrop-filter:contrast(1.4);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        dimstyle(){return`backdrop-filter:brightness(.5);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        lighterstyle(){return`backdrop-filter:brightness(.5);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        lightstyle(){return`backdrop-filter:brightness(1.5);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        oldschool(){return`backdrop-filter:sepia(1);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        wash(){return`backdrop-filter:sepia(1) contrast(.5);position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: radial-gradient(transparent 23%, #000000a1 100%)`},
        animations:{
            focus:`surgeSlow`,
            injure:`surgeFast`,
            normal:`surgeSlow`,
            heartbeat:`surge`,
            death:`surgeSlow`,
            shoot:`surgeFast`,
        },
        load(){},
        setstyle(style){
            if(style)
            game.dom.effects.setAttribute(`style`, style())
        },
        setanimation(name){
            game.dom.effects.className = `effects ${name}`
            console.log(name, `jij`)  
        },
        addEffect(name){
            this.setstyle(this[`${name}style`])
            this.setanimation(this.animations[name])
            return this
        }
    }
    res.load()
    socket.on(`set-effect`, (name)=>{
        res.addEffect(name)
    })
    return res
}