import { useEffect, useState } from "react"
import { Back, LCard } from "./menu"
import { AnimatePresence, motion } from "framer-motion"
import { socket } from "../App"
import { useNavigate } from "react-router-dom"
import { playerinfo } from "../components(JS)/playerinfo"
export function Multiplayer (){
    const [matchmake, setmatchmake] = useState(false)
    const nav = useNavigate()
    useEffect(()=>{
        const timeout = setTimeout(()=>{
            socket.on('matched', (data)=>{
                nav(`/multiplayer/${data.roomid}`)
            })
        })
        return ()=>{clearTimeout(timeout)}
    },[])
    
    return (
        <div className="w-full h-screen relative overflow-hidden">
            <img src="/dodobg.jpg" className="w-full h-full" alt="" />
            <Back to='/'/>
            <Dropdown start={matchmake} setmatchmake ={setmatchmake} />
            <div className="left-0 absolute w-[7rem] top-0 h-screen flex flex-col justify-between text-[0.5rem] ">
                <div className="card"></div>
            </div>
            <div className="right-0 absolute w-[7rem] top-0 h-screen flex flex-col justify-between text-[0.5rem] ">
                <div className="cards p-2 w-full h-full text-[#fff]">
                    <div 
                        onClick={()=>{
                            setmatchmake(prev=>!prev)
                            socket.emit('matchmake', playerinfo(socket))
                        }}
                        className="card uppercase bg-amber-400 text-black text-[.8rem] justify-center items-center flex-col justify-between cursor-pointer items-center backdrop-blur-2xl py-1 rounded h-10 overflow-hidden rounded-sm mb-2 flex flex-col items-center te">
                            {matchmake ? 'cancel' : 'Find Match'}
                    </div>
                </div>
            </div>

            <div className="absolute flex justify-end gap-4 items-center  rounded bottom-0 right-0 w-[45%] p-2 h-12  text-white/80 ">
                <div className="sec text-center w-fit h-full text-[.5rem] uppercase bg-black/10  backdrop-blur-2xl text-center border-r-2 border-amber-300  py-2 px-4">Loadout</div>
                <div className="sec text-center w-fit h-full text-[.5rem] uppercase bg-black/10  backdrop-blur-2xl text-center border-r-2 border-amber-300  py-2 px-4">Character</div>
            </div>
        </div>
    )
}


function Dropdown({start, setmatchmake}){
    const [sec, setsec] = useState(0)
    let interval = undefined

    useEffect(()=>{
        let timeout = setTimeout(()=>{
            if(start){
                clearInterval(interval)
                interval = setInterval(()=>{
                    setsec(prev=>prev+1)
                }, 1000)
            }else{
                setsec(0)
                clearInterval(interval)
            }
        })
        return ()=>{clearTimeout(timeout); clearInterval(interval)}
    },[start])
    return (
        <motion.div 
        initial={{y: -100}}
        animate={{y: start ? 0 : -100}}    
        exit={{y: -100}}
        transition={{duration: .3, stiffness: 100, damping: 20, type: 'spring'}}
        
        className="overflow-hidden w-8 h-8 absolute top-0 left-1/2 translate-x-[-50%] rounded-[50%] flex items-center justify-center bg-black/20 backdrop-blur-2xl text-white p-2">
            <div className=" option relative text-white text-[.7rem] overflow-hidden">{sec}
            </div>
            <motion.div
            initial={{opacity: 0}}
            whileHover={{opacity: 1}}
            onClick={()=>{
                setmatchmake(false)
            }}
            className={`${(start)?``:`hidden`} flex justify-center items-center cursor-pointer absolute top-0 opacity-0 left-0 w-full h-full bg-black/10"`}>x</motion.div>

        </motion.div>
    )


}
