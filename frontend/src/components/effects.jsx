import { animate, motion } from "framer-motion"
import { socket } from "../App"
import { useEffect, useState } from "react"

const effects = {
    fadeout:{
        initial:{opacity:1},
        animate:{opacity: 0},
        transition:{duration: 10, stiffness: 100, damping: 20, type: 'spring'}           
    },
    normal:{
        initial:{opacity:1},
        animate:{opacity: 0},
        transition:{duration: 10, stiffness: 100, damping: 20, type: 'spring'}
    },
    death:{
        initial:{opacity:0},
        animate:{opacity: 1},
        transition:{duration: 10, stiffness: 100, damping: 20, type: 'spring'}
    },
    injure:{
        initial:{background:`radial-gradient(transparent 60%, #f5000042)`},
        animate:{background:`transparent`},
        transition:{duration: 10, stiffness: 100, damping: 20, type: 'spring'}
    }
}

export function Effects({roomid}){
    //injure death normal fadeout
    const [currenteffect, setcurrenteffect] = useState(null)
    useEffect(()=>{
        const timeout = setTimeout(()=>{
            socket.on(`set-effect`, (name)=>{
                setcurrenteffect(name)
                console.log(name)   
            })

        }, 50)
        return ()=>clearTimeout(timeout)
    }, [])

    return (
        <>
        {(currenteffect)?console.log(`changed to `, currenteffect, effects[currenteffect]):null}
        <motion.div 

        initial={(currenteffect)?effects[currenteffect].initial:{}}
        animate={(currenteffect)?effects[currenteffect].animate:{}}
        exit={{opacity:0}}
        transition={(currenteffect)?effects[currenteffect].transition:{}}

        className={`effects${roomid}   absolute top-0 left-0 w-full h-full`}></motion.div>
    
        </>    
    )
}