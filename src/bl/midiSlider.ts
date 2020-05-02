import { MidiCcToNote } from "../bl/midiCcToNote";
import * as types from './types'

const maxMidiCc = 127

function _routingCommand(m: any) {

    

    if (
        m.data[1] === midiVolumeSlider.receiveFromCcChannel &&
        midiVolumeSlider.receiveFromDeviceId === m.target.id) {
        midiThereminSliders.setVolume(m.data[2]);
    }

    if (m.data[1] === midiPitchSlider.receiveFromCcChannel &&
        midiPitchSlider.receiveFromDeviceId === m.target.id) {
        midiThereminSliders.setPitch(m.data[2]);
    }

    const midiLsbChannelConst = 32
    const midi14BitChannels =  midiPitchSlider.receiveFromCcChannel + midiLsbChannelConst;
    if (m.data[1] === midi14BitChannels &&
        midiPitchSlider.receiveFromDeviceId === m.target.id) {
        midiThereminSliders.setLsbPitch(m.data[2]);
    }

}


class MidiThereminSliders {
    midiVolumeSlider: MidiVolumeSlider;
    midiPitchSlider: MidiPitchSlider;
    outputId: number

    sendToChannel?: number
    receiveFromChannel?: number;

    noteCurrentllyPlayingTimeStamp = 0;

    currentPitchPosition: number
    currentVolumePosition: number

    current14BitLsbPitchPosition = 0;

    lastVolumeCcSent: number = 0


    pitchPositionWhenNoteStarted = 0

    isVcvMode = false;

    midiSequence = new MidiSequence();
    ccpitch = new Ccpitch()

    constructor(midiVolumeSlider: MidiVolumeSlider, midiPitchSlider: MidiPitchSlider, outputId: number) {
        this.midiVolumeSlider = midiVolumeSlider;
        this.midiPitchSlider = midiPitchSlider;
        this.outputId = outputId;

        this.currentPitchPosition = midiPitchSlider.startCcPosition
        this.currentVolumePosition = midiVolumeSlider.startCcPosition

    }


    setLsbPitch(requestedPosition: number): void {
        this.current14BitLsbPitchPosition = requestedPosition;
    }

    private _sendVcvPitchBend(){
        const middleMidiCc = maxMidiCc / 2
        let pitchBendPosition = (this.currentPitchPosition - middleMidiCc ) / middleMidiCc  
        this.sendPitchBend(this.outputId, pitchBendPosition, this.sendToChannel);
    }

    setVolume(requestedPosition: number): void {
        this.currentVolumePosition = requestedPosition;

        if (this.midiVolumeSlider.reverseCcPosition) {
            requestedPosition = this.midiVolumeSlider.endCcPosition - requestedPosition;
        }

        if (requestedPosition > this.midiVolumeSlider.triggerPlayAbouve && !Boolean(this.noteCurrentllyPlayingTimeStamp)) {
            
            if (this.isVcvMode){
                this._sendVcvPitchBend()
                this.midiPitchSlider.setMidiCurrentNotePlayingByPosition( this.midiPitchSlider.vcvDefaultNotePlaying)
                this.playNotes( this.midiPitchSlider.midiCurrentNotePlaying)
            } else {
                this.sendPitchBend(this.outputId, 0, this.sendToChannel)
                if (this.midiSequence.isActive) {
                    if (!this.midiSequence.getIsLastCordRotationInCustomScale()) {
                        this.pitchPositionWhenNoteStarted = this.currentPitchPosition
                        let noteToPlay = this.midiSequence.playCurrentNotes(this.outputId,
                            this.currentPitchPosition, this.currentPitchPosition, this.midiPitchSlider.getPosisionsPerNote(),
                            this.sendToChannel)
                        if (noteToPlay) {this.playNotes(noteToPlay)}
                    }
                } else {
                    this.midiPitchSlider.setMidiCurrentNotePlayingByPosition(this.currentPitchPosition)
                    this.playNotes(this.midiPitchSlider.midiCurrentNotePlaying)
                }
            }
            


            this.noteCurrentllyPlayingTimeStamp = new Date().getTime()
        } else if (requestedPosition < this.midiVolumeSlider.triggerStopBelow && Boolean(this.noteCurrentllyPlayingTimeStamp)) {


            if (this.midiSequence.isActive) {
                this.midiSequence.stopCurrentNotes(this.outputId, this.sendToChannel)
                this.midiSequence.incrementIndex()
            } else {
                MidiCcToNote.stopNote(this.outputId, this.midiPitchSlider.midiCurrentNotePlaying, this.sendToChannel)
            }

            this.sendVolumeControlChange(this.midiVolumeSlider.sendToResetVal)

            this.noteCurrentllyPlayingTimeStamp = 0
        } else {
            if (this.noteCurrentllyPlayingTimeStamp) {
                let pitchBendPosition = this.midiPitchSlider.getPitchBendPosition(this.currentPitchPosition)
                if (this.midiSequence.isActive) {
                    let noteStartedPosition = this.pitchPositionWhenNoteStarted
                    if (this.midiSequence.getIsCustomeScale()) {
                        noteStartedPosition = this.midiSequence.currentPositionInScalePlaying
                    }
                    pitchBendPosition = this.midiPitchSlider.getPitchBendRelativeToNoteStartedPosition(this.currentPitchPosition,
                        this.midiSequence.bendRangeInMemitons,
                        noteStartedPosition)
                }

                let notePlayedMillisecAgo = new Date().getTime() - this.noteCurrentllyPlayingTimeStamp
                if (notePlayedMillisecAgo > this.midiPitchSlider.ignorePitchbendChangeInMillisecondsAfterNewNote) {

                    if (isNaN(pitchBendPosition)) {
                        // this is bug 
                    } else {
                        this.sendPitchBend(this.outputId, pitchBendPosition, this.sendToChannel)
                    }

                }

                if (notePlayedMillisecAgo > this.midiVolumeSlider.ignoreVolumeChangeInMillisecondsAfterNewNote) {
                    this.sendVolumeControlChange(this.midiVolumeSlider.getSendToVal(requestedPosition))
                }

            }

        }
        
    }

    setPitch(requestedPosition: number): void {
        
        requestedPosition = requestedPosition + (1/maxMidiCc) * this.current14BitLsbPitchPosition / maxMidiCc;
        
        if (this.midiPitchSlider.reverseCcPosition) {
            requestedPosition = this.midiPitchSlider.endCcPosition - requestedPosition;
        }

        this.currentPitchPosition = requestedPosition 

        if (this.isVcvMode){
            this.setVolume(this.currentVolumePosition);
            return;
        }

        let isSemitonsAutoTrigerNote = !this.isVcvMode &&
            Math.abs(this.midiPitchSlider.getNewNoteToPlay(requestedPosition) - this.midiPitchSlider.midiCurrentNotePlaying) >
            this.midiPitchSlider.semitonsAutoTrigerNote && Boolean(this.noteCurrentllyPlayingTimeStamp) &&
            !this.midiSequence.isActive

        if (isSemitonsAutoTrigerNote) {
            let previousPlayedNote = this.midiPitchSlider.midiCurrentNotePlaying
            this.midiPitchSlider.setMidiCurrentNotePlayingByPosition(this.currentPitchPosition)
            this.playNotes(this.midiPitchSlider.midiCurrentNotePlaying)
            MidiCcToNote.stopNote(this.outputId, previousPlayedNote, this.sendToChannel)
        }

        if (this.midiSequence.isActive && this.midiSequence.sequenceCordsAsCustomScale && Boolean(this.noteCurrentllyPlayingTimeStamp)) {
            let noteToPlay = this.midiSequence.playCurrentNotes(this.outputId,
                this.currentPitchPosition, this.pitchPositionWhenNoteStarted, this.midiPitchSlider.getPosisionsPerNote(),
                this.sendToChannel)
            if (noteToPlay) {this.playNotes(noteToPlay)}
        }

        this.setVolume(this.currentVolumePosition)
    }

    sendVolumeControlChange(val:number){
        if (this.lastVolumeCcSent !== val){
            MidiCcToNote.sendControlChange(this.outputId,
                this.midiVolumeSlider.sendToCcChannel,
                val,
                this.sendToChannel);
        }
        this.lastVolumeCcSent = val;
    }

    sendPitchBend(outputId:number, pitchBendPosition:number, channel:number|undefined){
        if (this.ccpitch.isActive){
            if (this.ccpitch.isPlayPitchAndCC) {
                MidiCcToNote.sendPitchBend(outputId, pitchBendPosition, channel)
            }
            let ccToPlay
            if ( pitchBendPosition >= 0){
                ccToPlay = (this.ccpitch.positiveSendToMaxVal - this.ccpitch.positiveSendToMinVal) * pitchBendPosition
            } else {
                ccToPlay = (this.ccpitch.negativeSendToMaxVal - this.ccpitch.negativeSendToMinVal) * pitchBendPosition
            }
            ccToPlay = Math.abs(ccToPlay)

            MidiCcToNote.sendControlChange(this.outputId,
                this.ccpitch.sendToCcChannel,
                ccToPlay,
                this.sendToChannel)
        } else {
            MidiCcToNote.sendPitchBend(outputId, pitchBendPosition, channel)
        } 
        
    }

    playNotes( noteNames:types.NoteName){
        MidiCcToNote.playNotes(this.outputId, noteNames, this.sendToChannel)
    }        

    startRouting(): void {
        MidiCcToNote.addControlchangeListener(this.midiVolumeSlider.receiveFromDeviceId,
            _routingCommand,
            this.receiveFromChannel)
    }

    stopRouting(): void {
        MidiCcToNote.removeControlchangeListener(this.midiVolumeSlider.receiveFromDeviceId, this.receiveFromChannel)
    }


}

class Ccpitch {
   isActive = true;
   isPlayPitchAndCC = false;
   sendToCcChannel = 1
   negativeSendToMinVal = 1
   negativeSendToMaxVal = 127
   positiveSendToMinVal = 1
   positiveSendToMaxVal = 127

}

class MidiSequence {
    isActive = false;
    repeatSequence = true;
    sequenceCordsAsCustomScale = false
    semitonsBetweenCustomScaleNotes = 3
    sequence: types.NoteName[] = []
    index = 0;
    bendRangeInMemitons = 12

    currentNoteInScalePlaying = 0
    currentPositionInScalePlaying = 0

    getIsLastCordRotationInCustomScale(): Boolean {
        return this.getIsCustomeScale() && this.index === this.sequence.length - 1
    }

    getIsCustomeScale(): boolean {
        let currentNote: any = this.sequence[this.index]
        return (currentNote instanceof Array) && this.sequenceCordsAsCustomScale
    }

    playCurrentNotes(outputId: number, requestedPosition: number, pitchPositionWhenNoteStarted: number,
        posisionsPerNote: number, channel: number | undefined): types.NoteName {

        let currentNote: any = this.sequence[this.index]
        let isCustomeScale = this.getIsCustomeScale()

        let noteToPlay: any = currentNote


        let customScaleNoteIndexToPlay = 0
        if (isCustomeScale) {
            let requestedSemiTonsFromCurrent = (requestedPosition - pitchPositionWhenNoteStarted) / posisionsPerNote
            customScaleNoteIndexToPlay = Math.trunc(requestedSemiTonsFromCurrent / this.semitonsBetweenCustomScaleNotes)
            if (customScaleNoteIndexToPlay > currentNote.length - 1) {
                customScaleNoteIndexToPlay = currentNote.length - 1
            }
            noteToPlay = currentNote[customScaleNoteIndexToPlay]
            if (this.currentNoteInScalePlaying === noteToPlay) {
                noteToPlay = undefined;
            } else {
                if (requestedPosition !== pitchPositionWhenNoteStarted) {
                    this.stopCurrentNotes(outputId, channel)
                }
                this.currentNoteInScalePlaying = noteToPlay
                this.currentPositionInScalePlaying = requestedPosition
            }
        }

        return noteToPlay
    }

    incrementIndex() {
        if (this.index < this.sequence.length - 1) {
            this.index++
        } else if (this.repeatSequence) {
            this.index = 0
        }
    }


    stopCurrentNotes(outputId: number, channel: number | undefined) {
        this.currentNoteInScalePlaying = 0
        this.currentPositionInScalePlaying = 0

        let currentNote = this.sequence[this.index]
        if (currentNote) {
            MidiCcToNote.stopNote(outputId, this.sequence[this.index], channel)
        }


    }
}

class MidiVolumeSlider {


    triggerPlayAbouve = 5
    sendToResetVal = 50
    triggerStopBelow = 5
    ignoreVolumeChangeInMillisecondsAfterNewNote = 80

    startCcPosition = 1;
    endCcPosition = 127;
    reverseCcPosition = false
    isMuteAbouveEndCcPosition = false

    sendToCcChannel = 7
    sendToMinVal = 1
    sendToMaxVal = 127




    receiveFromDeviceId: number = 0
    receiveFromCcChannel: number = 21



    getSendToVal(requestedPosition: number): number {
        let playablePctInRange = (requestedPosition - this.startCcPosition) / (this.endCcPosition - this.startCcPosition)
        playablePctInRange = playablePctInRange > 1 && this.isMuteAbouveEndCcPosition ? 0 : playablePctInRange
        playablePctInRange = playablePctInRange > 1 ? 1 : playablePctInRange;
        playablePctInRange = playablePctInRange < 0 ? 0 : playablePctInRange;
        return Math.trunc(this.sendToMinVal + playablePctInRange * (this.sendToMaxVal - this.sendToMinVal))
    }
}

class MidiPitchSlider {
    MidiSlider() { }

    startCcPosition = 1;
    endCcPosition = 127;
    reverseCcPosition = false

    midiStartNote = 50
    midiEndNote = 50 + 12 * 3
    semitonPerOctaveBend = 12
    semitonsAutoTrigerNote = 12

    ignorePitchbendChangeInMillisecondsAfterNewNote = 0

    receiveFromDeviceId: number = 0
    receiveFromCcChannel: number = 20

    midiCurrentNotePlaying = this.midiEndNote

    vcvDefaultNotePlaying = 43

    setMidiCurrentNotePlayingByPosition(requestedPosition: number): number {
        this.midiCurrentNotePlaying = this.getNewNoteToPlay(requestedPosition);
        return this.midiCurrentNotePlaying;
    }

    getPitchBendRelativeToNoteStartedPosition(requestedPosition: number, maximumSemitonsToBend: number, pitchPositionWhenNoteStarted: number): number {
        let middlePosition = pitchPositionWhenNoteStarted;
        let pctToBend = (requestedPosition - middlePosition) / middlePosition
        let pctToBendNormalizedToMaxSemitones = pctToBend * (maximumSemitonsToBend / this.semitonPerOctaveBend)

        if (pctToBendNormalizedToMaxSemitones > 1) {
            return 1;
        } if (pctToBendNormalizedToMaxSemitones < -1) {
            return -1;
        } else {
            return pctToBendNormalizedToMaxSemitones % 1
        }

    }

    getPosisionsPerNote(): number {
        return (this.endCcPosition - this.startCcPosition) / (this.midiEndNote - this.midiStartNote)
    }

    getPitchBendPosition(requestedPosition: number): number {
        let posisionsPerNote = this.getPosisionsPerNote()
        let positionsPerOctaveBend = posisionsPerNote * this.semitonPerOctaveBend
        let currentPositionPlaying = this.startCcPosition + (this.midiCurrentNotePlaying - this.midiStartNote) * posisionsPerNote

        let positionsToMove = (requestedPosition - currentPositionPlaying);

        let octavesToMove = positionsToMove / positionsPerOctaveBend

        if (octavesToMove > 1) {
            return 1
        } else if (octavesToMove < -1) {
            return -1
        } else {
            return octavesToMove % 1

        }
    }

    getNewNoteToPlay(requestedPosition: number): number {
        let posisionsPerNote = this.getPosisionsPerNote()
        let notesToMoveFromStart = (requestedPosition - this.startCcPosition) / posisionsPerNote
        return this.midiStartNote + Math.trunc(notesToMoveFromStart)
    }
}


var midiPitchSlider = new MidiPitchSlider();
var midiVolumeSlider = new MidiVolumeSlider()
export var midiThereminSliders = new MidiThereminSliders(midiVolumeSlider, midiPitchSlider, 0)