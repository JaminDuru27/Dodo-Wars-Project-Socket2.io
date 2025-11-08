import { images, socket } from "../App"
const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end
}
export const loop = ({
    ctx, canvas,
    game, effects, controls,
    tx,ty,ltx,lty,
    intvalue,
    sx,sy,
    player, roomid,
    // now accept refs instead of state callbacks
    refs = {}
})=>{ 
    const {
        gameRef, txRef, tyRef, ltxRef, ltyRef, intRef,
        sxRef, syRef, lsxRef, lsyRef, playerRef,
        intensityRef, speedRef,
    } = refs
    let lsx = sxRef.current ?? 1
    let lsy = syRef.current ?? 1
    let intensity = intensityRef.current
    let speed = speedRef.current
    return{
        id: roomid + `-canvas-loop`,
        update(){
            if(!ctx) return
            // draw placeholder quickly if no game data yet
            if(!gameRef?.current){
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                ctx.fillStyle = `red`
                ctx.fillRect(0, 0, 200, 200)
                return
            }

            // read current values from refs
            const game = gameRef.current
            const targetLtx = ltxRef?.current ?? 0
            const targetLty = ltyRef?.current ?? 0
            const intv = intRef?.current ?? 0.05
            const currTx = txRef?.current ?? 0
            const currTy = tyRef?.current ?? 0
            const currSx = sxRef?.current ?? 1
            const currSy = syRef?.current ?? 1
            
            const playerLocal = playerRef?.current

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctx.save()
            ctx.imageSmoothingEnabled = false

            // translate by the smoothed values
            const now = performance.now()
            let vibX = 0
            let vibY = 0
            // playerLocal.shake (boolean) and playerLocal.shakeIntensity (number) are optional fields you can set from server
            // const i = intensity // 0..1
            // const s = speed  // tweakable
            // vibX = Math.cos(now * s) * 6 * i
            // vibY = Math.sin(now * (s * 1.3)) * 4 * i
           
            // use lerped scales for rendering
            lsx = lerp(lsx, currSx, 0.008)
            lsy = lerp(lsy, currSy, 0.008)
            socket.emit(`get-sx`, lsx)
            socket.emit(`get-sy`, lsy)
           
            ctx.scale(lsx, lsy)
            

            // smooth tx/ty towards targets and write back to refs
            const nextTx = lerp(currTx, targetLtx, intv)
            const nextTy = lerp(currTy, targetLty, intv)
            txRef.current = nextTx
            tyRef.current = nextTy

            ctx.translate(nextTx + vibX, nextTy + vibY)
             
            drawSprites({game, ctx, images,currTx, currTy, targetLtx, targetLty,intv,vibX, vibY})


            ctx.globalAlpha = 1
            game.players.forEach(p=>{
                ctx.fillStyle = `#fff` 
                ctx.lineWidth = 1
                ctx.font =`12px Arial` 
                ctx.textAlign = `center`
                ctx.fillText(p?.text.content, p?.text?.x, p?.text?.y) 

                p?.health?.bars.forEach((bar, x)=>{
                    const w = p.health.w / p?.health?.bars.length
                    const ww =  bar.health/100 * w
                    if(ww === 0) return
                    const gap = 2   
                    ctx.strokeStyle = `#fff`
                    ctx.fillStyle = bar.color
                    ctx.fillRect(p?.health?.x + w * x + (gap * x), p?.health?.y, ww - gap, 6)
                    ctx.strokeRect(p?.health?.x + w * x + (gap * x), p?.health?.y, ww - gap, 6)
                })

                ctx.save()
                p.particles.forEach(particle=>{
                    ctx.fillStyle = particle.color
                    ctx.globalAlpha = particle.alpha
                    ctx.fillRect(+particle.x, +particle.y, +particle.size, +particle.size)
                })
                ctx.restore()

                ctx.save()
                ctx.beginPath()
                ctx.lineWidth = 4
                ctx.setLineDash([9, 6])
                ctx.strokeStyle = `red`
                ctx.globalAlpha = .4
                ctx.moveTo(p.rect.x + p.rect.w/2, p.rect.y + p.rect.h/2)
                const length = window.innerHeight
                const endX = Math.cos(p.aimangle) * length
                const endY = Math.sin(p.aimangle) * length
                ctx.lineTo(p.rect.x + endX, p.rect.y + endY)
                ctx.stroke()
                ctx.closePath()
                ctx.restore()

                p.bombs.forEach(bomb=>{
                    bomb.array.forEach(b=>{
                        ctx.fillStyle = `transparent`
                        ctx.fillRect(b.x,b.y,b.w, b.h)
                    })
                })
            })



            //draw reflection
            const waterY = Math.max(...game?.sprites?.map(sp=>sp.h??0))
            ctx.translate(0, waterY * 2)
            ctx.scale(1, -1)
            ctx.globalAlpha = 0.4
            drawSprites({game, ctx, images,currTx, currTy, targetLtx, targetLty,intv,vibX, vibY, customTy:waterY})
            ctx.globalAlpha = 1
            const grad = ctx.createLinearGradient(0, waterY, 0, canvas.height)
            grad.addColorStop(0, `rgba(225, 225, 225, 0)`)
            grad.addColorStop(1, `rgba(225, 225, 225, 1)`)
            ctx.globalCompositeOperation = `destination-in`
            ctx.fillStyle = grad
            ctx.fillRect(0, waterY, canvas.width, canvas.health - waterY)

            
            ctx.restore()

            socket.emit(`translate`, ({tx: nextTx, ty: nextTy}))
        }
    }
}

function drawSprites({game, ctx, images,currTx, currTy, customTy=0, targetLtx, targetLty,intv,vibX, vibY}){
    let sprites = (game?.sprites || [])
    .map((s, i)=>({...s, _i:i}))
    .sort((a, b) => ((Number(a.zIndex) || 0) - (Number(b.zIndex) || 0)) || (a.__i - b.__i))
    sprites?.forEach(sp=>{
        const img = images.find(img=>img.name === sp.name)
        if(!img) return  

        ctx.save()
         // smooth tx/ty towards targets and write back to refs
        // const nextTx = lerp(currTx, targetLtx , intv)
        // const nextTy = lerp(currTy, targetLty, intv)
        // txRef.current = nextTx
        // tyRef.current = nextTy

        // use lerped scales for rendering
        // ctx.translate(nextTx + vibX, nextTy + vibY + customTy)
        if(sp.vibration)ctx.translate(Math.random()* 10, Math.random() * 10)
        if(sp.parallaxmode){
             // translate by the smoothed values
            const now = performance.now()
            let vibX = 0
            let vibY = 0
            // playerLocal.shake (boolean) and playerLocal.shakeIntensity (number) are optional fields you can set from server
            const i =  5 // 0..1
            const s = 0.0002  // tweakable
            vibX = Math.cos(now * s) * 6 * i
            vibY = Math.sin(now * (s * 1.3)) * 4 * i
            ctx.translate(sp.x , sp.y + vibY)
            const draw = (x, y)=>{
                ctx.drawImage(
                    img.img,
                    sp.sw * sp.framex,
                    sp.sh * sp.framey,
                    sp.sw,
                    sp.sh,
                    x, y,
                    sp.w,sp.h,
                )
            }
            draw(-sp.w + sp.x, sp.y)
            draw(sp.x, sp.y)
            draw(sp.w + sp.x, sp.y)
            
        }

        if(!sp.parallaxmode){
            if(!sp.hidden){
                if(!sp.flip){
                    ctx.translate(sp.x,sp.y)
                    ctx.rotate(sp.rotation)
                    if(sp.sw)
                    ctx.drawImage(
                        img.img,
                        sp.sw * sp.framex,
                        sp.sh * sp.framey,
                        sp.sw,
                        sp.sh,
                        (sp.rotaton > 0)?-sp.w/2:0,
                        (sp.rotaton > 0)?-sp.h/2:0,
                        sp.w,sp.h,
                    )
                } else {
                    ctx.translate(sp.x + sp.w/2, sp.y + sp.h/2)
                    if(sp.rotation === 0) ctx.scale(-1, 1)
                    if(sp.rotation !== 0) ctx.scale(1, -1)
                    ctx.rotate(-sp.rotation)
                    if(sp.sw)
                    ctx.drawImage(
                        img.img,
                        sp.sw * sp.framex,
                        sp.sh * sp.framey,
                        sp.sw,
                        sp.sh,
                        -sp.w /2,
                        -sp.h /2,
                        sp.w,sp.h,
                    )
                }
            }
        }
        ctx.restore()
    })
}