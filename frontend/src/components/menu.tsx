import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../App"
export function Menu(){
    const [id, setId] = useState('')
    useEffect(()=>{
        const timeout = setTimeout(()=>{
            socket.on('connect', ()=>{
                setId(socket.id)
            })
        })
        return ()=>{clearTimeout(timeout)}
    },[])
    return (
        <div className="w-full h-screen relative overflow-hidden">
            <img src="/dodobg.jpg" className="w-full h-full" alt="" />
            <div className="settings w-5 h-5 bg-white/20 cursor-pointer absolute top-2 left-2 rounded-2xl "></div>
            <Stats/>
            <div className="id absolute bottom-10 right-1 text-[.7rem]">{id}</div>
            <div className="left-0 absolute w-[7rem] top-0 h-screen flex flex-col justify-between text-[0.5rem] ">
                <div className="card"></div>
            </div>
            <div className="right-0 absolute w-[7rem] top-0 h-screen flex flex-col justify-between text-[0.5rem] ">
                <div className="cards p-2 w-full h-full text-[#fff]">
                    <LCard name='multiplayer' url='/multiplayer'/>                    
                    <LCard name='Battle Royale' url='/'/>                    
                </div>
            </div>

            <div className="absolute bg-black/10 flex justify-between items-center border border-amber-200 rounded bottom-0 left-0 w-[30%] h-8 p-2 text-white/80 backdrop-blur-2xl">
                <img src="chat" className="w-6 h-6" alt="" />
                <div className="text-[.7rem] flex items-center justify-center p-1 h-full rounded bg-amber-500 text-amber-800 ">Join</div>
            </div>
            <CharacterOptions/>
        </div>
    )
}

export function LCard({name, url}){
    const nav = useNavigate()
    return (
    <div 
    onClick={()=>{
        nav(url)
    }}
    className="card uppercase bg-[#000]/50 flex-col justify-between cursor-pointer items-center backdrop-blur-2xl py-1 rounded h-10 overflow-hidden rounded-sm mb-2 flex flex-col items-center te">
        <div className="name h-1/2 w-full text-center">{name}</div>
        <div className="name w-full bg-black/10 text-amber-400 text-center h-1/2 w-full ">Battle</div>
        <img src="" alt="" className="" />
    </div>
    )
}
function Stats({level=20, name='Mao', }){
    const [lev, setLev] = useState(level)  
    const [title, settitle] = useState(name)
    useEffect(()=>{
        setLev(level)
        settitle(name)
    },[level, name])  
    return (
        <div className="stats absolute gap-0 text-[.6rem] overflow-hidden text-white rounded-sm bg-white/10 backdrop-blur-2xl top-2 left-1/2 translate-x-[-50%] flex gap-4">
            <img src="/dodobg.jpg" className="w-12 h-12" alt="" />
            <div className="flex p-2 flex-col">
                <div className="font-bold">{title}</div>
                <div className="flex w-[10rem] justify-between items-center">
                    <div className="lv w-[30%] ">lvl 20</div>
                    <div 
                    style={{transition: `.3s ease`}}
                    className="perc w-[70%] relative h-2 p-[0.1rem] rounded border-2 border-amber-500">
                        <div className={`w-[${level}%] h-full bg-amber-400`}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CharacterOptions(){
    return (
        <div className="absolute flex justify-end gap-4 items-center  rounded bottom-0 right-0 w-[45%] p-2 h-12  text-white/80 ">
            <div className="sec text-center w-fit h-full text-[.5rem] uppercase bg-black/10  backdrop-blur-2xl text-center border-r-2 border-amber-300  py-2 px-4">Loadout</div>
            <div className="sec text-center w-fit h-full text-[.5rem] uppercase bg-black/10  backdrop-blur-2xl text-center border-r-2 border-amber-300  py-2 px-4">Character</div>
        </div>
    )
}


export function Back({to}){
    const nav = useNavigate()
    return (
        <div 
        onClick={()=>{
            nav(to)
        }}
        className="back cursor-pointer w-8 h-5 bg-white/20 cursor-pointer absolute top-2 left-2 rounded-l-2xl text-white flex items-center justify-start p-2 border-r-2 border-amber-300">{'<'}</div>

    )
}