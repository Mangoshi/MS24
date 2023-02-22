import * as Tone from 'tone'
import {now} from "tone";

// -- TONE.JS SETUP -- //

// TODO:
//  - OSCILLATOR A
//  - ENVELOPE A
//  - OSCILLATOR B
//  - ENVELOPE B
//  - OSCILLATOR C
//  - ENVELOPE C
//  - A/B FM (Ratio & Depth)
//  - MULTI-FILTER
//  - FILTER ENVELOPE
//  - DYNAMIC LFO
//  - FX: REVERB
//  - FX: DELAY
//  - FX: DISTORTION
//  - FX: CHORUS
//  - FX: BIT CRUSHER
//  - FX: PITCH SHIFT
//  - FX: FREQ SHIFT
//  - ARPEGGIATOR
//  - GLIDE CONTROLS (Portamento)
//  - VOICE & UNISON CONTROL
//  - MASTER VOLUME
//  - AUDIO RECORDING

// DOCS:
// Oscillator: https://tonejs.github.io/docs/14.7.77/Oscillator
// Amplitude Envelope: https://tonejs.github.io/docs/14.7.77/AmplitudeEnvelope
// Filter: https://tonejs.github.io/docs/14.7.77/Filter
// LFO: https://tonejs.github.io/docs/14.7.77/LFO
// Reverb: https://tonejs.github.io/docs/14.7.77/Reverb
// Delay: https://tonejs.github.io/docs/14.7.77/Delay
// Distortion: https://tonejs.github.io/docs/14.7.77/Distortion
// Chorus: https://tonejs.github.io/docs/14.7.77/Chorus
// BitCrusher: https://tonejs.github.io/docs/14.7.77/BitCrusher
// PitchShift: https://tonejs.github.io/docs/14.7.77/PitchShift
// FrequencyShifter: https://tonejs.github.io/docs/14.7.77/FrequencyShifter
// Arpeggiator: https://tonejs.github.io/docs/14.7.77/Arpeggiator


const synth = new Tone.PolySynth(Tone.FMSynth).toDestination()

// OSC A - Octave, Detune, Partials, ADSR

// FM A/B - Ratio, Depth, Mix(?)

// OSC B - Octave, Detune, Partials, ADSR

// OSC C - Octave, Detune, Partials(?), ADSR

// FILTER - Type, Cutoff, Resonance, ADSR, Input Gains

// LFO - Grid, Rate, Smooth, Shape, Target

// FX - Param 1, Param2, Param3, Mix, Input Gains

// NOTES - Arpeggiator, Glide, Voice, Unison

// MASTER - Volume

// RECORD - Start, Stop, Save

// PRESETS - Save, Load, Randomize

// SETTINGS - Keyboard, MIDI, Audio, Visuals

function triggerToneAttackRelease(target, note, duration) {
	target.triggerAttackRelease(note, duration)
}
function triggerToneAttack(target, note, time) {
	target.triggerAttack(note, time)
}
function triggerToneRelease(target, note, time) {
	target.triggerRelease(note, time)
}


// -- KEYBOARD LOGIC -- //

let keyboard = document.getElementById("keyboard");
function getNoteFromNumber(number) {
	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	// return notes[number % 12];
	return notes[(12 + (number % 12)) % 12];
}
function getOctaveFromNumber(number) {
	return Math.floor(number / 12) + 2;
}
keyboard.addEventListener("mouseover", function () {
	// Focus on keyboard element so it activates physical keyboard input
	keyboard.cv.focus();
	console.log("mouse over keyboard!");
});
let heldKeys = []

keyboard.addEventListener("change", function (e) {
	let note = getNoteFromNumber(e.note[1]) + getOctaveFromNumber(e.note[1]);
	console.log("note" , note, e.note[0] ? "on" : "off");
	if (e.note[0]) {
		// Note on
		triggerToneAttack(synth, note, now())
	} else {
		// Note off
		synth.triggerRelease(note, "+0.1")
		triggerToneRelease(synth, note, "+0.1")
	}
})
