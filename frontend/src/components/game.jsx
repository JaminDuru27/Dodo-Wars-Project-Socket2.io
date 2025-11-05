import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Multiplayer } from "./multiplayer"
import { motion } from "framer-motion"
import { rooms } from "../App"
import { useEffect } from "react"
import { Canvas } from "./canvs"
export function Game() {
    const nav = useNavigate()
    const {roomid} = useParams()
    const find = rooms.find(id=>id === roomid)
    console.log(`current rooms: ${rooms}`)
    // if(!find)      
    // return(
    //     <>
    //     <h1 className="text-black">
    //         no match found for roomid: {roomid}
    //         get back to <span className="text-blue-500 underline cursor-pointer" onClick={()=>nav('/multiplayer')}>multiplayer</span>
    //     </h1>
    //     <br/>
    //     </>
    // )
    // else{
        return (
            <div className="w-full h-screen relative overflow-hidden">
                <Canvas roomid={roomid}/>               
            </div>
        )
    // }
}