import * as Tone from 'tone'

import synthData from '../json/defaultSynthData.json' assert {type: 'json'}

// -- TONE.JS SETUP -- //

// TODO:
//  - ENVELOPE A
//  - ENVELOPE B
//  - ENVELOPE C
//  - A/B FM (Ratio & Depth)
//  - FILTER ENVELOPE
//  - DYNAMIC LFO
//  - ARPEGGIATOR
//  - GLIDE CONTROLS (Portamento)
//  - VOICE & UNISON CONTROL


// const synth = new Tone.PolySynth(Tone.FMSynth).toDestination()

// OSC A - Octave, Detune, Partials, ADSR
// const ENV_A = new Tone.AmplitudeEnvelope({
// 	attack: 0.1,
// 	decay: 0.2,
// 	sustain: 1.0,
// 	release: 0.8
// })
// const OSC_A = new Tone.Oscillator(440)

// FM A/B - Ratio, Depth, Mix(?)

// OSC B - Octave, Detune, Partials, ADSR
// const ENV_B = new Tone.AmplitudeEnvelope({
// 	attack: 0.1,
// 	decay: 0.2,
// 	sustain: 1.0,
// 	release: 0.8
// })
// const OSC_B = new Tone.Oscillator(220)

// OSC C - Octave, Detune, Partials(?), ADSR
// const ENV_C = new Tone.AmplitudeEnvelope({
// 	attack: 0.1,
// 	decay: 0.2,
// 	sustain: 1.0,
// 	release: 0.8
// })
// const OSC_C = new Tone.Oscillator(110)

// ALT IDEA: Use Tone.PolySynths //
// let SYNTH_A_OSC = synthData.OSC_A.oscillator
// let SYNTH_A_ENV = synthData.OSC_A.envelope
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
	},
	envelope: {
		sustain: 1
	}
})

const SYNTH_B = new Tone.PolySynth(Tone.Synth)
SYNTH_B.set({
	oscillator: {
		type: 'triangle'
	},
	envelope: {
		sustain: 1
	}
})

const SYNTH_C = new Tone.PolySynth(Tone.Synth)
SYNTH_C.set({
	oscillator: {
		type: 'sawtooth'
	},
	envelope: {
		sustain: 1
	}
})

SYNTH_A.debug = true
SYNTH_B.debug = true
SYNTH_C.debug = true

// FILTER - Type, Cutoff, Resonance, ADSR, Input Gains
const FILTER = new Tone.Filter(1000, "lowpass", -12)

console.log(FILTER.frequency.value)

let filterFreq = 1000

// LFO - Grid, Rate, Smooth, Shape, Target
const LFO = new Tone.LFO("4n", 0, filterFreq).start()

// FX - Param 1, Param2, Param3, Mix, Input Gains
const FX_DISTORTION = new Tone.Distortion({
	distortion: 0,
	oversample: "none",
	wet: 0.5,
})
const FX_CHEBYSHEV = new Tone.Chebyshev({
	order: 1,
	wet: 0.5
})
const FX_PHASER = new Tone.Phaser({
	frequency: 0.5,
	octaves: 5,
	spread: 0,
	wet: 0.5
})
const FX_TREMOLO = new Tone.Tremolo({
	frequency: 10,
	depth: 0.5,
	spread: 0,
	wet: 0.5
}).start()
const FX_VIBRATO = new Tone.Vibrato({
	frequency: 5,
	depth: 0.1,
	type: "sine",
	wet: 0.5
})
const FX_DELAY = new Tone.FeedbackDelay({
	delayTime: "8n",
	feedback: 0.5,
	wet: 0.5
})
const FX_REVERB = new Tone.Reverb({
	decay: 4,
	preDelay: 0.01,
	wet: 0.5
})
const FX_PITCHSHIFT = new Tone.PitchShift({
	pitch: 0,
	windowSize: 0.1,
	delayTime: 0,
	feedback: 0,
	wet: 0.5
})
const FX_FREQSHIFT = new Tone.FrequencyShifter({
	frequency: 0,
	wet: 0.5
})

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

const LIMITER = new Tone.Limiter(-20)

// TODO: lossless exporting ???
// https://stackoverflow.com/questions/47331364/record-as-ogg-using-mediarecorder-in-chrome/57837816#57837816
// https://github.com/mmig/libflac.js
// https://youtu.be/VHCv3waFkRo

const RECORDER = new Tone.Recorder()

let LFO_TARGET = FILTER.frequency
let SELECTED_FX = FX_DISTORTION

SYNTH_A.connect(OUTPUT)
SYNTH_B.connect(OUTPUT)
SYNTH_C.connect(OUTPUT)

OUTPUT.chain(FILTER, SELECTED_FX, MASTER_GAIN, LIMITER)

LFO.connect(LFO_TARGET).stop()

OUTPUT.connect(RECORDER)
// LFO.disconnect(LFO_TARGET)
// LFO.debug = true
// console.log(LFO)
//
// FILTER.set({
// 	frequency: 1000,
// 	type: "lowpass",
// 	rolloff: -12
// })
//
// OUTPUT.chain(FILTER, SELECTED_FX, MASTER_GAIN)



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
	"osc_b_semi": 0,
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

let lfoGridValues = {
	"0": '8m',
	"1": '4m',
	"2": '2m',
	"3": '1m',
	"4": '2n',
	"5": '4n',
	"6": '8n',
	"7": '16n',
	"8": '32n',
	"9": '64n',
}

let distortionOversampleValues = {
	"0": "none",
	"1": "2x",
	"2": "4x",
}

let fxDelayTimeValues = {
	"0": "16n",
	"1": "8n",
	"2": "4n",
	"3": "2n",
	"4": "1n",
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

let fxParam1 = document.getElementById("fx_param1")
let fxParam1Readout = document.getElementById("fx_param1_readout")
let fxParam1Label = document.getElementById("fx_param1_label")
let fxParam1Group = document.getElementById("fx_param1_group")

let fxParam2 = document.getElementById("fx_param2")
let fxParam2Readout = document.getElementById("fx_param2_readout")
let fxParam2Label = document.getElementById("fx_param2_label")
let fxParam2Group = document.getElementById("fx_param2_group")

let fxParam3 = document.getElementById("fx_param3")
let fxParam3Readout = document.getElementById("fx_param3_readout")
let fxParam3Label = document.getElementById("fx_param3_label")
let fxParam3Group = document.getElementById("fx_param3_group")

let fxParam4 = document.getElementById("fx_param4")
let fxParam4Readout = document.getElementById("fx_param4_readout")
let fxParam4Label = document.getElementById("fx_param4_label")
let fxParam4Group = document.getElementById("fx_param4_group")


function setParamGroup(target, enable, min, max, step, value, label) {
	if(target===1){
		$('#fx_param1')[0].min=min;
		$('#fx_param1')[0].max=max;
		$('#fx_param1')[0].step=step;
		$('#fx_param1')[0].value=value;
		$('#fx_param1')[0].enable=enable;
		fxParam1Readout.value = value
		fxParam1Label.innerHTML = label
		if(!enable){
			fxParam1Group.setAttribute("style", "display: none;")
		} else {
			fxParam1Group.setAttribute("style", "display: flex;")
		}
	} else if(target===2){
		$('#fx_param2')[0].min=min;
		$('#fx_param2')[0].max=max;
		$('#fx_param2')[0].step=step;
		$('#fx_param2')[0].value=value;
		$('#fx_param2')[0].enable=enable;
		fxParam2Readout.value = value
		fxParam2Label.innerHTML = label
		if(!enable){
			fxParam2Group.setAttribute("style", "display: none;")
		} else {
			fxParam2Group.setAttribute("style", "display: flex;")
		}
	} else if(target===3){
		$('#fx_param3')[0].min=min;
		$('#fx_param3')[0].max=max;
		$('#fx_param3')[0].step=step;
		$('#fx_param3')[0].value=value;
		$('#fx_param3')[0].enable=enable;
		fxParam3Readout.value = value
		fxParam3Label.innerHTML = label
		if(!enable){
			fxParam3Group.setAttribute("style", "display: none;")
		} else {
			fxParam3Group.setAttribute("style", "display: flex;")
		}
	} else if(target===4){
		$('#fx_param4')[0].min=min;
		$('#fx_param4')[0].max=max;
		$('#fx_param4')[0].step=step;
		$('#fx_param4')[0].value=value;
		$('#fx_param4')[0].enable=enable;
		fxParam4Readout.value = value
		fxParam4Label.innerHTML = label
		if(!enable){
			fxParam4Group.setAttribute("style", "display: none;")
		} else {
			fxParam4Group.setAttribute("style", "display: flex;")
		}
	}
}

let recorderLabel = document.getElementById("rec_label")

for (let i = 0; i < controls.length; i++) {
	// add event listener to each control

	controls[i].addEventListener("change", async function (e) {
		if (e.target.id === "osc_a_switch") {
			// toggle oscillator-a on/off
			if (e.target.value === 0) {
				SYNTH_A.disconnect()

			} else {
				// turn on
				SYNTH_A.connect(OUTPUT)
			}
		}
		if (e.target.id === "osc_b_switch") {
			// toggle oscillator-a on/off
			if (e.target.value === 0) {
				// turn off
				SYNTH_B.disconnect()
			} else {
				// turn on
				SYNTH_B.connect(OUTPUT)
			}
		}
		if (e.target.id === "osc_c_switch") {
			// toggle oscillator-a on/off
			if (e.target.value === 0) {
				// turn off
				SYNTH_C.disconnect()
			} else {
				// turn on
				SYNTH_C.connect(OUTPUT)
			}
		}
		if (e.target.id === "filter_switch") {
			// if filter toggle off...
			if (e.target.value === 0) {
				OUTPUT.chain(SELECTED_FX, MASTER_GAIN)
				// if filter toggle on...
			} else {
				OUTPUT.chain(FILTER, SELECTED_FX, MASTER_GAIN)
			}
		}
		if (e.target.id === "lfo_switch") {
			// if lfo toggle value is 0...
			if (e.target.value === 0) {
				LFO.stop()
				// LFO.disconnect(LFO_TARGET)
			} else {
				LFO.start()
				// LFO.connect(LFO_TARGET)
			}
		}
		if (e.target.id === "fx_switch") {
			// if fx toggle value is 0...
			if (e.target.value === 0) {
				// set fxEnabled to false
				fxEnabled = false
				// if filter is enabled...
				SELECTED_FX.set({
					"wet": 0
				})
				// if fx toggle value is 1...
			} else {
				// set fxEnabled to true
				fxEnabled = true
				// if filter is enabled...
				SELECTED_FX.set({
					"wet": fxMix
				})
			}
		}
		if (e.target.id === "rec_switch") {
			// if rec toggle is enabled...
			if (e.target.value === 1) {
				// start recording
				await RECORDER.start()
				// set label to "recording..."
				recorderLabel.innerHTML = "Recording..."
			// if rec toggle is disabled...
			} else {
				// stop recording & assign to variable
				const recording = RECORDER.stop()
				// create download link
				const url = URL.createObjectURL(await recording)
				// create anchor element
				const anchor = document.createElement("a")
				// set file name & format
				anchor.download = "recording.ogg"
				// set anchor href to url
				anchor.href = url
				// click anchor (download)
				anchor.click()
				// return label to default
				recorderLabel.innerHTML = "Record"
			}
		}
	})
	// using "input" instead of "change" to allow for continuous changes
	controls[i].addEventListener("input", function (e) {
		console.log(e.target.id, e.target.value);
		if (e.target.id === "master_gain") {
			// set master gain
			MASTER_GAIN.set({
				"gain": e.target.value
			})
		}
		// -------------------- //
		// --- OSCILLATOR A --- //
		// -------------------- //
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
		if(e.target.id === "osc_a_volume") {
			// set oscillator-a volume accordingly
			SYNTH_A.set({
				"volume": e.target.value
			})
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
		if(e.target.id === "osc_a_attack") {
			// set oscillator-a attack accordingly
			SYNTH_A.set({
				"envelope": {
					"attack": e.target.value
				}
			})
		}
		if(e.target.id === "osc_a_decay") {
			// set oscillator-a decay accordingly
			SYNTH_A.set({
				"envelope": {
					"decay": e.target.value
				}
			})
		}
		if(e.target.id === "osc_a_sustain") {
			// set oscillator-a sustain accordingly
			SYNTH_A.set({
				"envelope": {
					"sustain": e.target.value
				}
			})
		}
		if(e.target.id === "osc_a_release") {
			// set oscillator-a release accordingly
			SYNTH_A.set({
				"envelope": {
					"release": e.target.value
				}
			})
		}
		// -------------------- //
		// --- OSCILLATOR B --- //
		// -------------------- //
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
		if(e.target.id === "osc_b_volume") {
			// set oscillator-a volume accordingly
			SYNTH_B.set({
				"volume": e.target.value
			})
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
		if(e.target.id === "osc_b_attack") {
			// set oscillator-a attack accordingly
			SYNTH_B.set({
				"envelope": {
					attack: e.target.value
				}
			})
		}
		if(e.target.id === "osc_b_decay") {
			// set oscillator-a decay accordingly
			SYNTH_B.set({
				"envelope": {
					decay: e.target.value
				}
			})
		}
		if(e.target.id === "osc_b_sustain") {
			// set oscillator-a sustain accordingly
			SYNTH_B.set({
				"envelope": {
					sustain: e.target.value
				}
			})
		}
		if(e.target.id === "osc_b_release") {
			// set oscillator-a release accordingly
			SYNTH_B.set({
				"envelope": {
					release: e.target.value
				}
			})
		}
		// -------------------- //
		// --- OSCILLATOR C --- //
		// -------------------- //
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
		if(e.target.id === "osc_c_volume") {
			// set oscillator-a volume accordingly
			SYNTH_C.set({
				"volume": e.target.value
			})
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
		if(e.target.id === "osc_c_attack") {
			// set oscillator-a attack accordingly
			SYNTH_C.set({
				"envelope": {
					attack: e.target.value
				}
			})
		}
		if(e.target.id === "osc_c_decay") {
			// set oscillator-a decay accordingly
			SYNTH_C.set({
				"envelope": {
					decay: e.target.value
				}
			})
		}
		if(e.target.id === "osc_c_sustain") {
			// set oscillator-a sustain accordingly
			SYNTH_C.set({
				"envelope": {
					sustain: e.target.value
				}
			})
		}
		if(e.target.id === "osc_c_release") {
			// set oscillator-a release accordingly
			SYNTH_C.set({
				"envelope": {
					release: e.target.value
				}
			})
		}
		// -------------- //
		// --- FILTER --- //
		// -------------- //
		if(e.target.id === "filter_cutoff") {
			// set filter cutoff accordingly
			FILTER.set({
				frequency: e.target.value
			})
			// have to set LFO value when connected,
			// otherwise filter cutoff doesn't change (O_o)
			if(LFO_TARGET === FILTER.frequency) {
				LFO.set({"max": e.target.value})
			}
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
		// ----------- //
		// --- LFO --- //
		// ----------- //
		if(e.target.id === "lfo_selector") {
			if(e.target.value === "FilterFrequency"){
				LFO_TARGET = FILTER.frequency
			} else if(e.target.value === "FilterResonance"){
				LFO_TARGET = FILTER.Q
			} else if(e.target.value === "OscAVol"){
				LFO_TARGET = SYNTH_A.volume
			} else if(e.target.value === "OscBVol"){
				LFO_TARGET = SYNTH_B.volume
			} else if(e.target.value === "OscCVol"){
				LFO_TARGET = SYNTH_C.volume
			}
			// TODO: figure out how to disconnect LFO from previous target
			// LFO.connect(LFO_TARGET)
		}
		if(e.target.id === "lfo_grid") {
			// set lfo grid accordingly
			LFO.set({
				frequency: lfoGridValues[e.target.value]
			})
		}
		// TODO: set min/max to different values depending on LFO target
		if(e.target.id === "lfo_min") {
			// set lfo min accordingly
			LFO.set({
				"min": e.target.value
			})
		}
		if(e.target.id === "lfo_max") {
			// set lfo max accordingly
			LFO.set({
				"max": e.target.value
			})
		}
		if(e.target.id === "lfo_shape") {
			// set lfo shape accordingly
			LFO.set({
				type: shapeValues[e.target.value]
			})
		}
		// ---------- //
		// --- FX --- //
		// ---------- //
		if(e.target.id === "fx_selector") {
			// reset all fx wet values to 0 (off)
			FX_DISTORTION.set({wet: 0})
			FX_CHEBYSHEV.set({wet: 0})
			FX_PHASER.set({wet: 0})
			FX_TREMOLO.set({wet: 0})
			FX_VIBRATO.set({wet: 0})
			FX_DELAY.set({wet: 0})
			FX_REVERB.set({wet: 0})
			FX_PITCHSHIFT.set({wet: 0})
			FX_FREQSHIFT.set({wet: 0})

			// log params before change
			// console.group("p1 before")
			// console.log("label:", fxParam1Label)
			// console.log("control:", fxParam1)
			// console.log("readout:", fxParam1Readout)
			// console.groupEnd()
			// console.group("p2 before")
			// console.log("label:", fxParam2Label)
			// console.log("control:", fxParam2)
			// console.log("readout:", fxParam2Readout)
			// console.groupEnd()
			// console.group("p3 before")
			// console.log("label:", fxParam3Label)
			// console.log("control:", fxParam3)
			// console.log("readout:", fxParam3Readout)
			// console.groupEnd()
			// console.group("p4 before")
			// console.log("label:", fxParam4Label)
			// console.log("control:", fxParam4)
			// console.log("readout:", fxParam4Readout)
			// console.groupEnd()

			// set Tone & HTML depending on which FX is selected
			if(e.target.value === "Distortion") {
				console.log("Distortion Selected")
				SELECTED_FX = FX_DISTORTION

				// since setAttribute doesn't work,
				// we have to do this with jQuery
				// taken from webaudio-controls documentation:
				// (https://g200kg.github.io/webaudio-controls/docs/detailspecs.html) - setValue doesn't work
				// (https://g200kg.github.io/webaudio-controls/docs/resizetest.html) - jQuery logic here does

				setParamGroup(1,1, 0, 100, 0.5, 0, "Intensity")
				setParamGroup(2, 1, 0, 2, 1, 0, "Oversample" )
				setParamGroup(3, 1, 0, 1, 0.1, 0.5, "Mix" )
				setParamGroup(4, 0)

			} else if(e.target.value === "Chebyshev") {
				console.log("Chebyshev Selected")
				SELECTED_FX = FX_CHEBYSHEV

				setParamGroup(1, 1, 1, 100, 1, 0, "Order")
				setParamGroup(2, 1, 0, 1, 0.1, 0.5, "Mix")
				setParamGroup(3, 0)
				setParamGroup(4, 0)

			} else if(e.target.value === "Phaser") {
				console.log("Phaser Selected")
				SELECTED_FX = FX_PHASER

				setParamGroup(1, 1, 0, 20, 0.01, 0.1, "Frequency")
				setParamGroup(2, 1, 0, 12, 0.1, 2, "Octaves")
				setParamGroup(3, 1, 0, 100, 0.1, 1, "Q")
				setParamGroup(4, 1, 0, 1, 0.1, 1, "Mix")

			} else if(e.target.value === "Tremolo") {
				console.log("Tremolo Selected")
				SELECTED_FX = FX_TREMOLO

				setParamGroup(1, 1, 0, 20000, 0.1, 0, "Frequency")
				setParamGroup(2, 1, 0, 1, 0.01, 0, "Depth")
				setParamGroup(3, 1, 0, 100, 0.01, 0, "Spread")
				setParamGroup(4, 1, 0, 1, 0.1, 0.5, "Mix")

			} else if(e.target.value === "Vibrato") {
				console.log("Vibrato Selected")
				SELECTED_FX = FX_VIBRATO

				setParamGroup(1, 1, 0, 1200, 1, 0, "Frequency")
				setParamGroup(2, 1, 0, 1, 0.01, 0, "Depth")
				setParamGroup(3, 1, 0, 4, 1, 0, "Type")
				setParamGroup(4, 1, 0, 1, 0.1, 0.5, "Mix")

			} else if(e.target.value === "Delay") {
				console.log("Delay Selected")
				SELECTED_FX = FX_DELAY

				setParamGroup(1, 1, 0, 1, 0.01, 0, "Time")
				setParamGroup(2, 1, 0, 1, 0.01, 0.5, "Feedback")
				setParamGroup(3, 1, 0, 1, 0.1, 0.5, "Mix")
				setParamGroup(4, 0)

			} else if(e.target.value === "Reverb") {
				console.log("Reverb Selected")
				SELECTED_FX = FX_REVERB

				setParamGroup(1, 1, 0, 100, 1, 10, "Decay")
				setParamGroup(2, 1, 0, 5, 0.1, 0, "Pre-delay")
				setParamGroup(3, 1, 0, 1, 0.1, 0.5, "Mix")
				setParamGroup(4, 0)

			} else if(e.target.value === "PitchShift") {
				console.log("PitchShift Selected")
				SELECTED_FX = FX_PITCHSHIFT

				setParamGroup(1, 1, 0, 120, 0.1, 10, "Pitch")
				setParamGroup(2, 1, 0, 5, 0.1, 0, "Delay")
				setParamGroup(3, 1, 0, 1, 0.1, 0.5, "Feedback")
				setParamGroup(4, 1, 0, 1, 0.1, 0.5, "Mix")

			} else if(e.target.value === "FreqShift") {
				console.log("FreqShift Selected")
				SELECTED_FX = FX_FREQSHIFT

				setParamGroup(1, 1, 0, 5000, 0.1, 10, "Frequency")
				setParamGroup(2, 1, 0, 1, 0.1, 0.5, "Mix")
				setParamGroup(3, 0)
				setParamGroup(4, 0)

			}

			// log params after change
			// console.group("p1 after")
			// console.log("label:", fxParam1Label)
			// console.log("control:", fxParam1)
			// console.log("readout:", fxParam1Readout)
			// console.groupEnd()
			// console.group("p2 after")
			// console.log("label:", fxParam2Label)
			// console.log("control:", fxParam2)
			// console.log("readout:", fxParam2Readout)
			// console.groupEnd()
			// console.group("p3 after")
			// console.log("label:", fxParam3Label)
			// console.log("control:", fxParam3)
			// console.log("readout:", fxParam3Readout)
			// console.groupEnd()
			// console.group("p4 after")
			// console.log("label:", fxParam4Label)
			// console.log("control:", fxParam4)
			// console.log("readout:", fxParam4Readout)
			// console.groupEnd()

			if(fxEnabled){
				// set selected FX wet value to fxMix
				SELECTED_FX.set({wet: fxMix})
				// log selected FX
				console.log("Setting FX to " + SELECTED_FX + "...")
				// set output chain to filter -> selected FX -> master gain
				OUTPUT.chain(FILTER, SELECTED_FX, MASTER_GAIN)
			}
		}
		if(e.target.id === "fx_param1") {
			// set fx param 1 accordingly
			if(SELECTED_FX === FX_DISTORTION) {
				FX_DISTORTION.set({
					"distortion": e.target.value
				})
			} else if(SELECTED_FX === FX_CHEBYSHEV) {
				FX_CHEBYSHEV.set({
					"order": e.target.value
				})
			} else if(SELECTED_FX === FX_PHASER) {
				FX_PHASER.set({
					"frequency": e.target.value
				})
			} else if(SELECTED_FX === FX_TREMOLO) {
				FX_TREMOLO.set({
					"frequency": e.target.value
				})
			} else if(SELECTED_FX === FX_VIBRATO) {
				FX_VIBRATO.set({
					"frequency": e.target.value
				})
			} else if(SELECTED_FX === FX_DELAY) {
				FX_DELAY.set({
					"delayTime": e.target.value
				})
			} else if(SELECTED_FX === FX_REVERB) {
				FX_REVERB.set({
					"decay": e.target.value
				})
			} else if(SELECTED_FX === FX_PITCHSHIFT) {
				FX_PITCHSHIFT.set({
					"pitch": e.target.value
				})
			} else if(SELECTED_FX === FX_FREQSHIFT) {
				FX_FREQSHIFT.set({
					"frequency": e.target.value
				})
			}
		}
		if(e.target.id === "fx_param2") {
			// set fx param 2 accordingly
			if(SELECTED_FX === FX_DISTORTION) {
				FX_DISTORTION.set({
					"oversample": distortionOversampleValues[e.target.value]
				})
			} else if(SELECTED_FX === FX_CHEBYSHEV) {
				FX_CHEBYSHEV.set({
					"wet": e.target.value
				})
			} else if(SELECTED_FX === FX_PHASER) {
				FX_PHASER.set({
					"octaves": e.target.value
				})
			} else if(SELECTED_FX === FX_TREMOLO) {
				FX_TREMOLO.set({
					"depth": e.target.value
				})
			} else if(SELECTED_FX === FX_VIBRATO) {
				FX_VIBRATO.set({
					"depth": e.target.value
				})
			} else if(SELECTED_FX === FX_DELAY) {
				FX_DELAY.set({
					"feedback": e.target.value
				})
			} else if(SELECTED_FX === FX_REVERB) {
				FX_REVERB.set({
					"preDelay": e.target.value
				})
			} else if(SELECTED_FX === FX_PITCHSHIFT) {
				FX_PITCHSHIFT.set({
					"windowSize": e.target.value
				})
			} else if(SELECTED_FX === FX_FREQSHIFT) {
				FX_FREQSHIFT.set({
					"wet": e.target.value
				})
			}
		}
		if(e.target.id === "fx_param3") {
			// set fx param 3 accordingly
			if(SELECTED_FX === FX_DISTORTION) {
				FX_DISTORTION.set({
					"wet": e.target.value
				})
			} else if(SELECTED_FX === FX_PHASER) {
				FX_PHASER.set({
					"Q": e.target.value
				})
			} else if(SELECTED_FX === FX_TREMOLO) {
				FX_TREMOLO.set({
					"spread": e.target.value
				})
			} else if(SELECTED_FX === FX_VIBRATO) {
				FX_VIBRATO.set({
					"type": shapeValues[e.target.value]
				})
			} else if(SELECTED_FX === FX_DELAY) {
				FX_DELAY.set({
					"delayTime": e.target.value
				})
			} else if(SELECTED_FX === FX_REVERB) {
				FX_REVERB.set({
					"wet": e.target.value
				})
			} else if(SELECTED_FX === FX_PITCHSHIFT) {
				FX_PITCHSHIFT.set({
					"feedback": e.target.value
				})
			}
		}
		if(e.target.id === "fx_param4") {
			fxMix = e.target.value
			// set fx param 4 accordingly
			if(fxEnabled) {
				if(SELECTED_FX === FX_DISTORTION) {
					FX_DISTORTION.set({
						"wet": e.target.value
					})
				} else if(SELECTED_FX === FX_PHASER) {
					FX_PHASER.set({
						"wet": e.target.value
					})
				} else if(SELECTED_FX === FX_TREMOLO) {
					FX_TREMOLO.set({
						"wet": e.target.value
					})
				} else if(SELECTED_FX === FX_VIBRATO) {
					FX_VIBRATO.set({
						"wet": e.target.value
					})
				} else if(SELECTED_FX === FX_DELAY) {
					FX_DELAY.set({
						"wet": e.target.value
					})
				} else if(SELECTED_FX === FX_REVERB) {
					FX_REVERB.set({
						"wet": e.target.value
					})
				} else if(SELECTED_FX === FX_PITCHSHIFT) {
					FX_PITCHSHIFT.set({
						"wet": e.target.value
					})
				}
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
			// LFO.stop()
			heldKeys.push(note_a);
			heldKeys.push(note_b);
			heldKeys.push(note_c);
			// Trigger the attack for the new notes and add them to the playingKeys array

			SYNTH_A.triggerAttack(note_a);
			playingKeys.push(note_a);
			console.log("OSC_A Frequency:", SYNTH_A.toFrequency(note_a))

			SYNTH_B.triggerAttack(note_b);
			playingKeys.push(note_b);
			console.log("OSC_B Frequency:", SYNTH_B.toFrequency(note_b))

			SYNTH_C.triggerAttack(note_c);
			playingKeys.push(note_c);
			console.log("OSC_C Frequency:", SYNTH_C.toFrequency(note_c))

			console.log("playingKeys:", playingKeys)
			console.log("heldKeys:", heldKeys)
			// LFO.start()
		}
	// If note off
	} else {
		// remove the note from the heldKeys array
		heldKeys = heldKeys.filter(item => item !== note_a && item !== note_b && item !== note_c);
		// Trigger the release for the playing notes and remove them from the playingKeys array
		if (playingKeys.includes(note_a)) {
			SYNTH_A.triggerRelease(note_a);
			playingKeys = playingKeys.filter(item => item !== note_a);
		}
		if (playingKeys.includes(note_b)) {
			SYNTH_B.triggerRelease(note_b);
			playingKeys = playingKeys.filter(item => item !== note_b);
		}
		if (playingKeys.includes(note_c)) {
			SYNTH_C.triggerRelease(note_c);
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
		// LFO.stop()
	}
});

// -- CANVAS SETUP -- //

const fmCanvas = document.getElementById("fm_canvas");
const fmCanvasContext = fmCanvas.getContext("2d");
fmCanvasContext.beginPath();
fmCanvasContext.arc(25, 25, 20, 0, 2 * Math.PI);
fmCanvasContext.strokeStyle = "white";
fmCanvasContext.stroke();
