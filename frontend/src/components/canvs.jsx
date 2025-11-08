import { useEffect, useRef } from "react"
import { images, socket, updates } from "../App"
import { loop } from "../components(JS)/gam"
import { Controller } from "../components(JS)/controller"
import { Effects } from "./effects"

export function  Canvas({roomid}) {
    // refs instead of state to avoid re-renders
    const ctxRef = useRef(null)
    const canvasElRef = useRef(null)
    const gameRef = useRef(null)
    const playerRef = useRef(null)
    const txRef = useRef(0)
    const tyRef = useRef(0)
    const ltxRef = useRef(0)
    const ltyRef = useRef(0)
    const intRef = useRef(0.05)
    const sxRef = useRef(1)
    const syRef = useRef(1)
    const lsxRef = useRef(1)
    const lsyRef = useRef(1)
    const container = useRef(null)
    const intensityRef = useRef(10)
    const speedRef = useRef(.0002)

    useEffect(()=>{
        const timeout = setTimeout(()=>{
            // socket listeners update refs directly (no state)
            socket.on('game-update', (gameinfo)=>{ gameRef.current = gameinfo })
            socket.on('player-update', (p)=>{ playerRef.current = p })
            socket.on('set-intvalue',(v)=>{ intRef.current = v })
            socket.on('set-ltx',(v)=>{ ltxRef.current = v })
            socket.on('set-lty',(v)=>{ ltyRef.current = v })
            socket.on('set-tx',(v)=>{ txRef.current = v })
            socket.on('set-ty',(v)=>{ tyRef.current = v })
            socket.on('set-sx',(v)=>{ sxRef.current = v })
            socket.on('set-sy',(v)=>{ syRef.current = v })
            socket.on('set-sy',(v)=>{ syRef.current = v })
            socket.on(`translate-x`, (vx)=>{
                const game = gameRef.current
                if(!game) return
                if(txRef.current >= 0 && vx < 0){
                    txRef.current = 0
                    ltxRef.current = txRef.current
                    return
                }
                if(vx > 0 && txRef.current <= -(game.world.w - window.innerWidth)){
                    txRef.current = -(game.world.w - window.innerWidth)
                    ltxRef.current = txRef.current
                    return
                }   
                txRef.current -= vx
                ltxRef.current = txRef.current
            })
            socket.on(`translate-y`, (vy)=>{
                const game = gameRef.current
                if(!game) return
                if(tyRef.current >= 0 && vy < 0){
                    tyRef.current = 0
                    ltyRef.current = tyRef.current
                    return
                }
                if(vy > 0 && tyRef.current <= -(game.world.h - window.innerHeight)){
                    tyRef.current =  -(game.world.h - window.innerHeight)
                    ltyRef.current = tyRef.current
                    return
                }
                tyRef.current -= vy
                ltyRef.current = tyRef.current
            })
            const {canvas, ctx}  = configCtx(roomid, txRef, tyRef, container)
            canvasElRef.current = canvas
            ctxRef.current = ctx

            socket.on('get-canvas-size', ()=>{
                socket.emit('update-canvas-size', ({W:canvas.clientWidth, H:canvas.clientHeight}))
                socket.emit(`update-game-size`, ({W:canvas.clientWidth, H:canvas.clientHeight}))
            })
            socket.emit('update-canvas-size', ({W:canvas.clientWidth, H:canvas.clientHeight}))
            socket.emit(`update-game-size`, ({W:canvas.clientWidth, H:canvas.clientHeight}))

            // mark older loop with same id for deletion
            updates.forEach(update=>{ if(update.id === roomid + `-canvas-loop`) update.delete = true })
            // create a single loop that reads refs
            const update = loop({
                ctx, canvas,
                roomid,
                socket, images,
                refs: {
                    gameRef, txRef, tyRef, ltxRef, ltyRef, intRef,
                    sxRef, syRef, lsxRef, lsyRef, playerRef, 
                    intensityRef, speedRef,
                }
            })
            updates.push(update)
        }, 1000)

        return ()=>{
            clearTimeout(timeout)
            // remove listeners we added
            socket.off('game-update')
            socket.off('player-update')
            socket.off('set-intvalue')
            socket.off('set-ltx')
            socket.off('set-lty')
            socket.off('set-tx')
            socket.off('set-ty')
            socket.off('translate-x')
            socket.off('translate-y')
            socket.off('get-canvas-size')
            // mark loop for deletion
            updates.forEach(update=>{ if(update.id === roomid + `-canvas-loop`) update.delete = true })
        }
    }, [roomid])

    return(
        <div className="w-full h-screen absolute top-0 left-0" ref={container}>
            <canvas className={`canvas${roomid} absolute-0 w-full h-full bg-black`}></canvas>
            <Effects roomid={roomid}/>
        </div>
    )
}
function configCtx(roomid, txRef, tyRef, container){
    const el = document.querySelector(`.canvas${roomid}`)
    // if(el)el.requestFullscreen().catch(err=>console.log(err))
    el.width =  el.clientWidth
    el.height = el.clientHeight
    const ctx = el.getContext(`2d`)
    const controller = Controller(socket, roomid, txRef, tyRef,{canvas:el, container})
    controller.setForThisDevice()
    controller.onkeyactive(({aimangle})=>{
        socket.emit(`set-aim-angle`, aimangle)
    })
    
    window.onresize = ()=>{
        el.width =  el.clientWidth
        el.height = el.clientHeight
    }
    return {canvas:el, ctx}
}