<template>
  <div class="hello" style="text-align: left;">
    
  <header class="w3-container w3-teal">
    <h1>Connect theremini to external Synthesizer</h1>
    <p>v0.010</p>
  </header>

  <div class="w3-container">
    <div class="w3-panel w3-pale-green"> 
      <p>
        For software synth with logic pro (OSX), go to "Audio MIDI setup" and enable the 'IAC Driver Bus', 
        this is not required for external hardware device.
      </p>
      <p>
        Ensure 'Semitones per pitch bend' match your 'bend' parameter in the software synth. or hardware.
      </p>
      <p>
        Set the theremini Volume for CC 21 7bit, Pitch for 20 14 bit, midi send interval 20ms 
      </p>
    </div>
  </div>
  <div class="w3-container">
    <div class="w3-panel w3-card">
      <p>
        <label class="w3-text-grey"> click to start Chrome Midi</label>
        <br/>
        <button @click="doConnect" class="w3-button w3-teal">Start Midi</button> 
        &nbsp;{{msgConnected}}
      </p>


      <p>
        <label class="w3-text-grey">MIDI IN  - Select "Moog theremini"</label>
          <select v-model="midiInput" class="w3-select w3-teal" >
            <option v-for="option in midiInputs" v-bind:value="option.id" v-bind:key="option.id">
              {{ option.name }}
            </option>
          </select>        
      </p>

      <p>
        <label class="w3-text-grey">MIDI OUT - 'IAC Driver Bus' or hardware</label>
        <select v-model="midiOutput" class="w3-select w3-teal">
            <option v-for="option in midiOutputs" v-bind:value="option.id" v-bind:key="option.id">
              {{ option.name }}
            </option>
        </select>        
      </p>

      <p>
        <label class="w3-text-grey">Run theremin routing</label>
        <br/>
        <button @click="doStartVolumeRouting" class="w3-button w3-teal">Start Routing</button> 
        &nbsp;{{msgRouted}}
      </p>
      <p>
        <label class="w3-text-grey"> Stop theremin routing</label>
        <br/>
        <button @click="doStopVolumeRouting" class="w3-button w3-teal">Stop Routing</button>
      </p>


        <W3InputNumber 
          name="Receive from channel (0 is all)" 
          v-model="receiveFromChannel" 
        />

        <W3InputNumber 
            name="Send to channel (0 is all)" 
            v-model="sendToChannel" 
        />

    </div>
  </div>

  <div class="w3-container">
     <div class="w3-panel w3-card">
    <h2>Optional - VCV Mode, Route Pitch 14Bit MIDI, to Pitch weel message</h2>
      <W3Checkbox 
          name="Is active" 
          v-model="isVcvMode" 
      />
    </div>
  </div>

  <div class="w3-container">
     <div class="w3-panel w3-card">
    <h2>Optional - trigger notes from JSON array/Custom scale (routing must be started first)</h2>
      <W3Checkbox 
          name="Is active" 
          v-model="seqModIsActive" 
      />

      <p>
        <label class="w3-text-grey">JSON of notes/cords sequence</label>
        <textarea v-model="jsonSequence" placeholder="" class="w3-input w3-border"></textarea>
      </p>



      <W3Checkbox 
          name="Sequence cords as custom scale" 
          v-model="isSequenceCordsAsCustomScale" 
      />

      <W3InputNumber 
          name="Spaces between custom scale notes" 
          v-model="semitonsBetweenCustomScaleNotes" 
      />  

      <W3Checkbox 
          name="Repeat sequence (loop)" 
          v-model="isRepeatSequence" 
      />

      <W3InputNumber 
          name="Maximum bend range in sequence mode" 
          v-model="sequenceModeMaxBendRange" 
      />
 
    </div>
  </div>

  <div class="w3-container">
    <div class="w3-panel w3-card">
    <h2>Optional - Send CC instead of pitch</h2>

      <W3Checkbox 
          name="Is active" 
          v-model="ccpitchIsActive" 
      />

      <W3Checkbox 
          name="Play pitch AND CC" 
          v-model="ccpitchIsPlayPitchAndCC" 
      />

      <W3InputNumber 
          name="CC to send to (1 is Modulation Wheel)" 
          v-model="ccpitchSendToCcChannel" 
      />

      <W3InputNumber 
          name="Negative range - cc start" 
          v-model="ccpitchNegativeSendToMinVal" 
      />

    <W3InputNumber 
        name="Negative range - cc end " 
        v-model="ccpitchNegativeSendToMaxVal" 
    />

    <W3InputNumber 
        name="Positive range - cc start" 
        v-model="ccpitchPositiveSendToMinVal" 
    />

    <W3InputNumber 
        name="Positive range - cc end " 
        v-model="ccpitchPositiveSendToMaxVal" 
    />

    </div>
  </div>

  <div class="w3-container">
    <div class="w3-panel w3-card">
    <h2>Volume default parameters </h2>

    <W3InputNumber 
        name="Volume Input CC" 
        v-model="volumeInputCC" 
    />
    <W3InputNumber 
        name="Trigger new note above posision" 
        v-model="volumeTriggerPlayAbouve" 
    />
     <W3InputNumber 
        name="Stop current playing note below position" 
        v-model="volumeTriggerStopBelow" 
    />
    <W3InputNumber 
        name="Volume new notes will be played at " 
        v-model="volumeSendToResetVal" 
    />
    <W3InputNumber 
        name="Keep playing new note in same velocity for X milliseconds" 
        v-model="volumeIgnoreVolumeChangeInMillisecondsAfterNewNote" 
    />      
    <W3InputNumber 
        name="CC to send to (7 is midi volume)" 
        v-model="volumeSendToCcChannel" 
    />   
    <W3InputNumber 
        name="Sensitivity Out - cc start" 
        v-model="volumeSendToMinVal" 
    />     
    <W3InputNumber 
        name="Sensitivity Out - cc end" 
        v-model="volumeSendToMaxVal" 
    /> 
    <W3InputNumber 
        name="Sensitivity In - cc start (can be reversed)" 
        v-model="volumeStartCcPosition" 
    /> 
    <W3InputNumber 
        name="Sensitivity in - cc end (can be reversed)" 
        v-model="volumeEndCcPosition" 
    /> 
    <W3Checkbox 
        name="Sensitivity In - Mute abouve cc end" 
        v-model="volumeIsMuteAbouveEndCcPosition" 
    />   

    </div>
  </div>
        
  <div class="w3-container">
    <div class="w3-panel w3-card">
     <h2>Pitch default parameters </h2>

    <W3InputNumber 
        name="Pitch Input CC" 
        v-model="pitchInputCC" 
    />  
    <W3InputNumber 
        name="Semitones per pitch bend" 
        v-model="pitchSemitonPerOctaveBend" 
    />      
    <W3InputNumber 
        name="Trigger note when Pitched bend more then X semitones" 
        v-model="pitchSemitonsAutoTrigerNote" 
    />    
    <W3InputNumber 
        name="Keep playing new note in same pitch for X milliseconds" 
        v-model="pitchIgnorePitchbendChangeInMillisecondsAfterNewNote" 
    />    
    <W3InputNumber 
        name="Sensitivity Out - from note" 
        v-model="pitchMidiStartNote" 
    />    
     <W3InputNumber 
        name="Sensitivity Out - to note" 
        v-model="pitchMidiEndNote" 
    />  
     <W3InputNumber 
        name="Sensitivity In - cc start (can be reversed)" 
        v-model="pitchStartCcPosition" 
    />  
     <W3InputNumber 
        name="Sensitivity in - cc end (can be reversed)" 
        v-model="pitchEndCcPosition" 
    />  

    </div>
  </div>




    


    

    <!--  
      <p>
      <button @click="doStartC4">doStartC4</button>
      <button @click="doStopC4">doStopC4</button>
      {{ playingNotes }}
    </p> 

    <p>
      <input v-model="pitchBendPosition" type="number">
      <button @click="doPitchBend">doPitchBend</button>
    </p>

    <p>
      midiSliderPosition
      <input v-model="midiSliderPosition" type="number">
      <button @click="doPlayMidiSliderByBand">doPlayMidiSliderByBand</button>
      <button @click="doPlaySliderByNote">doPlaySliderByNote</button>
      <button @click="doStopSliderNote">doStopSliderNote</button>
    </p>
    
    <p>
      Volume Position: 
      <input v-model="thereminVolumePosition" type="number">
      Pitch Position:
      <input v-model="thereminPitchPosition" type="number">
      <button @click="doPitchVolumeSend">doTheremin</button>
    </p>

    -->

  </div>
</template>




<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { MidiCcToNote } from "../bl/midiCcToNote";
import { midiThereminSliders } from '../bl//midiSlider'

import W3InputNumber from '@/components/W3InputNumber.vue'; // @ is an alias to /src
import W3Checkbox from '@/components/W3Checkbox.vue'; // @ is an alias to /src

const noInterfaceSelectedId = 0;
const noInterfaceSelectedName = "none";
const noInterfaceSelected = {
  id: noInterfaceSelectedId,
  name: noInterfaceSelectedName
};




@Component({
  components: {
    W3InputNumber,
    W3Checkbox
  },
})
export default class HelloWorld extends Vue {

  
  msgConnected = "";
  msgRouted  = "";
  
  jsonSequence: string = JSON.stringify([ ["C4","E4"],0,"D4","E4"])
  seqModIsActive = false;
  isVcvMode = false;
  isRepeatSequence = true
  isSequenceCordsAsCustomScale = false;
  semitonsBetweenCustomScaleNotes = "3"
  sequenceModeMaxBendRange = "12"
  volumeInputCC = "21"
  pitchInputCC = "20"

  ccpitchIsActive = false;
  ccpitchIsPlayPitchAndCC = false;
  ccpitchSendToCcChannel = "1"
  ccpitchNegativeSendToMinVal = "1"
  ccpitchNegativeSendToMaxVal = "127"
  ccpitchPositiveSendToMinVal = "1"
  ccpitchPositiveSendToMaxVal = "127"

  playingNotes: unknown[] = []

  midiOutputs: { id: number; name: string }[] = [noInterfaceSelected];
  midiOutput: number = noInterfaceSelectedId;

  midiInputs: { id: number; name: string }[] = [noInterfaceSelected];
  midiInput: number = noInterfaceSelectedId;

  receiveFromChannel = "0";
  sendToChannel = "0"

  pitchBendPosition = "0";

  midiSliderPosition = "64";

  thereminVolumePosition = "0";
  thereminPitchPosition = "64";

  volumeTriggerPlayAbouve = "5"
  volumeTriggerStopBelow = "5"
  volumeSendToResetVal = "50"
  volumeIgnoreVolumeChangeInMillisecondsAfterNewNote = "80"
  volumeSendToCcChannel = "7"
  volumeStartCcPosition = "1"
  volumeEndCcPosition = "127"
  volumeSendToMinVal = "1"
  volumeSendToMaxVal = "127"
  volumeIsMuteAbouveEndCcPosition = false

  pitchSemitonPerOctaveBend = "12"
  pitchSemitonsAutoTrigerNote = "12"
  pitchIgnorePitchbendChangeInMillisecondsAfterNewNote = "0"
  pitchMidiStartNote = "50"
  pitchMidiEndNote = "86"
  pitchStartCcPosition = "1"
  pitchEndCcPosition = "127"



  doStartVolumeRouting(){
    midiThereminSliders.outputId = this.midiOutput;
    midiThereminSliders.midiVolumeSlider.receiveFromDeviceId = this.midiInput;
    midiThereminSliders.midiVolumeSlider.receiveFromCcChannel = Number( this.volumeInputCC );

    midiThereminSliders.receiveFromChannel = Number(this.receiveFromChannel) === 0 ? undefined :Number(this.receiveFromChannel)
    midiThereminSliders.sendToChannel = Number(this.sendToChannel) === 0 ? undefined :Number(this.sendToChannel)

    midiThereminSliders.midiSequence.isActive = this.seqModIsActive;
    midiThereminSliders.midiSequence.index = 0;

    midiThereminSliders.isVcvMode = this.isVcvMode

    midiThereminSliders.midiSequence.repeatSequence = this.isRepeatSequence 
    midiThereminSliders.midiSequence.sequenceCordsAsCustomScale = this.isSequenceCordsAsCustomScale
    midiThereminSliders.midiSequence.semitonsBetweenCustomScaleNotes = Number(this.semitonsBetweenCustomScaleNotes)
    midiThereminSliders.midiSequence.sequence = JSON.parse( this.jsonSequence )
    midiThereminSliders.midiSequence.bendRangeInMemitons = Number( this.sequenceModeMaxBendRange );

    midiThereminSliders.ccpitch.isActive = this.ccpitchIsActive;
    midiThereminSliders.ccpitch.isPlayPitchAndCC = this.ccpitchIsPlayPitchAndCC;
    midiThereminSliders.ccpitch.sendToCcChannel = Number(this.ccpitchSendToCcChannel);
    midiThereminSliders.ccpitch.negativeSendToMinVal = Number(this.ccpitchNegativeSendToMinVal)
    midiThereminSliders.ccpitch.negativeSendToMaxVal = Number(this.ccpitchNegativeSendToMaxVal)
    midiThereminSliders.ccpitch.positiveSendToMinVal = Number(this.ccpitchPositiveSendToMinVal)
    midiThereminSliders.ccpitch.positiveSendToMaxVal = Number(this.ccpitchPositiveSendToMaxVal)

    midiThereminSliders.midiVolumeSlider.triggerPlayAbouve = Number( this.volumeTriggerPlayAbouve)
    midiThereminSliders.midiVolumeSlider.triggerStopBelow = Number( this.volumeTriggerStopBelow)
    midiThereminSliders.midiVolumeSlider.sendToResetVal = Number( this.volumeSendToResetVal)
    midiThereminSliders.midiVolumeSlider.ignoreVolumeChangeInMillisecondsAfterNewNote = Number( this.volumeIgnoreVolumeChangeInMillisecondsAfterNewNote )
    
    midiThereminSliders.midiVolumeSlider.sendToCcChannel = Number( this.volumeSendToCcChannel)

    const volumeStartCcPosition = Number( this.volumeStartCcPosition )
    const volumeEndCcPosition =  Number( this.volumeEndCcPosition )
    if (volumeEndCcPosition < volumeStartCcPosition) {
      midiThereminSliders.midiVolumeSlider.startCcPosition = volumeEndCcPosition 
      midiThereminSliders.midiVolumeSlider.endCcPosition = volumeStartCcPosition
      midiThereminSliders.midiVolumeSlider.reverseCcPosition = true
    } else {
      midiThereminSliders.midiVolumeSlider.startCcPosition = volumeStartCcPosition
      midiThereminSliders.midiVolumeSlider.endCcPosition = volumeEndCcPosition
      midiThereminSliders.midiVolumeSlider.reverseCcPosition = false
    }


    midiThereminSliders.midiVolumeSlider.sendToMinVal = Number( this.volumeSendToMinVal)
    midiThereminSliders.midiVolumeSlider.sendToMaxVal = Number( this.volumeSendToMaxVal )
    midiThereminSliders.midiVolumeSlider.isMuteAbouveEndCcPosition = this.volumeIsMuteAbouveEndCcPosition

    midiThereminSliders.midiPitchSlider.receiveFromDeviceId = this.midiInput;
    midiThereminSliders.midiPitchSlider.receiveFromCcChannel = Number( this.pitchInputCC );

    midiThereminSliders.midiPitchSlider.semitonPerOctaveBend = Number( this.pitchSemitonPerOctaveBend )
    midiThereminSliders.midiPitchSlider.semitonsAutoTrigerNote = Number( this.pitchSemitonsAutoTrigerNote)
    midiThereminSliders.midiPitchSlider.ignorePitchbendChangeInMillisecondsAfterNewNote = Number( this.pitchIgnorePitchbendChangeInMillisecondsAfterNewNote)
    midiThereminSliders.midiPitchSlider.midiStartNote = Number( this.pitchMidiStartNote )
    midiThereminSliders.midiPitchSlider.midiEndNote = Number( this.pitchMidiEndNote )
    
    const pitchStartCcPosition = Number( this.pitchStartCcPosition )
    const pitchEndCcPosition =  Number( this.pitchEndCcPosition )
    if (pitchEndCcPosition < pitchStartCcPosition) {
      midiThereminSliders.midiPitchSlider.startCcPosition = pitchEndCcPosition 
      midiThereminSliders.midiPitchSlider.endCcPosition = pitchStartCcPosition
      midiThereminSliders.midiPitchSlider.reverseCcPosition = true
    } else {
      midiThereminSliders.midiPitchSlider.startCcPosition = pitchStartCcPosition
      midiThereminSliders.midiPitchSlider.endCcPosition = pitchEndCcPosition
      midiThereminSliders.midiPitchSlider.reverseCcPosition = false
    }


    midiThereminSliders.startRouting();
    this.msgRouted = "Routing"
  }

  doStopVolumeRouting(){
    midiThereminSliders.stopRouting();
    this.msgRouted = ""
  }

  doPitchVolumeSend(): void{
   midiThereminSliders.outputId = this.midiOutput;
   midiThereminSliders.setVolume(Number(this.thereminVolumePosition))
   midiThereminSliders.setPitch(Number(this.thereminPitchPosition))
   
  }

  doPlayMidiSliderByBand(): void{
    const pitchBendPosition = midiThereminSliders.midiPitchSlider.getPitchBendPosition(Number(this.midiSliderPosition))
    MidiCcToNote.sendPitchBend(this.midiOutput, pitchBendPosition, undefined)

  }
  
  doPlaySliderByNote(): void{
    midiThereminSliders.midiPitchSlider.setMidiCurrentNotePlayingByPosition(Number(this.midiSliderPosition))
    MidiCcToNote.playNotes(this.midiOutput, midiThereminSliders.midiPitchSlider.midiCurrentNotePlaying, undefined)
    this.playingNotes = MidiCcToNote.playingNotes;
  }

  doStopSliderNote(): void{
    MidiCcToNote.stopNote(this.midiOutput, midiThereminSliders.midiPitchSlider.midiCurrentNotePlaying, undefined)
    MidiCcToNote.sendPitchBend(this.midiOutput, Number(this.pitchBendPosition), undefined)
    this.playingNotes = MidiCcToNote.playingNotes;
  }

  doStartC4(): void {
    MidiCcToNote.playNotes(this.midiOutput, "C4", undefined)
    this.playingNotes = MidiCcToNote.playingNotes;
  }

  doStopC4(): void {
    MidiCcToNote.stopNote(this.midiOutput, "C4", undefined)
    this.playingNotes = MidiCcToNote.playingNotes;
  }

  doPitchBend(){
    MidiCcToNote.sendPitchBend(this.midiOutput, Number(this.pitchBendPosition), undefined)
  }

  doConnect(): void {
    MidiCcToNote
      .connect()
      .then(() => {
        this.msgConnected = "Connected";
        this.midiOutputs = [noInterfaceSelected].concat(
          MidiCcToNote.getMidiOutputs()
        );
        this.midiInputs = [noInterfaceSelected].concat(
          MidiCcToNote.getMidiInputs()
        );
      })
      .catch((e: Error) => {
        this.msgConnected = e.message;
      });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
