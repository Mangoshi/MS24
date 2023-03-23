import * as Tone from 'tone'

// -- TONE.JS SETUP -- //

// TODO:
//  1. PRESETS
//  2. A/B FM (Ratio & Depth) ✔
//  3. FILTER ENVELOPE
//  4. LFO SWITCHING
//  5. ARPEGGIATOR
//  6. GLIDE CONTROLS (Portamento)
//  7. VOICE & UNISON CONTROL ✔
//  8. TOOLTIPS / HELP TEXT
//  9. THEME SWITCHING
//  10. MIDI KEYBOARD CONTROL

// TODO: BUG FIXES
//  1. LFO SWITCHING
//  2. FX GLITCHES
//  3. REVERB LOAD
//  4. STICKY NOTES

// TODO: PRESETS
//  ✔ Declare object with all default synth data
//  ✔ When a parameter is changed, update the object
//  ✔ If a user clicks save, save the object to local storage / download as JSON
//  ✔ If a user clicks load, load the object from local storage / upload JSON (then set all parameters)
//  - If a user clicks randomize, randomize the object (this will require min/max values for each parameter)
//  - Split preset button out into two buttons (save & load)
//  - Add a "Download Preset" button
//  NEED:
//  ✔ Object matching synth data structure
//  ✔ Function for loading a preset & setting all parameters
//  ✔ Function for saving a preset & downloading as JSON
//  - Function for randomizing a preset & setting all parameters
//  ✔ Functions for updating the interface based on the current preset

// TODO: SYNTH FEATURES
//  ✔ Unison/Spread (Requires "fat" oscillator types)
//  - Glide (Figure out why it's not working)
//  ✔ FM (Requires FMSynth) (Can combine with fat oscillator types)
//  - Partials control (Will require strange dynamic controls for each partial)
//  - FX Buses (Will require using Tone.Channel: send generators to bus and receive on FX)
//  - Noise Generators (Will require using Tone.Noise)

// -- PRESET DATA (INITIAL) -- //

let PRESET = {
	METADATA: {
		name: "Init",
		type: "Default",
		author: "MangoSynth",
		rating: 0,
	},
	MASTER: {
		gain: 1
	},
	OSC_A: {
		enabled: 1,
		octave: 0,
		detune: 0,
		volume: 0,
		shape: 0,
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1,
		count: 1,
		spread: 0,
		harmonicity: 0,
		modulationIndex: 0,
		modulationShape: 0,
	},
	OSC_B: {
		enabled: 0,
		octave: 1,
		detune: 0,
		volume: 0,
		shape: 1,
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1,
		count: 1,
		spread: 0,
		harmonicity: 0,
		modulationIndex: 0,
		modulationShape: 0,
	},
	OSC_C: {
		enabled: 0,
		octave: 0,
		detune: 0,
		volume: 0,
		shape: 2,
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1,
		count: 1,
		spread: 0,
		harmonicity: 0,
		modulationShape: 0,
	},
	FILTER: {
		enabled: 1,
		frequency: 5000,
		Q: 0,
		gain: 0,
		rolloff: 0,
		type: 0,
		osc_a: 1,
		osc_b: 1,
		osc_c: 1
	},
	LFO: {
		enabled: 0,
		target: "FilterFrequency",
		type: 0,
		grid: 5,
		min: 0,
		max: 1000,
		osc_a: 1,
		osc_b: 1,
		osc_c: 1
	},
	FX: {
		enabled: 1,
		type: "Distortion",
		param1: 0,
		param2: 0,
		param3: 0.5,
		param4: 0,
		mix: 0.5,
		osc_a: 1,
		osc_b: 1,
		osc_c: 1
	}
}

// TODO: Add each FX type to the PRESET object

// -- MIN/MAX DATA (to be used for randomization) -- //

let MIN_MAX = {
	MASTER: {
		gain: [0, 2]
	},
	OSCILLATOR: {
		octave: [-3, 3],
		detune: [-12, 12],
		volume: [-10, 10],
		shape: [0, 3],
		attack: [0, 2],
		decay: [0, 2],
		sustain: [0, 1],
		release: [0, 5]
	},
	FILTER: {
		frequency: [1, 10000],
		Q: [0, 24],
		rolloff: [0, 3],
		type: [0, 3],
		osc_a: [0, 1],
		osc_b: [0, 1],
		osc_c: [0, 1]
	},
	LFO: {
		target: [0, 4],
		grid: [0, 9],
		shape: [0, 3],
		osc_a: [0, 1],
		osc_b: [0, 1],
		osc_c: [0, 1]
	},
	FX: {
		type: [0, 8],
		osc_a: [0, 1],
		osc_b: [0, 1],
		osc_c: [0, 1]
	},
	FX_DISTORTION: {
		intensity: [0, 20],
		oversample: [0, 2],
		mix: [0, 1],
	},
	FX_CHEBYSHEV: {
		order: [0, 100],
		mix: [0, 1],
	},
	FX_PHASER: {
		frequency: [0, 20],
		octaves: [0, 12],
		Q: [0, 100],
		mix: [0, 1],
	},
	FX_TREMOLO: {
		frequency: [0, 20000],
		depth: [0, 1],
		spread: [0, 180],
		mix: [0, 1],
	},
	FX_VIBRATO: {
		frequency: [0, 20000],
		depth: [0, 1],
		shape: [0, 3],
		mix: [0, 1],
	},
	FX_DELAY: {
		time: [0, 1],
		feedback: [0, 1],
		mix: [0, 1],
	},
	FX_REVERB: {
		decay: [0, 100],
		preDelay: [0, 5],
		mix: [0, 1],
	},
	FX_PITCHSHIFT: {
		pitch: [-120, 120],
		size: [0.01, 12],
		feedback: [0, 1],
		mix: [0, 1],
	},
	FX_FREQSHIFT: {
		frequency: [0, 20000],
		mix: [0, 1],
	}
}

// -- DATA CONVERSION -- //

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
let oscillatorShapeValues = {
	"0": "fatsine",
	"1": "fattriangle",
	"2": "fatsawtooth",
	"3": "fatsquare",
}
let shapeValues = {
	"0": "sine",
	"1": "triangle",
	"2": "sawtooth",
	"3": "square",
}
let shapeReadoutValues = {
	"0": "sine",
	"1": "triangle",
	"2": "sawtooth",
	"3": "square",
}
let smallShapeReadoutValues = {
	"0": "sin",
	"1": "tri",
	"2": "saw",
	"3": "sqr",
}
let filterTypeValues = {
	"0": "lowpass",
	"1": "highpass",
	"2": "bandpass",
	"3": "allpass",
	"4": "notch",
	"5": "lowshelf",
	"6": "highshelf",
}
let filterTypeReadoutValues = {
	"0": "LPF",
	"1": "HPF",
	"2": "BPF",
	"3": "APF",
	"4": "Notch",
	"5": "LSF",
	"6": "HSF",
}
let filterRolloffValues = {
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
let lfoGridReadoutValues = {
	"0": '8/1',
	"1": '4/1',
	"2": '2/1',
	"3": '1/1',
	"4": '1/2',
	"5": '1/4',
	"6": '1/8',
	"7": '1/16',
	"8": '1/32',
	"9": '1/64',
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

// -- MASTER -- //

const OUTPUT = Tone.getDestination()
const MASTER_GAIN = new Tone.Gain(PRESET.MASTER.gain)
const MASTER_LIMITER = new Tone.Limiter(-10)

// -- RECORD -- //

const RECORDER = new Tone.Recorder()
// TODO: lossless exporting ???
// https://stackoverflow.com/questions/47331364/record-as-ogg-using-mediarecorder-in-chrome/57837816#57837816
// https://github.com/mmig/libflac.js
// https://youtu.be/VHCv3waFkRo

// -- GENERATORS -- //

const SYNTH_A = new Tone.PolySynth(Tone.FMSynth)
SYNTH_A.set({
	oscillator: {
		type: oscillatorShapeValues[PRESET.OSC_A.shape],
		count: PRESET.OSC_A.count,
		spread: PRESET.OSC_A.spread,
	},
	harmonicity: PRESET.OSC_A.harmonicity,
	modulationIndex: PRESET.OSC_A.modulationIndex,
	modulation: {
		type: oscillatorShapeValues[PRESET.OSC_A.modulationShape]
	}
})
const SYNTH_B = new Tone.PolySynth(Tone.FMSynth)
SYNTH_B.set({
	oscillator: {
		type: oscillatorShapeValues[PRESET.OSC_B.shape],
		count: PRESET.OSC_B.count,
		spread: PRESET.OSC_B.spread,
	},
	harmonicity: PRESET.OSC_B.harmonicity,
	modulationIndex: PRESET.OSC_B.modulationIndex,
	modulation: {
		type: oscillatorShapeValues[PRESET.OSC_B.modulationShape]
	}
})
const SYNTH_C = new Tone.PolySynth(Tone.AMSynth)
SYNTH_C.set({
	oscillator: {
		type: oscillatorShapeValues[PRESET.OSC_C.shape],
		count: PRESET.OSC_C.count,
		spread: PRESET.OSC_C.spread,
	},
	harmonicity: PRESET.OSC_C.harmonicity,
	modulation: {
		type: oscillatorShapeValues[PRESET.OSC_C.modulationShape]
	}
})

SYNTH_A.debug = true
SYNTH_B.debug = true
SYNTH_C.debug = true

// -- FILTER -- //

const FILTER = new Tone.Filter(
	PRESET.FILTER.frequency,
	filterTypeValues[PRESET.FILTER.type],
	filterRolloffValues[PRESET.FILTER.rolloff]
)

// -- LFO -- //

let LFO_TARGET_VALUE = PRESET.FILTER.frequency

const LFO = new Tone.LFO(lfoGridValues[PRESET.LFO.grid], PRESET.LFO.min, LFO_TARGET_VALUE).start()

// -- FX -- //

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
let fxSelectValues = {
	"Distortion" : FX_DISTORTION,
	"Chebyshev" : FX_CHEBYSHEV,
	"Phaser" : FX_PHASER,
	"Tremolo" : FX_TREMOLO,
	"Vibrato" : FX_VIBRATO,
	"Delay" : FX_DELAY,
	"Reverb" : FX_REVERB,
	"PitchShift" : FX_PITCHSHIFT,
	"FreqShift" : FX_FREQSHIFT,
}
function setFXParam1(value) {
	switch (SELECTED_FX) {
		case FX_DISTORTION:
			FX_DISTORTION.set({
				"distortion": value
			})
			break;
		case FX_CHEBYSHEV:
			FX_CHEBYSHEV.set({
				"order": value
			})
			break;
		case FX_PHASER:
			FX_PHASER.set({
				"frequency": value
			})
			break;
		case FX_TREMOLO:
			FX_TREMOLO.set({
				"frequency": value
			})
			break;
		case FX_VIBRATO:
			FX_VIBRATO.set({
				"frequency": value
			})
			break;
		case FX_DELAY:
			FX_DELAY.set({
				"delayTime": value
			})
			break;
		case FX_REVERB:
			FX_REVERB.set({
				"decay": value
			})
			break;
		case FX_PITCHSHIFT:
			FX_PITCHSHIFT.set({
				"pitch": value
			})
			break;
		case FX_FREQSHIFT:
			FX_FREQSHIFT.set({
				"frequency": value
			})
			break;
		default:
			console.log("Switch default: Nothing set for this case!")
	}
}
function setFXParam2(value){
	switch (SELECTED_FX) {
		case FX_DISTORTION:
			FX_DISTORTION.set({
				"oversample": distortionOversampleValues[value]
			})
			break;
		case FX_CHEBYSHEV:
			PRESET.FX.mix = value
			FX_CHEBYSHEV.set({
				"wet": value
			})
			break;
		case FX_PHASER:
			FX_PHASER.set({
				"octaves": value
			})
			break;
		case FX_TREMOLO:
			FX_TREMOLO.set({
				"depth": value
			})
			break;
		case FX_VIBRATO:
			FX_VIBRATO.set({
				"depth": value
			})
			break;
		case FX_DELAY:
			FX_DELAY.set({
				"feedback": value
			})
			break;
		case FX_REVERB:
			FX_REVERB.set({
				"preDelay": value
			})
			break;
		case FX_PITCHSHIFT:
			FX_PITCHSHIFT.set({
				"windowSize": value
			})
			break;
		case FX_FREQSHIFT:
			PRESET.FX.mix = value
			FX_FREQSHIFT.set({
				"wet": value
			})
			break;
		default:
			console.log("Switch default: Nothing set for this case!")
	}
}
function setFXParam3(value){
	switch (SELECTED_FX) {
		case FX_DISTORTION:
			PRESET.FX.mix = value
			FX_DISTORTION.set({
				"wet": value
			})
			break;
		case FX_PHASER:
			FX_PHASER.set({
				"Q": value
			})
			break;
		case FX_TREMOLO:
			FX_TREMOLO.set({
				"spread": value
			})
			break;
		case FX_VIBRATO:
			FX_VIBRATO.set({
				"type": shapeValues[value]
			})
			break;
		case FX_DELAY:
			FX_DELAY.set({
				"delayTime": value
			})
			break;
		case FX_REVERB:
			PRESET.FX.mix = value
			FX_REVERB.set({
				"wet": value
			})
			break;
		case FX_PITCHSHIFT:
			FX_PITCHSHIFT.set({
				"feedback": value
			})
			break;
		default:
			console.log("Switch default: Nothing set for this case!")
	}
}
function setFXParam4(value){
	switch (SELECTED_FX) {
		case FX_PHASER:
			FX_PHASER.set({
				"wet": value
			})
			break;
		case FX_TREMOLO:
			FX_TREMOLO.set({
				"wet": value
			})
			break;
		case FX_VIBRATO:
			FX_VIBRATO.set({
				"wet": value
			})
			break;
		case FX_PITCHSHIFT:
			FX_PITCHSHIFT.set({
				"wet": value
			})
			break;
		default:
			console.log("Switch default: Nothing set for this case!")
	}
}
function resetFX() {
	FX_DISTORTION.set({wet: 0})
	FX_CHEBYSHEV.set({wet: 0})
	FX_PHASER.set({wet: 0})
	FX_TREMOLO.set({wet: 0})
	FX_VIBRATO.set({wet: 0})
	FX_DELAY.set({wet: 0})
	FX_REVERB.set({wet: 0})
	FX_PITCHSHIFT.set({wet: 0})
	FX_FREQSHIFT.set({wet: 0})
}
// TODO: Fix bug where FX params are kept when switching FX, but the GUI doesn't reflect this

// -- NOTES -- //

const ARP = new Tone.Pattern(function(time, note){
	SYNTH_A.triggerAttackRelease(note, 0.25);
	SYNTH_B.triggerAttackRelease(note, 0.25);
	SYNTH_C.triggerAttackRelease(note, 0.25);
}, ["C4", "D4", "E4", "G4", "A4"]);

// -- WAVEFORMS -- //

let oscA_waveform = new Tone.Waveform()
let oscB_waveform = new Tone.Waveform()
let oscC_waveform = new Tone.Waveform()

// -- INITIAL CONNECTIONS -- //

let SELECTED_FX = FX_DISTORTION
let LFO_TARGET = FILTER.frequency

function connectSynths(){
	// If Osc A is enabled
	if(PRESET.OSC_A.enabled){
		// If filter is enabled and Osc A is routed to filter
		if(PRESET.FILTER.enabled && PRESET.FILTER.osc_a){
			// Connect Osc A to waveform->filter->FX->output
			SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
		} else {
			// If not, connect Osc A to waveform->FX->output
			SYNTH_A.chain(SELECTED_FX, OUTPUT)
		}
		SYNTH_A.connect(oscA_waveform)
	}
	if(PRESET.OSC_B.enabled){
		if(PRESET.FILTER.enabled && PRESET.FILTER.osc_b){
			SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
		} else {
			SYNTH_B.chain(SELECTED_FX, OUTPUT)
		}
		SYNTH_B.connect(oscB_waveform)
	}
	if(PRESET.OSC_C.enabled){
		if(PRESET.FILTER.enabled && PRESET.FILTER.osc_c){
			SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
		} else {
			SYNTH_C.chain(SELECTED_FX, OUTPUT)
		}
		SYNTH_C.connect(oscC_waveform)
	}
}

function connectTone() {
	SYNTH_A.disconnect()
	SYNTH_B.disconnect()
	SYNTH_C.disconnect()
	FILTER.disconnect()
	LFO.stop()
	resetFX()

	// FX //
	if(PRESET.FX.enabled) {
		SELECTED_FX.set({
			"wet": PRESET.FX.mix
		})
	}

	// Synths //
	connectSynths()

	// Master FX Chain //
	OUTPUT.chain(MASTER_GAIN, MASTER_LIMITER)

	// Modulation //
	if(PRESET.LFO.enabled){
		LFO.connect(LFO_TARGET).start()
	} else {
	}

	// Master Record
	OUTPUT.connect(RECORDER)
}
connectTone()

// -- CONTROLS DATA -- //

let controls = document.getElementsByClassName("control");
// console.log(controls);

// TODO (?) [idea]:
//  - Infinite loop / listener to fire attack/release signals on array of notes playing
//  - This is kept outside the event listeners
//  - onChange pushes note to array
//  - onRelease removes note from array
//  - Controls changes the array / signals

let filterResonanceKnob = document.getElementById("filter_resonance")
let filterResonanceReadout = document.getElementById("filter_resonance_readout")
let filterResonanceLabel = document.getElementById("filter_resonance_label")
let filterResonanceGroup = document.getElementById("filter_resonance_group")

function updateFilterKnob(target, enable, min, max, step, value, label) {
	if(target==="filter_resonance"){
		$('#filter_resonance')[0].min=min;
		$('#filter_resonance')[0].max=max;
		$('#filter_resonance')[0].step=step;
		$('#filter_resonance')[0].value=value;
		$('#filter_resonance')[0].enable=enable;
		filterResonanceReadout.value = value
		filterResonanceLabel.innerHTML = label
		if(!enable){
			filterResonanceGroup.setAttribute("style", "display: none;")
		} else {
			filterResonanceGroup.setAttribute("style", "display: flex;")
		}
	}
}
function filterGroupUpdate(target) {
	// If filter type is lowshelf or highshelf...
	if (target === 5 || target === 6) {
		// ...change the filter Q knob to gain knob
		updateFilterKnob("filter_resonance", 1, 0, 24, 0.1, PRESET.FILTER.gain.toFixed(1), "Gain")
		// Else if filter type is not lowshelf or highshelf...
	} else {
		// ...change the filter gain knob to Q knob
		updateFilterKnob("filter_resonance", 1, 1, 10, 0.1, PRESET.FILTER.Q, "Q")
	}
}

let fxParam1Knob = document.getElementById("fx_param1")
let fxParam1Readout = document.getElementById("fx_param1_readout")
let fxParam1Label = document.getElementById("fx_param1_label")
let fxParam1Group = document.getElementById("fx_param1_group")

let fxParam2Knob = document.getElementById("fx_param2")
let fxParam2Readout = document.getElementById("fx_param2_readout")
let fxParam2Label = document.getElementById("fx_param2_label")
let fxParam2Group = document.getElementById("fx_param2_group")

let fxParam3Knob = document.getElementById("fx_param3")
let fxParam3Readout = document.getElementById("fx_param3_readout")
let fxParam3Label = document.getElementById("fx_param3_label")
let fxParam3Group = document.getElementById("fx_param3_group")

let fxParam4Knob = document.getElementById("fx_param4")
let fxParam4Readout = document.getElementById("fx_param4_readout")
let fxParam4Label = document.getElementById("fx_param4_label")
let fxParam4Group = document.getElementById("fx_param4_group")

function updateFxKnob(target, enable, min, max, step, value, label, conv) {
	switch (target) {
		case 1:
			$('#fx_param1')[0].min = min;
			$('#fx_param1')[0].max = max;
			$('#fx_param1')[0].step = step;
			$('#fx_param1')[0].value = value;
			$('#fx_param1')[0].enable = enable;
			fxParam1Readout.value = value
			fxParam1Label.innerHTML = label
			if (!enable) {
				fxParam1Group.setAttribute("style", "display: none;")
			} else {
				fxParam1Group.setAttribute("style", "display: flex;")
			}
			break;
		case 2:
			$('#fx_param2')[0].min = min;
			$('#fx_param2')[0].max = max;
			$('#fx_param2')[0].step = step;
			$('#fx_param2')[0].value = value;
			$('#fx_param2')[0].enable = enable;
			fxParam2Readout.value = value
			fxParam2Label.innerHTML = label
			if (!enable) {
				fxParam2Group.setAttribute("style", "display: none;")
			} else {
				fxParam2Group.setAttribute("style", "display: flex;")
			}
			break;
		case 3:
			$('#fx_param3')[0].min = min;
			$('#fx_param3')[0].max = max;
			$('#fx_param3')[0].step = step;
			$('#fx_param3')[0].value = value;
			$('#fx_param3')[0].enable = enable;
			fxParam3Readout.value = value
			fxParam3Label.innerHTML = label
			if(conv){
				// This is for vibrato shape!
				$('#fx_param3')[0].conv = conv;
				fxParam3Readout.value = shapeValues[value]
			}
			if (!enable) {
				fxParam3Group.setAttribute("style", "display: none;")
			} else {
				fxParam3Group.setAttribute("style", "display: flex;")
			}
			break;
		case 4:
			$('#fx_param4')[0].min = min;
			$('#fx_param4')[0].max = max;
			$('#fx_param4')[0].step = step;
			$('#fx_param4')[0].value = value;
			$('#fx_param4')[0].enable = enable;
			fxParam4Readout.value = value
			fxParam4Label.innerHTML = label
			if (!enable) {
				fxParam4Group.setAttribute("style", "display: none;")
			} else {
				fxParam4Group.setAttribute("style", "display: flex;")
			}
			break;
	}
}

function fxGroupUpdate(switchTarget){
	switch (switchTarget) {
		case "Distortion":
			PRESET.FX.type = "Distortion"
			SELECTED_FX = FX_DISTORTION

			// since setAttribute doesn't work,
			// we have to do this with jQuery
			// taken from webaudio-controls documentation:
			// (https://g200kg.github.io/webaudio-controls/docs/detailspecs.html) - setValue doesn't work
			// (https://g200kg.github.io/webaudio-controls/docs/resizetest.html) - jQuery logic here does

			updateFxKnob(1, 1, 0, 20, 0.1, 0, "Intensity")
			updateFxKnob(2, 1, 0, 2, 1, 0, "Oversample")
			updateFxKnob(3, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(4, 0)
			break;
		case "Chebyshev":
			PRESET.FX.type = "Chebyshev"
			SELECTED_FX = FX_CHEBYSHEV

			updateFxKnob(1, 1, 1, 100, 1, 0, "Order")
			updateFxKnob(2, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(3, 0)
			updateFxKnob(4, 0)
			break;
		case "Phaser":
			PRESET.FX.type = "Phaser"
			SELECTED_FX = FX_PHASER

			updateFxKnob(1, 1, 0, 20, 0.01, 0.1, "Frequency")
			updateFxKnob(2, 1, 0, 12, 0.1, 2, "Octaves")
			updateFxKnob(3, 1, 0, 100, 0.1, 1, "Q")
			updateFxKnob(4, 1, 0, 1, 0.1, 1, "Mix")
			break;
		case "Tremolo":
			PRESET.FX.type = "Tremolo"
			SELECTED_FX = FX_TREMOLO

			updateFxKnob(1, 1, 0, 20000, 0.1, 0, "Frequency")
			updateFxKnob(2, 1, 0, 1, 0.01, 0, "Depth")
			updateFxKnob(3, 1, 0, 100, 0.01, 0, "Spread")
			updateFxKnob(4, 1, 0, 1, 0.1, 0.5, "Mix")
			break;
		case "Vibrato":
			PRESET.FX.type = "Vibrato"
			SELECTED_FX = FX_VIBRATO

			updateFxKnob(1, 1, 0, 1200, 1, 0, "Frequency")
			updateFxKnob(2, 1, 0, 1, 0.01, 0, "Depth")
			updateFxKnob(3, 1, 0, 3, 1, 0, "Type", "['sine','triangle','sawtooth','square'][x]")
			updateFxKnob(4, 1, 0, 1, 0.1, 0.5, "Mix")
			break;
		case "Delay":
			PRESET.FX.type = "Delay"
			SELECTED_FX = FX_DELAY

			updateFxKnob(1, 1, 0, 1, 0.01, 0, "Time")
			updateFxKnob(2, 1, 0, 1, 0.01, 0.5, "Feedback")
			updateFxKnob(3, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(4, 0)
			break;
		case "Reverb":
			PRESET.FX.type = "Reverb"
			SELECTED_FX = FX_REVERB

			updateFxKnob(1, 1, 0, 100, 1, 10, "Decay")
			updateFxKnob(2, 1, 0, 5, 0.1, 0, "Pre-delay")
			updateFxKnob(3, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(4, 0)
			break;
		case "PitchShift":
			PRESET.FX.type = "PitchShift"
			SELECTED_FX = FX_PITCHSHIFT

			updateFxKnob(1, 1, -120, 120, 0.1, 0, "Pitch")
			updateFxKnob(2, 1, 0.01, 12, 0.01, 0.03, "Size")
			updateFxKnob(3, 1, 0, 1, 0.01, 0.5, "Feedback")
			updateFxKnob(4, 1, 0, 1, 0.1, 0.5, "Mix")
			break;
		case "FreqShift":
			PRESET.FX.type = "FreqShift"
			SELECTED_FX = FX_FREQSHIFT

			updateFxKnob(1, 1, 0, 1000, 0.1, 0, "Frequency")
			updateFxKnob(2, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(3, 0)
			updateFxKnob(4, 0)
			break;
		default:
			console.log("Switch default: Nothing set for this case!")
	}
}

let recorderLabel = document.getElementById("rec_label")

// -- EVENT LISTENERS -- //

// Key-press events //
document.addEventListener("keypress", function (e) {
	// console.log(e)
	// disable quick-find in browser
	if (e.key === "/") {
		e.preventDefault()
	}
	// disable quick-find (links only) in browser
	if (e.key === "'") {
		e.preventDefault()
	}
})

// Top-row elements //
let synthBody = document.getElementById("synth_body")
let presetsContainer = document.getElementById("presets_container")
let presetsButton = document.getElementById("presets_button")
let presetDiskLoadButton = document.getElementById("preset_disk_load_button")
let presetSaveButton = document.getElementById("preset_save_button")
let presetDownloadButton = document.getElementById("preset_download_button")
let presetNameInput = document.getElementById("preset_name_input")
let presetTypeInput = document.getElementById("preset_type_input")
let presetAuthorInput = document.getElementById("preset_author_input")
let presetRatingInput = document.getElementById("preset_rating_input")
let fileInput = document.getElementById("preset_file_input")
let settingsButton = document.getElementById("settings_button")
let settingsDropdown = document.getElementById("settings_dropdown")
let settingsThemeButton = document.getElementById("settings_theme_button")
let randomButton = document.getElementById("random_preset_button")

// Dropdown states
let settingsDropdownOpen = 0
let presetsPageOpen = 0

// Functions for top-row buttons
function toggleDropdown(target) {
	if (target.classList.contains("hidden")) {
		target.classList.remove("hidden")
	} else {
		target.classList.add("hidden")
	}
	if (target === settingsDropdown) {
		settingsDropdownOpen = !settingsDropdownOpen
	}
}
function togglePresetsPage() {
	if (presetsPageOpen) {
		synthBody.classList.remove("hidden")
		presetsContainer.classList.add("hidden")
	} else {
		synthBody.classList.add("hidden")
		presetsContainer.classList.remove("hidden")
	}
	presetsPageOpen = !presetsPageOpen
}

// Event listeners for top-row buttons
settingsButton.addEventListener("click", function () {
	toggleDropdown(settingsDropdown)
})
presetsButton.addEventListener("click", function () {
	togglePresetsPage()
	if(settingsDropdownOpen){
		toggleDropdown(settingsDropdown)
	}
})
randomButton.addEventListener("click", function () {
	console.log("This button will return a randomized preset!")
})

// Event listeners for settings dropdown
settingsThemeButton.addEventListener("click", function () {
	console.log("This button will change the theme!")
	toggleDropdown(settingsDropdown)
})
// Event listeners for presets page
presetSaveButton.addEventListener("click", function() {
	savePreset(PRESET)
})
presetDownloadButton.addEventListener("click", function() {
	downloadPreset(PRESET)
})

// Event listeners for preset metadata input fields
presetNameInput.addEventListener("input", function () {
	PRESET.METADATA.name = presetNameInput.value
})
presetTypeInput.addEventListener("input", function () {
	PRESET.METADATA.type = presetTypeInput.value
})
presetAuthorInput.addEventListener("input", function () {
	PRESET.METADATA.author = presetAuthorInput.value
})
presetRatingInput.addEventListener("input", function () {
	PRESET.METADATA.rating = presetRatingInput.value
})

// Function which checks how many preset-x items are in localStorage and returns the next available number
function getNextPresetNumber() {
	let i = 0
	while (localStorage.getItem("preset-" + i) !== null) {
		i++
	}
	return i
}
function savePreset(PRESET) {
	if (PRESET.METADATA.name === "") {
		alert("Please enter a name for your preset!")
	} else {
		console.log("Preset saved:", PRESET.METADATA.name)
		// Save to localStorage as preset-x (x being +1 of the last preset)
		localStorage.setItem("preset-" + getNextPresetNumber(), JSON.stringify(PRESET))
		// Set input fields
		presetNameInput.value = PRESET.METADATA.name
		presetTypeInput.value = PRESET.METADATA.type
		presetAuthorInput.value = PRESET.METADATA.author
		presetRatingInput.value = PRESET.METADATA.rating
		// Close presets page
		// togglePresetsPage()
		populatePresetsTable()
	}
}
function downloadPreset(PRESET){
	console.log(PRESET)
	if(PRESET.METADATA.name === "") {
		alert("Please enter a name for your preset!")
	} else {
		const anchor = document.createElement("a");
		anchor.href = URL.createObjectURL(new Blob([JSON.stringify(PRESET, null, 2)], {
			type: "text/plain"
		}));
		anchor.download = `${PRESET.METADATA.name}.ms24preset`;
		anchor.click();
	}
}
function loadPreset(preset) {
	// Set PRESET object
	PRESET = preset
	console.log("Preset loaded:", preset.METADATA.name)
	// Close presets page if open
	if(presetsPageOpen) {
		togglePresetsPage()
	}
	// Set input fields
	presetNameInput.value = preset.METADATA.name
	presetTypeInput.value = preset.METADATA.type
	presetAuthorInput.value = preset.METADATA.author
	presetRatingInput.value = preset.METADATA.rating
	// Update GUI //
	// MASTER
	updateGUI("master_gain", preset.MASTER.gain, preset.MASTER.gain)
	// OSC A
	updateGUI("osc_a_switch", preset.OSC_A.enabled)
	updateGUI("osc_a_octave", preset.OSC_A.octave, preset.OSC_A.octave)
	updateGUI("osc_a_semi", preset.OSC_A.detune, preset.OSC_A.detune)
	updateGUI("osc_a_volume", preset.OSC_A.volume, preset.OSC_A.volume)
	updateGUI("osc_a_shape", preset.OSC_A.shape, shapeReadoutValues[preset.OSC_A.shape])
	updateGUI("osc_a_attack", preset.OSC_A.attack, preset.OSC_A.attack)
	updateGUI("osc_a_decay", preset.OSC_A.decay, preset.OSC_A.decay)
	updateGUI("osc_a_sustain", preset.OSC_A.sustain, preset.OSC_A.sustain)
	updateGUI("osc_a_release", preset.OSC_A.release, preset.OSC_A.release)
	updateGUI("osc_a_voices", preset.OSC_A.count, preset.OSC_A.count)
	updateGUI("osc_a_spread", preset.OSC_A.spread, preset.OSC_A.spread)
	updateGUI("osc_a_fm", preset.OSC_A.harmonicity, preset.OSC_A.harmonicity)
	updateGUI("osc_a_fm_depth", preset.OSC_A.modulationIndex, preset.OSC_A.modulationIndex)
	updateGUI("osc_a_fm_shape", preset.OSC_A.modulationShape, smallShapeReadoutValues[preset.OSC_A.modulationShape])
	// OSC B
	updateGUI("osc_b_switch", preset.OSC_B.enabled)
	updateGUI("osc_b_octave", preset.OSC_B.octave, preset.OSC_B.octave)
	updateGUI("osc_b_semi", preset.OSC_B.detune, preset.OSC_B.detune)
	updateGUI("osc_b_volume", preset.OSC_B.volume, preset.OSC_B.volume)
	updateGUI("osc_b_shape", preset.OSC_B.shape, shapeReadoutValues[preset.OSC_B.shape])
	updateGUI("osc_b_attack", preset.OSC_B.attack, preset.OSC_B.attack)
	updateGUI("osc_b_decay", preset.OSC_B.decay, preset.OSC_B.decay)
	updateGUI("osc_b_sustain", preset.OSC_B.sustain, preset.OSC_B.sustain)
	updateGUI("osc_b_release", preset.OSC_B.release, preset.OSC_B.release)
	updateGUI("osc_b_voices", preset.OSC_B.count, preset.OSC_B.count)
	updateGUI("osc_b_spread", preset.OSC_B.spread, preset.OSC_B.spread)
	updateGUI("osc_b_fm", preset.OSC_B.harmonicity, preset.OSC_B.harmonicity)
	updateGUI("osc_b_fm_depth", preset.OSC_B.modulationIndex, preset.OSC_B.modulationIndex)
	updateGUI("osc_b_fm_shape", preset.OSC_B.modulationShape, smallShapeReadoutValues[preset.OSC_B.modulationShape])
	// OSC C
	updateGUI("osc_c_switch", preset.OSC_C.enabled)
	updateGUI("osc_c_octave", preset.OSC_C.octave, preset.OSC_C.octave)
	updateGUI("osc_c_semi", preset.OSC_C.detune, preset.OSC_C.detune)
	updateGUI("osc_c_volume", preset.OSC_C.volume, preset.OSC_C.volume)
	updateGUI("osc_c_shape", preset.OSC_C.shape, shapeReadoutValues[preset.OSC_C.shape])
	updateGUI("osc_c_attack", preset.OSC_C.attack, preset.OSC_C.attack)
	updateGUI("osc_c_decay", preset.OSC_C.decay, preset.OSC_C.decay)
	updateGUI("osc_c_sustain", preset.OSC_C.sustain, preset.OSC_C.sustain)
	updateGUI("osc_c_release", preset.OSC_C.release, preset.OSC_C.release)
	updateGUI("osc_c_voices", preset.OSC_C.count, preset.OSC_C.count)
	updateGUI("osc_c_spread", preset.OSC_C.spread, preset.OSC_C.spread)
	updateGUI("osc_c_am", preset.OSC_C.harmonicity, preset.OSC_C.harmonicity)
	updateGUI("osc_c_am_shape", preset.OSC_C.modulationShape, smallShapeReadoutValues[preset.OSC_C.modulationShape])
	// FILTER
	filterGroupUpdate(preset.FILTER.type)
	updateGUI("filter_switch", preset.FILTER.enabled)
	updateGUI("filter_cutoff", preset.FILTER.frequency, preset.FILTER.frequency)
	updateGUI("filter_resonance", preset.FILTER.Q, preset.FILTER.Q)
	updateGUI("filter_rolloff", preset.FILTER.rolloff, filterRolloffValues[preset.FILTER.rolloff])
	updateGUI("filter_type", preset.FILTER.type, filterTypeReadoutValues[preset.FILTER.type])
	updateGUI("osc_a_filter_switch", preset.FILTER.osc_a)
	updateGUI("osc_b_filter_switch", preset.FILTER.osc_b)
	updateGUI("osc_c_filter_switch", preset.FILTER.osc_c)
	// LFO
	updateSelectBox("lfo_selector", preset.LFO.target)
	updateGUI("lfo_switch", preset.LFO.enabled)
	updateGUI("lfo_grid", preset.LFO.grid, lfoGridReadoutValues[preset.LFO.grid])
	updateGUI("lfo_min", preset.LFO.min, preset.LFO.min)
	updateGUI("lfo_max", preset.LFO.max, preset.LFO.max)
	updateGUI("lfo_shape", preset.LFO.type, shapeValues[preset.LFO.type])
	// FX
	updateSelectBox("fx_selector", preset.FX.type)
	fxGroupUpdate(preset.FX.type)
	updateGUI("fx_switch", preset.FX.enabled)
	updateGUI("fx_param1", preset.FX.param1, preset.FX.param1)
	updateGUI("fx_param2", preset.FX.param2, preset.FX.param2)
	updateGUI("fx_param3", preset.FX.param3, preset.FX.param3)
	updateGUI("fx_param4", preset.FX.param4, preset.FX.param4)

	// Update Tone.js //
	// OSC A
	SYNTH_A.set({
		"oscillator": {
			"type": oscillatorShapeValues[preset.OSC_A.shape],
			"count": preset.OSC_A.count,
			"spread": preset.OSC_A.spread,
		},
		"harmonicity": preset.OSC_A.harmonicity,
		"modulationIndex": preset.OSC_A.modulationIndex,
		"modulation": {
			"type": oscillatorShapeValues[preset.OSC_A.modulationShape]
		},
		"envelope": {
			"attack": preset.OSC_A.attack,
			"decay": preset.OSC_A.decay,
			"sustain": preset.OSC_A.sustain,
			"release": preset.OSC_A.release
		},
		"volume": preset.OSC_A.volume
	})
	// OSC B
	SYNTH_B.set({
		"oscillator": {
			"type": oscillatorShapeValues[preset.OSC_B.shape],
			"count": preset.OSC_B.count,
			"spread": preset.OSC_B.spread,
		},
		"harmonicity": preset.OSC_B.harmonicity,
		"modulationIndex": preset.OSC_B.modulationIndex,
		"modulation": {
			"type": oscillatorShapeValues[preset.OSC_B.modulationShape]
		},
		"envelope": {
			"attack": preset.OSC_B.attack,
			"decay": preset.OSC_B.decay,
			"sustain": preset.OSC_B.sustain,
			"release": preset.OSC_B.release
		},
		"volume": preset.OSC_B.volume
	})
	// OSC C
	SYNTH_C.set({
		"oscillator": {
			"type": oscillatorShapeValues[preset.OSC_C.shape],
			"count": preset.OSC_C.count,
			"spread": preset.OSC_C.spread,
		},
		"harmonicity": preset.OSC_C.harmonicity,
		"modulation": {
			"type": oscillatorShapeValues[preset.OSC_C.modulationShape]
		},
		"envelope": {
			"attack": preset.OSC_C.attack,
			"decay": preset.OSC_C.decay,
			"sustain": preset.OSC_C.sustain,
			"release": preset.OSC_C.release
		},
		"volume": preset.OSC_C.volume
	})
	// FILTER
	FILTER.set({
		"type": filterTypeValues[preset.FILTER.type],
		"frequency": preset.FILTER.frequency,
		"Q": preset.FILTER.Q,
		"gain": preset.FILTER.gain,
		"rolloff": filterRolloffValues[preset.FILTER.rolloff]
	})
	// LFO
	if (preset.LFO.enabled) {
		switch (preset.LFO.target) {
			case "FilterFrequency":
				LFO_TARGET = FILTER.frequency
				LFO.connect(FILTER.frequency)
				break
			case "OscAVol":
				LFO_TARGET = SYNTH_A.volume
				LFO.connect(SYNTH_A.volume)
				break
			case "OscBVol":
				LFO_TARGET = SYNTH_B.volume
				LFO.connect(SYNTH_B.volume)
				break
			case "OscCVol":
				LFO_TARGET = SYNTH_C.volume
				LFO.connect(SYNTH_C.volume)
				break
		}
	}
	LFO.set({
		"frequency": lfoGridValues[preset.LFO.grid],
		"min": preset.LFO.min,
		"max": preset.LFO.max,
		"type": shapeValues[preset.LFO.type]
	})
	// FX
	SELECTED_FX = fxSelectValues[preset.FX.type]
	if (preset.FX.enabled) {
		SELECTED_FX.set({
			"wet": preset.FX.mix
		})
	} else {
		SELECTED_FX.set({
			"wet": 0
		})
	}
	setFXParam1(preset.FX.param1)
	setFXParam2(preset.FX.param2)
	setFXParam3(preset.FX.param3)
	setFXParam4(preset.FX.param4)
	// CONNECTIONS
	connectTone()
}

// Function which loads every .ms24preset file in presets folder
// These have to be hardcoded in, because you can't read files from a folder client-side
function loadDefaultPresets(){
	let presetFiles = [
		"init.ms24preset",
		"fm1.ms24preset",
		"fm2.ms24preset",
		"fm3.ms24preset",
		"fm4.ms24preset",
		"fm5.ms24preset",
		"darkfm.ms24preset",
		"aliendrone.ms24preset",
		"angrydrone.ms24preset",
		"buddhabass.ms24preset",
	]

	for(let i = 0; i < presetFiles.length; i++){
		let presetFile = presetFiles[i]
		let presetFileRequest = new XMLHttpRequest()
		presetFileRequest.open("GET", "presets/" + presetFile, false)
		presetFileRequest.send(null)
		let preset = JSON.parse(presetFileRequest.responseText)
		localStorage.setItem("preset-" + (i), JSON.stringify(preset))
	}
}


// Function which checks to see if there are any presets saved in localStorage (named "preset-1", "preset-2", etc.)
// If not, load default presets from presets folder (JSON files)
function checkForPresets(){
	let presets = []
	for(let i = 0; i < localStorage.length; i++){
		let key = localStorage.key(i)
		if(key.includes("preset-")){
			let preset = JSON.parse(localStorage.getItem(key))
			presets.push(preset)
		}
	}
	if(presets.length === 0){
		loadDefaultPresets()
	}
}
checkForPresets()

// Function which populates presets table with presets from localStorage
// Presets are saved as "preset-1", "preset-2", etc.
// Each preset contains name, type, author, rating metadata, and the actual preset data
function populatePresetsTable(){
	let presetsTableBody = document.getElementById("presets_table_body")
	let presetsTableBodyHTML = ""
	for(let i = 0; i < localStorage.length; i++) {
		if (localStorage.key(i).includes("preset-")) {
			let preset = JSON.parse(localStorage.getItem(localStorage.key(i)))
			if(preset.METADATA.type === ""){
				preset.METADATA.type = "?"
			}
			if(preset.METADATA.author === ""){
				preset.METADATA.author = "?"
			}
			if(preset.METADATA.rating === ""){
				preset.METADATA.rating = "?"
			}
			presetsTableBodyHTML += `
	        <tr class="text-left">
	            <td>${preset.METADATA.name}</td>
	            <td>${preset.METADATA.type}</td>
	            <td>${preset.METADATA.author}</td>
	            <td>${preset.METADATA.rating}</td>
	            <td class="text-right">
	                <button class="preset_load_button bg-gray-700 text-gray-300 rounded-lg p-1" id="${localStorage.key(i)}-load-button">
	                Load
	                </button>
	            </td>
	            <td class="text-right">
	                <button class="preset_delete_button bg-gray-700 text-gray-300 rounded-lg p-1" id="${localStorage.key(i)}-delete-button">
	                Delete
	                </button>
	            </td>
	        </tr>
        	`
		}

	}
	presetsTableBody.innerHTML = presetsTableBodyHTML
	let presetLoadButtons = document.getElementsByClassName("preset_load_button")
	let presetDeleteButtons = document.getElementsByClassName("preset_delete_button")

	for(let i = 0; i < presetLoadButtons.length; i++){
		presetLoadButtons[i].addEventListener("click", function(e){
			// from "preset-x-load-button", return "preset-x"
			let presetKey = e.target.id.split("-")[0] + "-" + e.target.id.split("-")[1]
			console.log(presetKey)
			let preset = JSON.parse(localStorage.getItem(presetKey))
			loadPreset(preset)
		})
	}
	for(let i = 0; i < presetDeleteButtons.length; i++){
		presetDeleteButtons[i].addEventListener("click", function(e){
			// from "preset-x-load-button", return "preset-x"
			let presetKey = e.target.id.split("-")[0] + "-" + e.target.id.split("-")[1]
			console.log(presetKey)
			localStorage.removeItem(presetKey)
			populatePresetsTable()
		})
	}
}
populatePresetsTable()

function updateGUI(target, value, readout){
	let jQtarget = "#"+target
	$(jQtarget)[0].value = value;
	if(readout){
		let jQtargetReadout = document.getElementById(target+"_readout")
		jQtargetReadout.value = readout
	}
}
function updateSelectBox(target, value){
	let selectBox = document.getElementById(target)
	selectBox.value = value
}
presetDiskLoadButton.addEventListener("click", function() {
	console.log("This button will load a preset from disk!")
	fileInput.click();
	fileInput.onchange = function(e) {
		let file = e.target.files[0];
		// console.log(file.name.split(".")[1])
		if (!file || file.name.split(".")[1]!=="ms24preset"){
			alert("Please select a valid preset file!")
			return
		}
		let reader = new FileReader();
		reader.onload = function(e) {
			console.log(e)
			console.log("Preset before:", PRESET)
			PRESET = JSON.parse(e.target.result)
			savePreset(PRESET)
			loadPreset(PRESET)
		}
		reader.readAsText(file)
	}
})

// Control events //
for (let i = 0; i < controls.length; i++) {
	// add event listener to each control

	controls[i].addEventListener("change", async function (e) {
		console.log(e.target.id, e.target.value)
		switch (e.target.id) {
			case "osc_a_switch":
				PRESET.OSC_A.enabled = e.target.value
				break;
			case "osc_b_switch":
				PRESET.OSC_B.enabled = e.target.value
				break;
			case "osc_c_switch":
				PRESET.OSC_C.enabled = e.target.value
				break;
			case "filter_switch":
				PRESET.FILTER.enabled = e.target.value
				break;
			case "osc_a_filter_switch":
				PRESET.FILTER.osc_a = e.target.value
				break;
			case "osc_b_filter_switch":
				PRESET.FILTER.osc_b = e.target.value
				break;
			case "osc_c_filter_switch":
				PRESET.FILTER.osc_c = e.target.value
				break;
			case "lfo_switch":
				PRESET.LFO.enabled = e.target.value
				break;
			case "fx_switch":
				PRESET.FX.enabled = e.target.value
				break;
			case "rec_switch":
				// if rec toggled on...
				if (e.target.value === 1) {
					// start recording
					await RECORDER.start()
					// set label to "recording..."
					recorderLabel.innerHTML = "Recording..."
				// if rec toggled off...
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
				break;
		}
		connectTone()
	})
	// using "input" instead of "change" to allow for continuous changes
	controls[i].addEventListener("input", function (e) {
		console.log(e.target.id, e.target.value);
		switch (e.target.id) {
			// -------------- //
			// --- MASTER --- //
			// -------------- //
			case "master_gain":
				PRESET.MASTER.gain = e.target.value
				MASTER_GAIN.set({
					"gain": e.target.value
				})
				break;
			// -------------------- //
			// --- OSCILLATOR A --- //
			// -------------------- //
			case "osc_a_octave":
				PRESET.OSC_A.octave = e.target.value
				// SYNTH_A.releaseAll()
				// SYNTH_B.releaseAll()
				// SYNTH_C.releaseAll()
				// SYNTH_A.triggerAttack("C" + synthOctaves["osc_a_octave"])
				// console.log(synthOctaves)
				// let newKey = "C4"
				// playingKeys[1] = newKey
				// SYNTH_A.set({
				// 	oscillator: {
				// 		modulationFrequency: 'C4'
				// 	}
				// })
				break;
			case "osc_a_semi":
				PRESET.OSC_A.detune = e.target.value
				break;
			case "osc_a_volume":
				PRESET.OSC_A.volume = e.target.value
				SYNTH_A.set({
					"volume": e.target.value
				})
				if (LFO_TARGET === SYNTH_A.volume) {
					PRESET.LFO.max = e.target.value
					LFO.set({"max": e.target.value})
				}
				break;
			case "osc_a_shape":
				PRESET.OSC_A.shape = e.target.value
				SYNTH_A.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_A.shape],
						count: PRESET.OSC_A.count,
						spread: PRESET.OSC_A.spread,
					}
				})
				break;
			case "osc_a_attack":
				PRESET.OSC_A.attack = e.target.value
				SYNTH_A.set({
					"envelope": {
						"attack": e.target.value
					}
				})
				break;
			case "osc_a_decay":
				PRESET.OSC_A.decay = e.target.value
				SYNTH_A.set({
					"envelope": {
						"decay": e.target.value
					}
				})
				break;
			case "osc_a_sustain":
				PRESET.OSC_A.sustain = e.target.value
				SYNTH_A.set({
					"envelope": {
						"sustain": e.target.value
					}
				})
				break;
			case "osc_a_release":
				PRESET.OSC_A.release = e.target.value
				SYNTH_A.set({
					"envelope": {
						"release": e.target.value
					}
				})
				break;
			case "osc_a_voices":
				PRESET.OSC_A.count = e.target.value
				SYNTH_A.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_A.shape],
						count: PRESET.OSC_A.count,
						spread: PRESET.OSC_A.spread,
					}
				})
				break;
			case "osc_a_spread":
				PRESET.OSC_A.spread = e.target.value
				SYNTH_A.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_A.shape],
						count: PRESET.OSC_A.count,
						spread: PRESET.OSC_A.spread,
					}
				})
				break;
			case "osc_a_fm":
				PRESET.OSC_A.harmonicity = e.target.value
				SYNTH_A.set({
					harmonicity: PRESET.OSC_A.harmonicity,
				})
				break;
			case "osc_a_fm_depth":
				PRESET.OSC_A.modulationIndex = e.target.value
				SYNTH_A.set({
					modulationIndex: PRESET.OSC_A.modulationIndex
				})
				break;
			case "osc_a_fm_shape":
				PRESET.OSC_A.modulationShape = e.target.value
				SYNTH_A.set({
					modulation: {
						type: oscillatorShapeValues[PRESET.OSC_A.modulationShape]
					}
				})
				break;
			// -------------------- //
			// --- OSCILLATOR B --- //
			// -------------------- //
			case "osc_b_octave":
				PRESET.OSC_B.octave = e.target.value
				break;
			case "osc_b_semi":
				PRESET.OSC_B.detune = e.target.value
				break;
			case "osc_b_volume":
				PRESET.OSC_B.volume = e.target.value
				SYNTH_B.set({
					"volume": e.target.value
				})
				if (LFO_TARGET === SYNTH_B.volume) {
					PRESET.LFO.max = e.target.value
					LFO.set({"max": e.target.value})
				}
				break;
			case "osc_b_shape":
				PRESET.OSC_B.shape = e.target.value
				SYNTH_B.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_B.shape],
						count: PRESET.OSC_B.count,
						spread: PRESET.OSC_B.spread,
					}
				})
				break;
			case "osc_b_attack":
				PRESET.OSC_B.attack = e.target.value
				SYNTH_B.set({
					"envelope": {
						attack: e.target.value
					}
				})
				break;
			case "osc_b_decay":
				PRESET.OSC_B.decay = e.target.value
				SYNTH_B.set({
					"envelope": {
						decay: e.target.value
					}
				})
				break;
			case "osc_b_sustain":
				PRESET.OSC_B.sustain = e.target.value
				SYNTH_B.set({
					"envelope": {
						sustain: e.target.value
					}
				})
				break;
			case "osc_b_release":
				PRESET.OSC_B.release = e.target.value
				SYNTH_B.set({
					"envelope": {
						release: e.target.value
					}
				})
				break;
			case "osc_b_voices":
				PRESET.OSC_B.count = e.target.value
				SYNTH_B.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_B.shape],
						count: PRESET.OSC_B.count,
						spread: PRESET.OSC_B.spread,
					}
				})
				break;
			case "osc_b_spread":
				PRESET.OSC_B.spread = e.target.value
				SYNTH_B.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_B.shape],
						count: PRESET.OSC_B.count,
						spread: PRESET.OSC_B.spread,
					}
				})
				break;
			case "osc_b_fm":
				PRESET.OSC_B.harmonicity = e.target.value
				SYNTH_B.set({
					harmonicity: PRESET.OSC_B.harmonicity,
				})
				break;
			case "osc_b_fm_depth":
				PRESET.OSC_B.modulationIndex = e.target.value
				SYNTH_B.set({
					modulationIndex: PRESET.OSC_B.modulationIndex
				})
				break;
			case "osc_b_fm_shape":
				PRESET.OSC_B.modulationShape = e.target.value
				SYNTH_B.set({
					modulation: {
						type: oscillatorShapeValues[PRESET.OSC_B.modulationShape]
					}
				})
				break;
			// -------------------- //
			// --- OSCILLATOR C --- //
			// -------------------- //
			case "osc_c_octave":
				PRESET.OSC_C.octave = e.target.value
				break;
			case "osc_c_semi":
				PRESET.OSC_C.detune = e.target.value
				break;
			case "osc_c_volume":
				PRESET.OSC_C.volume = e.target.value
				SYNTH_C.set({
					"volume": e.target.value
				})
				if (LFO_TARGET === SYNTH_C.volume) {
					PRESET.LFO.max = e.target.value
					LFO.set({"max": e.target.value})
				}
				break;
			case "osc_c_shape":
				PRESET.OSC_C.shape = e.target.value
				SYNTH_C.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_C.shape],
						count: PRESET.OSC_C.count,
						spread: PRESET.OSC_C.spread,
					}
				})
				break;
			case "osc_c_attack":
				PRESET.OSC_C.attack = e.target.value
				SYNTH_C.set({
					"envelope": {
						attack: e.target.value
					}
				})
				break;
			case "osc_c_decay":
				PRESET.OSC_C.decay = e.target.value
				SYNTH_C.set({
					"envelope": {
						decay: e.target.value
					}
				})
				break;
			case "osc_c_sustain":
				PRESET.OSC_C.sustain = e.target.value
				SYNTH_C.set({
					"envelope": {
						sustain: e.target.value
					}
				})
				break;
			case "osc_c_release":
				PRESET.OSC_C.release = e.target.value
				SYNTH_C.set({
					"envelope": {
						release: e.target.value
					}
				})
				break;
			case "osc_c_voices":
				PRESET.OSC_C.count = e.target.value
				SYNTH_C.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_C.shape],
						count: PRESET.OSC_C.count,
						spread: PRESET.OSC_C.spread,
					}
				})
				break;
			case "osc_c_spread":
				PRESET.OSC_C.spread = e.target.value
				SYNTH_C.set({
					oscillator: {
						type: oscillatorShapeValues[PRESET.OSC_C.shape],
						count: PRESET.OSC_C.count,
						spread: PRESET.OSC_C.spread,
					}
				})
				break;
			case "osc_c_am":
				PRESET.OSC_C.harmonicity = e.target.value
				SYNTH_C.set({
					harmonicity: PRESET.OSC_C.harmonicity
				})
				break;
			case "osc_c_am_shape":
				PRESET.OSC_C.modulationShape = e.target.value
				SYNTH_C.set({
					modulation: {
						type: oscillatorShapeValues[PRESET.OSC_C.modulationShape]
					}
				})
				break;
			// -------------- //
			// --- FILTER --- //
			// -------------- //
			case "filter_cutoff":
				PRESET.FILTER.cutoff = e.target.value
				FILTER.set({
					frequency: e.target.value
				})
				// have to set LFO value when connected,
				// otherwise filter cutoff doesn't change (O_o)
				if (LFO_TARGET === FILTER.frequency) {
					PRESET.LFO.max = e.target.value
					LFO.set({"max": e.target.value})
				}
				break;
			case "filter_resonance":
				if (PRESET.FILTER.type === 'lowshelf' || PRESET.FILTER.type === 'highshelf') {
					PRESET.FILTER.gain = e.target.value
					FILTER.set({
						gain: e.target.value
					})
				} else {
					PRESET.FILTER.Q = e.target.value
					FILTER.set({
						Q: e.target.value
					})
				}
				break;
			case "filter_rolloff":
				PRESET.FILTER.rolloff = e.target.value
				FILTER.set({
					rolloff: filterRolloffValues[e.target.value]
				})
				break;
			case "filter_type":
				PRESET.FILTER.type = e.target.value
				FILTER.set({
					type: filterTypeValues[e.target.value]
				})
				filterGroupUpdate(e.target.value)
				break;
			// ----------- //
			// --- LFO --- //
			// ----------- //
			case "lfo_selector":
				switch (e.target.value) {
					// TODO: Update knob min/max/default values when switching targets!!
					// TODO: figure out how to disconnect LFO from previous target!
					case "FilterFrequency":
						PRESET.LFO.target = "FilterFrequency"
						LFO_TARGET = FILTER.frequency
						break;
					case "OscAVol":
						PRESET.LFO.target = "OscAVol"
						LFO_TARGET = SYNTH_A.volume
						break;
					case "OscBVol":
						PRESET.LFO.target = "OscBVol"
						LFO_TARGET = SYNTH_B.volume
						break;
					case "OscCVol":
						PRESET.LFO.target = "OscCVol"
						LFO_TARGET = SYNTH_C.volume
						break;
					default:
						console.log("Switch default: Nothing set for this case!")
				}
				connectTone()
				// LFO.connect(LFO_TARGET)
				break;
			case "lfo_grid":
				PRESET.LFO.grid = e.target.value
				LFO.set({
					frequency: lfoGridValues[e.target.value]
				})
				break;
			case "lfo_min":
				PRESET.LFO.min = e.target.value
				LFO.set({
					"min": e.target.value
				})
				break;
			case "lfo_max":
				PRESET.LFO.max = e.target.value
				LFO.set({
					"max": e.target.value
				})
				break;
			case "lfo_shape":
				PRESET.LFO.type = e.target.value
				LFO.set({
					type: shapeValues[e.target.value]
				})
				break;
			// ---------- //
			// --- FX --- //
			// ---------- //
			case "fx_selector":
				// reset all fx wet values to 0 (off)
				resetFX()

				// set Tone & HTML depending on which FX is selected
				fxGroupUpdate(e.target.value)

				// if FX is enabled, reconnect synths
				if (PRESET.FX.enabled) {
					connectSynths()
				}
				break;
			case "fx_param1":
				PRESET.FX.param1 = e.target.value
				setFXParam1(e.target.value)
				break;
			case "fx_param2":
				PRESET.FX.param2 = e.target.value
				setFXParam2(e.target.value)
				break;
			case "fx_param3":
				PRESET.FX.param3 = e.target.value
				setFXParam3(e.target.value)
				break;
			case "fx_param4":
				PRESET.FX.param4 = e.target.value
				PRESET.FX.mix = e.target.value
				setFXParam4(e.target.value)
				break;
			default:
				console.log("Switch default: Nothing set for this case!")
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
let guiKeys = [];

// TODO: Fix sticky keys if keys released after focusout
keyboard.addEventListener("focusout", function (e) {
	console.log("keyboard unfocused!", e);
	console.log("guiKeys: " + guiKeys)
	console.log("heldKeys: " + heldKeys)
	console.log("playingKeys: " + playingKeys)
	// SYNTH_A.releaseAll()
	// SYNTH_B.releaseAll()
	// SYNTH_C.releaseAll()
	// guiKeys.forEach((key) => {
	// 	console.log("releasing key: " + key)
	// 	keyboard.setNote(0, key, 0);
	// })
})

keyboard.addEventListener("change", function (e) {
	// Calculate the notes to play based on the keyboard input and synth settings
	let note_a = getNoteFromNumber(e.note[1], PRESET.OSC_A.detune, octaveValues[PRESET.OSC_A.octave]);
	let note_b = getNoteFromNumber(e.note[1], PRESET.OSC_B.detune, octaveValues[PRESET.OSC_B.octave]);
	let note_c = getNoteFromNumber(e.note[1], PRESET.OSC_C.detune, subOctaveValues[PRESET.OSC_C.octave]);

	// console.log(e.note)

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
		guiKeys.push(e.note[1])
		console.log("guiKeys", guiKeys)
		// if not already in heldKeys array, push it
		if (!heldKeys.includes(note_a+"_OSC_A") || !heldKeys.includes(note_b+"_OSC_B") || !heldKeys.includes(note_c+"_OSC_C")) {
			// LFO.stop()
			heldKeys.push(note_a+"_OSC_A");
			heldKeys.push(note_b+"_OSC_B");
			heldKeys.push(note_c+"_OSC_C");
			// Trigger the attack for the new notes and add them to the playingKeys array

			SYNTH_A.triggerAttack(note_a);
			playingKeys.push(note_a+"_OSC_A");
			console.log("OSC_A Frequency:", SYNTH_A.toFrequency(note_a))

			SYNTH_B.triggerAttack(note_b);
			playingKeys.push(note_b+"_OSC_B");
			console.log("OSC_B Frequency:", SYNTH_B.toFrequency(note_b))

			SYNTH_C.triggerAttack(note_c);
			playingKeys.push(note_c+"_OSC_C");
			console.log("OSC_C Frequency:", SYNTH_C.toFrequency(note_c))

			console.log("playingKeys:", playingKeys)
			console.log("heldKeys:", heldKeys)
			// LFO.start()
		}
		// If note off
	} else {
		guiKeys = guiKeys.filter(item => item !== e.note[1])
		console.log("guiKeys", guiKeys)
		// remove the note from the heldKeys array
		heldKeys = heldKeys.filter(item => item !== note_a+"_OSC_A" && item !== note_b+"_OSC_B" && item !== note_c+"_OSC_C");
		// Trigger the release for the playing notes and remove them from the playingKeys array
		if (playingKeys.includes(note_a+"_OSC_A")) {
			SYNTH_A.triggerRelease(note_a);
			playingKeys = playingKeys.filter(item => item !== note_a+"_OSC_A");
		}
		if (playingKeys.includes(note_b+"_OSC_B")) {
			SYNTH_B.triggerRelease(note_b);
			playingKeys = playingKeys.filter(item => item !== note_b+"_OSC_B");
		}
		if (playingKeys.includes(note_c+"_OSC_C")) {
			SYNTH_C.triggerRelease(note_c);
			playingKeys = playingKeys.filter(item => item !== note_c+"_OSC_C");
		}
		console.log("playingKeys:", playingKeys)
		console.log("heldKeys:", heldKeys)
		if (playingKeys.length === 0) {
			// Stop all playing notes when no keys are held down
			SYNTH_A.releaseAll();
			SYNTH_B.releaseAll();
			SYNTH_C.releaseAll();
			console.log("released all!");
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

// -- P5 SETUP -- //

let oscA, oscB, oscC, filter, lfo, effects

let synthContainer = document.getElementById("synth_container");
let p5_canvas = document.getElementById("p5_canvas");
let canvasWidth, canvasHeight

function getSize(element) {
	let rect = element.getBoundingClientRect();
	let width = rect.width;
	let height = rect.height;
	return { width, height };
}

let osc_a_oscilloscope = document.getElementById("osc_a_canvas_container");
let osc_b_oscilloscope = document.getElementById("osc_b_canvas_container");
let osc_c_oscilloscope = document.getElementById("osc_c_canvas_container");
let oscilloscope_a_pos, oscilloscope_b_pos, oscilloscope_c_pos

function getPositionXY(element) {
	let rect = element.getBoundingClientRect();
	let x = rect.x;
	let y = rect.y;
	console.log(element, x, y)
	return { x, y };
}

window.addEventListener("keypress", function (e) {
	// console.log(e);
	if(e.code === "IntlBackslash"){
		console.log("canvas offset w/h:", synthContainer.offsetWidth, synthContainer.offsetHeight)
		console.log(p5_canvas.offsetWidth, p5_canvas.offsetHeight)
		oscilloscope_a_pos = getPositionXY(osc_a_oscilloscope);
		oscilloscope_b_pos = getPositionXY(osc_b_oscilloscope);
		oscilloscope_c_pos = getPositionXY(osc_c_oscilloscope);
		console.log("osc_a pos:",oscilloscope_a_pos)
		console.log("osc_b pos:",oscilloscope_b_pos)
		console.log("osc_c pos:",oscilloscope_c_pos)
		canvasWidth = getSize(synthContainer).width;
		canvasHeight = getSize(synthContainer).height;
		console.log("canvas width:",canvasWidth)
		console.log("canvas height:",canvasHeight)

	}
})

// let width = synthContainer.offsetWidth;
// let height = synthContainer.offsetHeight;

// TODO: Figure out zoom-out issue with P5 canvas
// TODO: Draw rectangles to enclose the oscilloscopes
// TODO: Reduce height of oscilloscopes // reduce maximum volume control

function p5_sketch(p) {
	p.setup = function () {
		oscilloscope_a_pos = getPositionXY(osc_a_oscilloscope);
		oscilloscope_b_pos = getPositionXY(osc_b_oscilloscope);
		oscilloscope_c_pos = getPositionXY(osc_c_oscilloscope);
		canvasWidth = getSize(synthContainer).width;
		canvasHeight = getSize(synthContainer).height;
		p.createCanvas(canvasWidth, canvasHeight);
	}
	p.windowResized = function () {
		oscilloscope_a_pos = getPositionXY(osc_a_oscilloscope);
		oscilloscope_b_pos = getPositionXY(osc_b_oscilloscope);
		oscilloscope_c_pos = getPositionXY(osc_c_oscilloscope);
		canvasWidth = getSize(synthContainer).width;
		canvasHeight = getSize(synthContainer).height;
		p.resizeCanvas(canvasWidth, canvasHeight);
		p.rectMode("CORNERS")
	}
	p.draw = function () {
		// Redraw background
		p.background('#242424')
		// Reset stroke
		p.strokeWeight(1)
		// Draw oscilloscopes
		if(PRESET.OSC_A.enabled){
			p.drawWaveform(oscA_waveform, 220, 320, 387, 145)
		}
		if(PRESET.OSC_B.enabled){
			p.drawWaveform(oscB_waveform, 220, 320, 1063, 145)
		}
		if(PRESET.OSC_C.enabled){
			p.drawWaveform(oscC_waveform, 220, 320, 387, 405)
		}
		// Set stroke and fill for rectangles
		p.strokeWeight(0)
		// p.fill(0)
		p.fill('#242424')
		// Horizontal rectangles to enclose the oscilloscopes
		p.rect(0, 0, canvasWidth, 242)
		p.rect(0, 374, canvasWidth, 122)
		p.rect(0, 627, canvasWidth, 122)
		p.rect(0, 881, canvasWidth, 168)
		// Vertical rectangles to enclose the oscilloscopes
		p.rect(0, 0, 387, canvasHeight)
		p.rect(608, 0, 455, canvasHeight)
		p.rect(canvasWidth-10, 0, 10, canvasHeight)

	}
	p.drawWaveform = function(wave, w, h, x, y) {
		// Adjust x/y position based on current canvas size
		x = x / synthContainer.offsetWidth * p.width;
		y = y / synthContainer.offsetHeight * p.height;

		// Waveform buffer
		let buffer = wave.getValue(0);

		// Initialise start variable
		let start;

		// Find the first zero crossing
		for (let i = 1; i < buffer.length; i++){
			// if the previous point is negative, and the current point is positive/zero
			// then we've found the zero crossing
			if (buffer[i-1] < 0 && buffer[i] >= 0) {
				// Set the start to the zero crossing
				start = i;
				break
			}
		}

		// Drawing a portion of the waveform, to avoid the initial transient
		// Otherwise we would see the waveform "jump" horizontally to the start of the buffer
		let end = start + buffer.length/2;

		// Set stroke colour to white
		p.stroke(255);

		// Map x/y values and draw waveform
		for (let i = start; i < end; i++){
			let x1 = p.map(i-1, start, end, 0, w)
			let y1 = p.map(buffer[i-1], -1, 1, 0, h)
			let x2 = p.map(i, start, end, 0, w)
			let y2 = p.map(buffer[i], -1, 1, 0, h)
			p.line(x1+x, y1+y, x2+x, y2+y);
		}
	}
}

// -- SCREEN SETUP -- //

let consentContainer = document.getElementById("consent_container");
let consentButton = document.getElementById("context_consent_button");

consentButton.addEventListener("click", function () {
	consentContainer.style.display = "none";
	synthContainer.style.display = "flex";
	if (Tone.context.state !== "running") {
		Tone.context.resume();
	}
	new p5(p5_sketch, "p5_canvas");
})
