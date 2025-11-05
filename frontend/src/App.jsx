import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Menu } from './components/menu'
import { Multiplayer } from './components/multiplayer'
import io from 'socket.io-client'
import { Game } from './components/game'
export const socket = io('http://localhost:8000')

export let rooms = []
export let updates = []
export let images = []
function addimage({src, id}){
  const img = new Image()
  img.onload = ()=>{
      const data = {}
      data.imgw = img.width
      data.imgh = img.height
      socket.emit(`loaded-image-${id}`, (data))
  }
  if(!images.find(m=>m.name === id))
  images.push({img, name: id})
  img.src= src
}

function animate (){
  updates.forEach(obj=>{
    obj.update()
    if(obj.delete)updates.splice(updates.indexOf(obj), 1)
  })
  requestAnimationFrame(animate)
}
animate()
socket.on('connect', ()=>{
  socket.on('disconnect', ()=>{
    updates = []
    socket.off(`load-image`, addimage)

  })
  window.onkeydown = (e)=>{
      socket.emit('keydown', ({key:e.key}))
  }
  window.onkeyup = (e)=>{
      socket.emit('keyup', ({key:e.key}))
  }
  socket.on(`load-image`, addimage)
})
socket.on('get-rooms', (rms)=>{
  rooms = rms
  console.log(`rms`, rms)
})
function App() {
  const [count, setCount] = useState(0)
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <>
          <Menu />
          </>
        }></Route>
        <Route path='/multiplayer' element={
          <>
          <Multiplayer/>
          </>
        }></Route>
        <Route path='/multiplayer/waitroom/:roomid' element={
          <>
          <Game />
          </>
        }></Route>
      </Routes>
      
    </BrowserRouter>
    </>
  )
}

export default App