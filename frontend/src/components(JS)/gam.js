import { images, socket } from "../App"
const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end
}
export const loop =({
    ctx, canvas,
    game, effects, controls,
    tx,ty,ltx,lty,
    intvalue,
    sx,sy,lsx,lsy,
    player, roomid,
    // now accept refs instead of state callbacks
    refs = {}
})=>{ 
    const {
        gameRef, txRef, tyRef, ltxRef, ltyRef, intRef,
        sxRef, syRef, lsxRef, lsyRef, playerRef
    } = refs

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
            const currLsx = lsxRef?.current ?? currSx
            const currLsy = lsyRef?.current ?? currSy
            const playerLocal = playerRef?.current

            // smooth tx/ty towards targets and write back to refs
            const nextTx = lerp(currTx, targetLtx, intv)
            const nextTy = lerp(currTy, targetLty, intv)
            txRef.current = nextTx
            tyRef.current = nextTy

            // use lerped scales for rendering
            const renderSx = lerp(currSx, currLsx, 0.2)
            const renderSy = lerp(currSy, currLsy, 0.2)

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctx.save()
            ctx.scale(renderSx, renderSy)

            // translate by the smoothed values
            ctx.translate(nextTx, nextTy)

            ctx.imageSmoothingEnabled = false
            game?.sprites?.forEach(sp=>{
                const img = images.find(img=>img.name === sp.name)
                if(!img) return  

                ctx.save()
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
                ctx.restore()
            })

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

            ctx.restore()
            socket.emit(`translate`, ({tx: nextTx, ty: nextTy}))
        }
    }
}