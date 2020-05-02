let WebMidi = require('../../node_modules/webmidi')
import {PlayingNotesAry} from './playingNotesAry'
import * as types from './types'

interface PlayingNoteoptionalParams {
    time?:number, 
    velocity?:number, 
    duration?:number
}


export class MidiCcToNote {
    
    static webMidi = WebMidi;
    static playingNotes = PlayingNotesAry.playingNotes;
    static sysex = true;
    static isConnected = false;
    
    



    static connect():Promise<void>{
        return new Promise((resolve, reject) => {
            this.webMidi.enable((err:string)=>{
                this.isConnected = true;
                resolve();
                if (err) {
                    reject(err)
                }
                
            },this.sysex)
            
        });
    }

    static addControlchangeListener(inputId:number, caller: (m:any)=>void, channel?: number){
        var input = this.webMidi.getInputById(inputId.toString());
        input.addListener('controlchange', channel, caller);
    }

    static removeControlchangeListener(inputId:number, channel?: number){
        var input = this.webMidi.getInputById(inputId.toString());
        input.removeListener('controlchange', channel);
    }

    static sendControlChange(outputId:number,  controller:number,  value:number,  channel?:number, optionalParams?: any ){
        var output = this.webMidi.getOutputById(outputId.toString());
        output.sendControlChange ( controller,  value, channel, optionalParams )
    }

    static playNotes(outputId:number, noteNames:types.NoteName, channel:number|undefined, optionalParams?: PlayingNoteoptionalParams){
        var output = this.webMidi.getOutputById(outputId.toString());
        output.playNote(noteNames, channel, optionalParams);
        PlayingNotesAry.addEntriesToAry(outputId, noteNames, channel)
  
    }

   static sendPitchBend(outputId:number, pitchBendPosition:number, channel:number|undefined){
    var output = this.webMidi.getOutputById(outputId.toString());
    output.sendPitchBend(pitchBendPosition, channel);
   }

    static stopNote(outputId:number, noteNames:types.NoteName, channel:number|undefined, optionalParams?: PlayingNoteoptionalParams){
        var output = this.webMidi.getOutputById(outputId.toString());
        output.stopNote(noteNames, channel, optionalParams);
        PlayingNotesAry.removeEntriesFromAry(outputId, noteNames, channel)
    }

    static getMidiOutputs():{ id: number, name: string }[]{
        return this.webMidi.outputs.map( (row:any)=>{return {id:row.id, name: row.name }; } );
    }

    static getMidiInputs():{ id: number, name: string }[]{
        return this.webMidi.inputs.map( (row:any)=>{return {id:row.id, name: row.name }; } );
    }
}


