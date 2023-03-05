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

const OUTPUT = Tone.Destination
const MASTER_GAIN = new Tone.Gain(1)

const SYNTH_A = new Tone.PolySynth(Tone.Synth)
SYNTH_A.set({
	oscillator: {
		type: 'sine'
	}
})

const SYNTH_B = new Tone.PolySynth(Tone.Synth)
SYNTH_B.set({
	oscillator: {
		type: 'square'
	}
})

const SYNTH_C = new Tone.PolySynth(Tone.Synth)
SYNTH_C.set({
	oscillator: {
		type: 'sawtooth'
	}
})

SYNTH_A.debug = true
SYNTH_B.debug = true
SYNTH_C.debug = true

// FILTER - Type, Cutoff, Resonance, ADSR, Input Gains
const FILTER = new Tone.Filter(1000, "lowpass", -12)

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
	distortion: 0,
	oversample: "none",
	wet: 0.5
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

const SELECTED_FX = FX_DISTORTION

// NOTES - Arpeggiator, Glide, Voice, Unison
const ARP = new Tone.Pattern(function(time, note){
	SYNTH_A.triggerAttackRelease(note, 0.25);
	SYNTH_B.triggerAttackRelease(note, 0.25);
	SYNTH_C.triggerAttackRelease(note, 0.25);
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

// SYNTH_A.chain(FILTER, Tone.Destination)
// SYNTH_B.chain(FILTER, Tone.Destination)
// SYNTH_C.chain(FILTER, Tone.Destination)
// SYNTH_A.chain(FILTER, FX_DISTORTION, Tone.Destination)
// SYNTH_B.chain(FILTER, FX_DISTORTION, Tone.Destination)
// SYNTH_C.chain(FILTER, FX_DISTORTION, Tone.Destination)
// SYNTH_A.chain(FX_DISTORTION, FILTER, Tone.Destination)
// SYNTH_B.chain(FX_DISTORTION, FILTER, Tone.Destination)
// SYNTH_C.chain(FX_DISTORTION, FILTER, Tone.Destination)

SYNTH_A.connect(OUTPUT)
SYNTH_B.connect(OUTPUT)
SYNTH_C.connect(OUTPUT)

OUTPUT.chain(FILTER, SELECTED_FX, MASTER_GAIN)

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

let synthOctaves = {
	"osc_a_octave": 3,
	"osc_b_octave": 4,
	"osc_c_octave": 1,
}

let octaveValues = {
	"-3": 0,
	"-2": 1,
	"-1": 2,
	"0": 3,
	"1": 4,
	"2": 5,
	"3": 6,
}

let subOctaveValues = {
	"0": 1,
	"1": 2,
	"2": 3,
	"3": 4,
}

let synthSemitones = {
	"osc_a_semi": 0,
	"osc_b_semi": 7,
	"osc_c_semi": 0,
}

let synthShapes = {
	"osc_a_shape": "sine",
	"osc_b_shape": "square",
	"osc_c_shape": "sawtooth",
}

let shapeValues = {
	"0": "sine",
	"1": "triangle",
	"2": "sawtooth",
	"3": "square",
	"4": "sine",
}

let filterTypes = {
	"0": "lowpass",
	"1": "highpass",
	"2": "bandpass",
	"3": "allpass",
	"4": "notch",
}

let filterRolloffs = {
	"0": -12,
	"1": -24,
	"2": -48,
	"3": -96,
}

let fxOversampleValues = {
	"0": "none",
	"1": "2x",
	"2": "4x",
}

// TODO (?) [idea]:
//  - Infinite loop / listener to fire attack/release signals on array of notes playing
//  - This is kept outside the event listeners
//  - onChange pushes note to array
//  - onRelease removes note from array
//  - Controls changes the array / signals

// Initialize FX variables
let fxEnabled = true
let fxMix = 0.5

for (let i = 0; i < controls.length; i++) {
	// add event listener to each control
	controls[i].addEventListener("change", function (e) {
		console.log(e.target.id, e.target.value);
		// -------------------- //
		// --- OSCILLATOR A --- //
		// -------------------- //
		if(e.target.id === "osc_a_switch") {
			// toggle oscillator-a on/off
			if(e.target.value === 0) {
				SYNTH_A.disconnect()

			} else {
				// turn on
				SYNTH_A.connect(OUTPUT)
			}
		}
		if(e.target.id === "osc_a_octave") {
			// set oscillator-a note accordingly
			synthOctaves["osc_a_octave"] = octaveValues[e.target.value]
			// SYNTH_A.releaseAll()
			// SYNTH_B.releaseAll()
			// SYNTH_C.releaseAll()
			// SYNTH_A.triggerAttack("C" + synthOctaves["osc_a_octave"])
			console.log(synthOctaves)
			// let newKey = "C4"
			// playingKeys[1] = newKey
			// SYNTH_A.set({
			// 	oscillator: {
			// 		modulationFrequency: 'C4'
			// 	}
			// })
		}
		if(e.target.id === "osc_a_semi") {
			// set oscillator-a note accordingly
			synthSemitones["osc_a_semi"] = e.target.value
			console.log(synthSemitones)
		}
		if(e.target.id === "osc_a_shape") {
			// set oscillator-a shape accordingly
			synthShapes["osc_a_shape"] = shapeValues[e.target.value]
			SYNTH_A.set({
				oscillator: {
					type: synthShapes["osc_a_shape"]
				}
			})
			console.log(synthShapes)
		}
		// -------------------- //
		// --- OSCILLATOR B --- //
		// -------------------- //
		if(e.target.id === "osc_b_switch") {
			// toggle oscillator-a on/off
			if(e.target.value === 0) {
				// turn off
				SYNTH_B.disconnect()
			} else {
				// turn on
				SYNTH_B.connect(OUTPUT)
			}
		}
		if(e.target.id === "osc_b_octave") {
			// set oscillator-b note accordingly
			synthOctaves["osc_b_octave"] = octaveValues[e.target.value]
			console.log(synthOctaves)
		}
		if(e.target.id === "osc_b_semi") {
			// set oscillator-b note accordingly
			synthSemitones["osc_b_semi"] = e.target.value
			console.log(synthSemitones)
		}
		if(e.target.id === "osc_b_shape") {
			// set oscillator-b shape accordingly
			synthShapes["osc_b_shape"] = shapeValues[e.target.value]
			SYNTH_B.set({
				oscillator: {
					type: synthShapes["osc_b_shape"]
				}
			})
			console.log(synthShapes)
		}
		// -------------------- //
		// --- OSCILLATOR C --- //
		// -------------------- //
		if(e.target.id === "osc_c_switch") {
			// toggle oscillator-a on/off
			if(e.target.value === 0) {
				// turn off
				SYNTH_C.disconnect()
			} else {
				// turn on
				SYNTH_C.connect(OUTPUT)
			}
		}
		if(e.target.id === "osc_c_octave") {
			// set oscillator-c note accordingly
			synthOctaves["osc_c_octave"] = subOctaveValues[e.target.value]
			console.log(synthOctaves)
		}
		if(e.target.id === "osc_c_semi") {
			// set oscillator-c note accordingly
			synthSemitones["osc_c_semi"] = e.target.value
			console.log(synthSemitones)
		}
		if(e.target.id === "osc_c_shape") {
			// set oscillator-c shape accordingly
			synthShapes["osc_c_shape"] = shapeValues[e.target.value]
			SYNTH_C.set({
				oscillator: {
					type: synthShapes["osc_c_shape"]
				}
			})
			console.log(synthShapes)
		}
		// -------------- //
		// --- FILTER --- //
		// -------------- //
		if(e.target.id === "filter_switch") {
			// if filter toggle off...
			if(e.target.value === 0) {
				OUTPUT.chain(SELECTED_FX, MASTER_GAIN)
			// if filter toggle on...
			} else {
				OUTPUT.chain(FILTER, SELECTED_FX, MASTER_GAIN)
			}
		}
		if(e.target.id === "filter_cutoff") {
			// set filter cutoff accordingly
			FILTER.set({
				frequency: e.target.value
			})
		}
		if(e.target.id === "filter_resonance") {
			// set filter resonance accordingly
			FILTER.set({
				Q: e.target.value
			})
		}
		if(e.target.id === "filter_rolloff") {
			// set filter rolloff accordingly
			FILTER.set({
				rolloff: filterRolloffs[e.target.value]
			})
		}
		if(e.target.id === "filter_type") {
			// set filter type accordingly
			FILTER.set({
				type: filterTypes[e.target.value]
			})
		}
		// ---------- //
		// --- FX --- //
		// ---------- //
		if(e.target.id === "fx_switch") {
			// if fx toggle value is 0...
			if(e.target.value === 0) {
				// set fxEnabled to false
				fxEnabled = false
				// if filter is enabled...
				FX_DISTORTION.set({
					"wet": 0
				})
			// if fx toggle value is 1...
			} else {
				// set fxEnabled to true
				fxEnabled = true
				// if filter is enabled...
				FX_DISTORTION.set({
					"wet": fxMix
				})
			}
		}
		if(e.target.id === "fx_param1") {
			// set fx param 1 accordingly
			FX_DISTORTION.set({
				"distortion": e.target.value
			})
		}
		if(e.target.id === "fx_param2") {
			// set fx param 2 accordingly
			FX_DISTORTION.set({
				"oversample": fxOversampleValues[e.target.value]
			})
		}
		if(e.target.id === "fx_param3") {
			// set fx param 3 accordingly
			console.log("fx_param3 changed")
		}
		if(e.target.id === "fx_param4") {
			fxMix = e.target.value
			// set fx param 4 accordingly
			if(fxEnabled) {
				FX_DISTORTION.set({
					"wet": e.target.value
				})
			}
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

// If keyboard change listener is triggered, send notes to array in outer scope
// If notes exist in the array, trigger them.
// If notes don't exist in the array, release them?
// If controls are updated, update the array, trigger the new notes, release old ones

// TODO: Attempt incorporating the function below, note calc + trigger outside of change EL

// function triggerNoteTest(number, semitoneOffset, octaveOffset) {
// 	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// 	let adjustedNumber = (number + semitoneOffset) % 12;
// 	if (adjustedNumber < 0) {
// 		adjustedNumber += 12;
// 	}
// 	const noteIndex = (notes.indexOf('C') + adjustedNumber) % 12;
// 	let octave = Math.floor((number + semitoneOffset) / 12) + octaveOffset;
// 	if (adjustedNumber < 0) {
// 		octave -= 1;
// 	}
// 	SYNTH_A.releaseAll()
// 	SYNTH_A.triggerAttack(notes[noteIndex] + octave, "8n")
// }

keyboard.addEventListener("mouseover", function () {
	// Focus on keyboard element so it activates physical keyboard input
	keyboard.cv.focus();
	console.log("mouse over keyboard!");
});

let heldKeys = [];
let playingKeys = [];


// while(heldKeys.length > 0) {
// 	console.log("Keys held!")
// 	console.log(heldKeys.length)
// }

keyboard.addEventListener("change", function (e) {
	// Calculate the notes to play based on the keyboard input and synth settings
	let note_a = getNoteFromNumber(e.note[1], synthSemitones.osc_a_semi, synthOctaves.osc_a_octave);
	let note_b = getNoteFromNumber(e.note[1], synthSemitones.osc_b_semi, synthOctaves.osc_b_octave);
	let note_c = getNoteFromNumber(e.note[1], synthSemitones.osc_c_semi, synthOctaves.osc_c_octave);

	console.log(e.note)

	console.log("note_a", note_a, e.note[0] ? "on" : "off");
	console.log("note_b", note_b, e.note[0] ? "on" : "off");
	console.log("note_c", note_c, e.note[0] ? "on" : "off");

	// Initialize an empty array to keep track of the currently playing keys

	// TODO: Figure out playingKeys / heldKeys logic
	//  playingKeys: you can change note parameters while playing keys,
	//    but playing new keys overwrites playingKeys,
	//    so when you release the last set of keys, it kills all keys...
	//  heldKeys: changing note parameters while playing keys will cause keys to stick,
	//    but you can let go of keys without all keys being released...


	// If note on
	if (e.note[0]) {
		// if not already in heldKeys array, push it
		if (!heldKeys.includes(note_a) || !heldKeys.includes(note_b) || !heldKeys.includes(note_c)) {
			heldKeys.push(note_a);
			heldKeys.push(note_b);
			heldKeys.push(note_c);
			// Trigger the attack for the new notes and add them to the playingKeys array
			if (!playingKeys.includes(note_a)) {
				SYNTH_A.triggerAttack(note_a, "8n");
				playingKeys.push(note_a);
				console.log("OSC_A Frequency:", SYNTH_A.toFrequency(note_a))
			}
			if (!playingKeys.includes(note_b)) {
				SYNTH_B.triggerAttack(note_b, "8n");
				playingKeys.push(note_b);
				console.log("OSC_B Frequency:", SYNTH_B.toFrequency(note_b))
			}
			if (!playingKeys.includes(note_c)) {
				SYNTH_C.triggerAttack(note_c, "8n");
				playingKeys.push(note_c);
				console.log("OSC_C Frequency:", SYNTH_C.toFrequency(note_c))
			}
			console.log("playingKeys:", playingKeys)
			console.log("heldKeys:", heldKeys)
		}
	// If note off
	} else {
		// remove the note from the heldKeys array
		heldKeys = heldKeys.filter(item => item !== note_a && item !== note_b && item !== note_c);
		// Trigger the release for the playing notes and remove them from the playingKeys array
		if (playingKeys.includes(note_a)) {
			SYNTH_A.triggerRelease(note_a, "8n");
			playingKeys = playingKeys.filter(item => item !== note_a);
		}
		if (playingKeys.includes(note_b)) {
			SYNTH_B.triggerRelease(note_b, "8n");
			playingKeys = playingKeys.filter(item => item !== note_b);
		}
		if (playingKeys.includes(note_c)) {
			SYNTH_C.triggerRelease(note_c, "8n");
			playingKeys = playingKeys.filter(item => item !== note_c);
		}
		console.log("playingKeys:", playingKeys)
		console.log("heldKeys:", heldKeys)
		if (playingKeys.length === 0) {
			console.log("empty!");
			// Stop all playing notes when no keys are held down
			SYNTH_A.releaseAll();
			SYNTH_B.releaseAll();
			SYNTH_C.releaseAll();
		}
	}
});

// -- CANVAS SETUP -- //

const fmCanvas = document.getElementById("fm_canvas");
const fmCanvasContext = fmCanvas.getContext("2d");
fmCanvasContext.beginPath();
fmCanvasContext.arc(25, 25, 20, 0, 2 * Math.PI);
fmCanvasContext.strokeStyle = "white";
fmCanvasContext.stroke();
