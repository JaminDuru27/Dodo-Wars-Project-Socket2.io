import { AddLaptopControls } from "./laptopcontrols.js"
import { AddPlayerControlBtns } from "./phonebuttoncontrols.js"

export function Controller(socket, room, txRef, tyRef, {canvas, controls, effects}){
    const res = {
        keyactiveevents:[],
        keyinactiveevents:[],
        onkeyactive(cb){
            this.keyactiveevents.push(cb)
            return this
        },
        onkeyinactive(cb){
            this.keyinactiveevents.push(cb)
            return this
        },
        call(array, props){this[array].forEach(arr=>arr(props))},
        setForThisDevice(){
            if(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
            this.device = `phone`
            else this.device = `laptop`

            // this.device = `phone`
            if(this.device ===`laptop`){
                this.plugin = AddLaptopControls(socket, room, txRef, tyRef, {canvas, controls, effects}, this)
            }

            if(this.device === `phone`){
                this.plugin = AddPlayerControlBtns(socket, room, {canvas, controls, effects}, this)
            }
            return this
        },
        load(){},  
    }
    res.load()
    return res
}