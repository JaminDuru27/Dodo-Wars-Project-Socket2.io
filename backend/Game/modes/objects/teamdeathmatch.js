export function TeamDeathMatch(){
    const res = {
        TeamA: [],
        TeamB: [],
        TeamAScore: 0,
        TeamBScore: 0,
        teamup(){
            let no  = Math.ceil(Game.players.length/2)

            if(Game.players.length === 1)this.TeamA.push(Game.players[0])
            if(Game.players.length > 1){
                const array = [...Game.players]
                const teamA = [...Array.from({length: no}).map((_,x)=>{
                    const rand = array[Math.floor(Math.random() * (array.length-1))]
                    array.splice(rand, 1)
                    return rand
                })]

                const teamB = array
                this.TeamA = teamA
                this.TeamB = teamB
            }
            this.TeamA.forEach(p=>{
                p.character.spawn(`teamA-location`, false)
            })
            this.TeamB.forEach(p=>{
                p.character.spawn(`teamB-location`, false)
            })
        },
        setup(){
            // this.teamup()
        },    
    }
    return res
}