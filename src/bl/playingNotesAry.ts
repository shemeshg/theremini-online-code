import * as types from './types'

interface PlayingNote {
    outputId:number;
    noteName:string|number;
    channel?:number;
}

export class PlayingNotesAry {
    static playingNotes: PlayingNote[] = [];

    static removeEntriesFromAry(outputId:number, noteNames:types.NoteName, channel?:number){
        if (noteNames instanceof Array) {
            for (let noteName of noteNames) {

                this._removeEntryFromAry(outputId, noteName, channel)
            }  
        } else {
            this._removeEntryFromAry(outputId, noteNames, channel)
        }
    }

    static addEntriesToAry(outputId:number, noteNames:types.NoteName, channel?:number){
        this.removeEntriesFromAry(outputId, noteNames, channel)
        if (noteNames instanceof Array) {
            for (let noteName of noteNames) {
                this.playingNotes.push({
                    outputId: outputId,
                    noteName:noteName,
                    channel:channel,
                })
            }  
        } else {
            this.playingNotes.push({
                outputId: outputId,
                noteName:noteNames,
                channel:channel
            })
        }
    }

    private static  _removeEntryFromAry(outputId:number, noteName:string|number, channel?:number){
        for(let i = this.playingNotes.length - 1; i >= 0; i--) {
            let sameInterfaceAndNote = this.playingNotes[i].noteName === noteName && 
                                        this.playingNotes[i].outputId === outputId 
            if(sameInterfaceAndNote && !Boolean(channel) ||
                sameInterfaceAndNote &&  this.playingNotes[i].channel === channel    ) {
                    this.playingNotes.splice(i, 1);
            }
        }
    }


}