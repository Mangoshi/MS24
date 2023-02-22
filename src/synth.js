import * as Tone from 'tone'

import synthData from '../json/defaultSynthData.json' assert {type: 'json'}

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
const ENV_A = new Tone.AmplitudeEnvelope({
	attack: 0.1,
	decay: 0.2,
	sustain: 1.0,
	release: 0.8
})

const OSC_A = new Tone.Oscillator(440)

// FM A/B - Ratio, Depth, Mix(?)

// OSC B - Octave, Detune, Partials, ADSR
const ENV_B = new Tone.AmplitudeEnvelope({
	attack: 0.1,
	decay: 0.2,
	sustain: 1.0,
	release: 0.8
})

const OSC_B = new Tone.Oscillator(220)

// OSC C - Octave, Detune, Partials(?), ADSR
const ENV_C = new Tone.AmplitudeEnvelope({
	attack: 0.1,
	decay: 0.2,
	sustain: 1.0,
	release: 0.8
})

const OSC_C = new Tone.Oscillator(110)

// ALT IDEA: Use Tone.PolySynths //
let SYNTH_A_OSC = synthData.OSC_A.oscillator
let SYNTH_A_ENV = synthData.OSC_A.envelope
// const SYNTH_A = new Tone.PolySynth(Tone.FMSynth, {
// 	volume: 10,
// 	oscillator: SYNTH_A_OSC,
// 	detune: 0,
// 	envelope: SYNTH_A_ENV,
// 	modulation: {
// 		volume: 10,
// 		type: "fmsine",
// 	},
// 	modulationEnvelope: SYNTH_A_ENV,
// 	harmonicity: 1,
// 	modulationIndex: 1,
// 	portamento: 1,
// })
const SYNTH_A = new Tone.PolySynth(Tone.Synth)
const SYNTH_B = new Tone.PolySynth(Tone.Synth)
const SYNTH_C = new Tone.PolySynth(Tone.Synth)

// SYNTH_A.debug = true
// SYNTH_B.debug = true
// SYNTH_C.debug = true

// FILTER - Type, Cutoff, Resonance, ADSR, Input Gains
const FILTER = new Tone.Filter(1000, "lowpass", -24)

// LFO - Grid, Rate, Smooth, Shape, Target
const LFO = new Tone.LFO(0, 200, 2000)

// FX - Param 1, Param2, Param3, Mix, Input Gains
const FX_REVERB = new Tone.Reverb({
	decay: 4,
	preDelay: 0.01
})
const FX_DELAY = new Tone.FeedbackDelay({
	delayTime: "8n",
	feedback: 0.5
})
const FX_DISTORTION = new Tone.Distortion({
	distortion: 0.5,
	oversample: "none"
})
const FX_CHORUS = new Tone.Chorus({
	frequency: 1.5,
	delayTime: 3.5,
	depth: 0.7,
	type: "sine",
	spread: 180
})
const FX_BITCRUSHER = new Tone.BitCrusher(4)
const FX_PITCHSHIFT = new Tone.PitchShift({
	pitch: 0,
	windowSize: 0.1,
	delayTime: 0,
	feedback: 0
})
const FX_FREQSHIFT = new Tone.FrequencyShifter(0)

// NOTES - Arpeggiator, Glide, Voice, Unison
const ARP = new Tone.Pattern(function(time, note){
	synth.triggerAttackRelease(note, 0.25);
}, ["C4", "D4", "E4", "G4", "A4"]);

// MASTER - Volume

// RECORD - Start, Stop, Save

// PRESETS - Save, Load, Randomize

// SETTINGS - Keyboard, MIDI, Audio, Visuals

// CONNECTIONS
// OSC_A.connect(ENV_A)
// ENV_A.chain(FILTER, Tone.Destination)
//
// OSC_B.connect(ENV_B)
// ENV_B.chain(FILTER, Tone.Destination)
//
// OSC_C.connect(ENV_C)
// ENV_C.chain(FILTER, Tone.Destination)

SYNTH_A.chain(FILTER, Tone.Destination)
SYNTH_B.chain(FILTER, Tone.Destination)
// SYNTH_C.chain(FILTER, Tone.Destination)

function triggerToneAttackRelease(target, note, duration) {
	target.triggerAttackRelease(note, duration)
}
function triggerToneAttack(target, note, time) {
	target.triggerAttack(note, time)
}
function triggerToneRelease(target, note, time) {
	target.triggerRelease(note, time)
}

// -- CONTROLS LOGIC -- //

let controls = document.getElementsByClassName("control");
// console.log(controls);

let octaveValues = {
	"-3": 0,
	"-2": 1,
	"-1": 2,
	"0": 3,
	"1": 4,
	"2": 5,
	"3": 6,
}

let synthOctaves = {
	"osc_a_octave": 3,
	"osc_b_octave": 4,
	"osc_c_octave": 0,
}

let synthSemitones = {
	"osc_a_semi": 0,
	"osc_b_semi": 7,
	"osc_c_semi": 0,
}

for (let i = 0; i < controls.length; i++) {
	// add event listener to each control
	controls[i].addEventListener("change", function (e) {
		console.log(e.target.id, e.target.value);
		if(e.target.id === "osc_a_octave") {
			// set oscillator-a note accordingly
			synthOctaves["osc_a_octave"] = octaveValues[e.target.value]
			console.log(synthOctaves)
		}
		if(e.target.id === "osc_a_semi") {
			// set oscillator-a note accordingly
			synthSemitones["osc_a_semi"] = e.target.value
			console.log(synthSemitones)
		}
	})
}

// -- KEYBOARD LOGIC -- //

let keyboard = document.getElementById("keyboard");

function getNoteFromNumber(number, semitoneOffset, octaveOffset) {
	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	let adjustedNumber = (number + semitoneOffset) % 12;
	if (adjustedNumber < 0) {
		adjustedNumber += 12;
	}
	const noteIndex = (notes.indexOf('C') + adjustedNumber) % 12;
	let octave = Math.floor((number + semitoneOffset) / 12) + octaveOffset;
	if (adjustedNumber < 0) {
		octave -= 1;
	}
	return notes[noteIndex] + octave;
}

keyboard.addEventListener("mouseover", function () {
	// Focus on keyboard element so it activates physical keyboard input
	keyboard.cv.focus();
	console.log("mouse over keyboard!");
});
let heldKeys = []

keyboard.addEventListener("change", function (e) {

	// let note = getNoteFromNumber(e.note[1], synthSemitones.osc_a_semi) + getOctaveFromNumber(e.note[1]);
	// let note_plus = getNoteFromNumber(e.note[1], synthSemitones.osc_b_semi) + (getOctaveFromNumber(e.note[1])+1);
	// let note_minus = getNoteFromNumber(e.note[1], synthSemitones.osc_c_semi) + (getOctaveFromNumber(e.note[1])+2);

	let note_a = getNoteFromNumber(e.note[1], synthSemitones.osc_a_semi, synthOctaves.osc_a_octave);
	let note_b = getNoteFromNumber(e.note[1], synthSemitones.osc_b_semi, synthOctaves.osc_b_octave);
	let note_c = getNoteFromNumber(e.note[1], synthSemitones.osc_c_semi, synthOctaves.osc_c_octave);

	console.log("note_a" , note_a, e.note[0] ? "on" : "off");
	console.log("note_b" , note_b, e.note[0] ? "on" : "off");
	console.log("note_c" , note_c, e.note[0] ? "on" : "off");

	if (e.note[0]) {
		// Note on
		// triggerToneAttack(ENV_A, note, now())
		// OSC_A.start()
		// ENV_A.triggerAttack("8n")
		// OSC_B.start()
		// ENV_B.triggerAttack("8n")
		// OSC_C.start()
		// ENV_C.triggerAttack("8n")
		// if not isn't already in heldKeys array, push it
		if(!heldKeys.includes(note_a || note_b || note_c)){
			heldKeys.push(note_a)
			heldKeys.push(note_b)
			heldKeys.push(note_c)
			SYNTH_A.triggerAttack(note_a, "8n")
			SYNTH_B.triggerAttack(note_b, "8n")
			SYNTH_C.triggerAttack(note_c, "8n")
		}
	}
	if (!e.note[0]) {
		// Note off
		// triggerToneRelease(ENV_A, note, "+0.1")
		// ENV_A.triggerRelease("8n")
		// OSC_A.stop()
		// ENV_B.triggerRelease("8n")
		// OSC_B.stop()
		// ENV_C.triggerRelease("8n")
		// OSC_C.stop()
		heldKeys = heldKeys.filter(item => item !== note_a && item !== note_b && item !== note_c)
		SYNTH_A.triggerRelease(note_a, "8n")
		SYNTH_B.triggerRelease(note_b, "8n")
		SYNTH_C.triggerRelease(note_c, "8n")
	}
	console.log(heldKeys)
	if(heldKeys.length === 0) {
		console.log("empty!")
		SYNTH_A.releaseAll()
		SYNTH_B.releaseAll()
		SYNTH_C.releaseAll()
	}
})
