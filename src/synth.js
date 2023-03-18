import * as Tone from 'tone'

// -- TONE.JS SETUP -- //

// TODO:
//  1. PRESETS
//  2. A/B FM (Ratio & Depth)
//  3. FILTER ENVELOPE
//  4. LFO SWITCHING
//  5. ARPEGGIATOR
//  6. GLIDE CONTROLS (Portamento)
//  7. VOICE & UNISON CONTROL
//  8. TOOLTIPS / HELP TEXT
//  9. THEME SWITCHING

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
	NAME: "Init",
	MASTER: {
		gain: 0.5
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
		enabled: 1,
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
		frequency: 1000,
		Q: 1,
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
let shapeValues = {
	"0": "fatsine",
	"1": "fattriangle",
	"2": "fatsawtooth",
	"3": "fatsquare",
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
		type: shapeValues[PRESET.OSC_A.shape],
		count: PRESET.OSC_A.count,
		spread: PRESET.OSC_A.spread,
	},
	harmonicity: PRESET.OSC_A.harmonicity,
	modulationIndex: PRESET.OSC_A.modulationIndex,
	modulation: {
		type: shapeValues[PRESET.OSC_A.modulationShape]
	}
})
const SYNTH_B = new Tone.PolySynth(Tone.FMSynth)
SYNTH_B.set({
	oscillator: {
		type: shapeValues[PRESET.OSC_B.shape],
		count: PRESET.OSC_B.count,
		spread: PRESET.OSC_B.spread,
	},
	harmonicity: PRESET.OSC_B.harmonicity,
	modulationIndex: PRESET.OSC_B.modulationIndex,
	modulation: {
		type: shapeValues[PRESET.OSC_B.modulationShape]
	}
})
const SYNTH_C = new Tone.PolySynth(Tone.AMSynth)
SYNTH_C.set({
	oscillator: {
		type: shapeValues[PRESET.OSC_C.shape],
		count: PRESET.OSC_C.count,
		spread: PRESET.OSC_C.spread,
	},
	harmonicity: PRESET.OSC_C.harmonicity,
	modulation: {
		type: shapeValues[PRESET.OSC_C.modulationShape]
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

const LFO = new Tone.LFO(lfoGridValues[PRESET.LFO.grid], 0, LFO_TARGET_VALUE).start()

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

// -- NOTES -- //

const ARP = new Tone.Pattern(function(time, note){
	SYNTH_A.triggerAttackRelease(note, 0.25);
	SYNTH_B.triggerAttackRelease(note, 0.25);
	SYNTH_C.triggerAttackRelease(note, 0.25);
}, ["C4", "D4", "E4", "G4", "A4"]);

let SELECTED_FX = FX_DISTORTION
let LFO_TARGET = FILTER.frequency

// -- INITIAL CONNECTIONS -- //

function connectTone() {
	SYNTH_A.disconnect()
	SYNTH_B.disconnect()
	SYNTH_C.disconnect()
	FILTER.disconnect()
	LFO.stop()
	resetFX()
	switch (true) {
		case PRESET.FILTER.enabled && PRESET.FX.enabled:
			if (PRESET.OSC_A.enabled) {
				SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_B.enabled) {
				SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_C.enabled) {
				SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			SELECTED_FX.set({wet: PRESET.FX.mix})
			break;
		case PRESET.FILTER.enabled && !PRESET.FX.enabled:
			if (PRESET.OSC_A.enabled) {
				SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_B.enabled) {
				SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_C.enabled) {
				SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			SELECTED_FX.set({wet: 0})
			break;
		case !PRESET.FILTER.enabled && PRESET.FX.enabled:
			if (PRESET.OSC_A.enabled) {
				SYNTH_A.chain(SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_B.enabled) {
				SYNTH_B.chain(SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_C.enabled) {
				SYNTH_C.chain(SELECTED_FX, OUTPUT)
			}
			SELECTED_FX.set({wet: PRESET.FX.mix})
			break;
		case !PRESET.FILTER.enabled && !PRESET.FX.enabled:
			if (PRESET.OSC_A.enabled) {
				SYNTH_A.chain(SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_B.enabled) {
				SYNTH_B.chain(SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_C.enabled) {
				SYNTH_C.chain(SELECTED_FX, OUTPUT)
			}
			SELECTED_FX.set({wet: 0})
			break;
		default:
			if (PRESET.OSC_A.enabled) {
				SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_B.enabled) {
				SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			if (PRESET.OSC_C.enabled) {
				SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
			}
			break;
	}

	// FX //
	if(PRESET.FX.enabled) {
		SELECTED_FX.set({
			"wet": PRESET.FX.mix
		})
	} else {
		SELECTED_FX.set({
			"wet": 0
		})
	}

	// Master FX Chain //
	OUTPUT.chain(MASTER_GAIN, MASTER_LIMITER)

	// Modulation //
	if(PRESET.LFO.enabled){
		LFO.connect(LFO_TARGET).start()
	} else {
		// LFO.connect(LFO_TARGET).stop()
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
		updateFilterKnob("filter_resonance", 1, -24, 24, 0.1, PRESET.FILTER.gain.toFixed(1), "Gain")
		// Else if filter type is not lowshelf or highshelf...
	} else {
		// ...change the filter gain knob to Q knob
		updateFilterKnob("filter_resonance", 1, 0, 100, 1, PRESET.FILTER.Q, "Q")
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

function updateFxKnob(target, enable, min, max, step, value, label) {
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
			updateFxKnob(3, 1, 0, 4, 1, 0, "Type")
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

// Button events (dropdowns) //
function toggleDropdown(target) {
	if (target.classList.contains("hidden")) {
		target.classList.remove("hidden")
	} else {
		target.classList.add("hidden")
	}
	if (target === settingsDropdown) {
		settingsDropdownOpen = !settingsDropdownOpen
	}
	if (target === presetsDropdown) {
		presetsDropdownOpen = !presetsDropdownOpen
	}
}

// Dropdown states
let settingsDropdownOpen = 0
let presetsDropdownOpen = 0

// Button elements
let presetsButton = document.getElementById("presets_button")
let presetsDropdown = document.getElementById("presets_dropdown")
let presetSaveButton = document.getElementById("preset_save_button")
let presetNameInput = document.getElementById("preset_name_input")
let presetLoadButton = document.getElementById("preset_load_button")
let fileInput = document.getElementById("file_input")
let settingsButton = document.getElementById("settings_button")
let settingsDropdown = document.getElementById("settings_dropdown")
let settingsThemeButton = document.getElementById("settings_theme_button")
let randomButton = document.getElementById("random_button")

// Button functions
settingsButton.addEventListener("click", function () {
	toggleDropdown(settingsDropdown)
	if(presetsDropdownOpen){
		toggleDropdown(presetsDropdown)
	}
})
presetsButton.addEventListener("click", function () {
	toggleDropdown(presetsDropdown)
	if(settingsDropdownOpen){
		toggleDropdown(settingsDropdown)
	}
})
randomButton.addEventListener("click", function () {
	console.log("This button will return a randomized preset!")
})
settingsThemeButton.addEventListener("click", function () {
	console.log("This button will change the theme!")
	toggleDropdown(settingsDropdown)
})

// Menu item functions
presetSaveButton.addEventListener("click", function() {
	console.log(PRESET)
	const anchor = document.createElement("a");
	anchor.href = URL.createObjectURL(new Blob([JSON.stringify(PRESET, null, 2)], {
		type: "text/plain"
	}));
	anchor.download = "preset.ms24preset";
	anchor.click();
	toggleDropdown(presetsDropdown)
})
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
presetLoadButton.addEventListener("click", function() {
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
			console.log("Preset after:", PRESET)
			// Update GUI //
			// MASTER
			updateGUI("master_gain", PRESET.MASTER.gain, PRESET.MASTER.gain)
			// OSC A
			updateGUI("osc_a_switch", PRESET.OSC_A.enabled)
			updateGUI("osc_a_octave", PRESET.OSC_A.octave, PRESET.OSC_A.octave)
			updateGUI("osc_a_semi", PRESET.OSC_A.detune, PRESET.OSC_A.detune)
			updateGUI("osc_a_volume", PRESET.OSC_A.volume, PRESET.OSC_A.volume)
			updateGUI("osc_a_shape", PRESET.OSC_A.shape, shapeValues[PRESET.OSC_A.shape])
			updateGUI("osc_a_attack", PRESET.OSC_A.attack, PRESET.OSC_A.attack)
			updateGUI("osc_a_decay", PRESET.OSC_A.decay, PRESET.OSC_A.decay)
			updateGUI("osc_a_sustain", PRESET.OSC_A.sustain, PRESET.OSC_A.sustain)
			updateGUI("osc_a_release", PRESET.OSC_A.release, PRESET.OSC_A.release)
			updateGUI("osc_a_voices", PRESET.OSC_A.count, PRESET.OSC_A.count)
			updateGUI("osc_a_spread", PRESET.OSC_A.spread, PRESET.OSC_A.spread)
			updateGUI("osc_a_fm", PRESET.OSC_A.harmonicity, PRESET.OSC_A.harmonicity)
			updateGUI("osc_a_fm_depth", PRESET.OSC_A.modulationIndex, PRESET.OSC_A.modulationIndex)
			updateGUI("osc_a_fm_shape", PRESET.OSC_A.modulationShape, PRESET.OSC_A.modulationShape)
			// OSC B
			updateGUI("osc_b_switch", PRESET.OSC_B.enabled)
			updateGUI("osc_b_octave", PRESET.OSC_B.octave, PRESET.OSC_B.octave)
			updateGUI("osc_b_semi", PRESET.OSC_B.detune, PRESET.OSC_B.detune)
			updateGUI("osc_b_volume", PRESET.OSC_B.volume, PRESET.OSC_B.volume)
			updateGUI("osc_b_shape", PRESET.OSC_B.shape, shapeValues[PRESET.OSC_B.shape])
			updateGUI("osc_b_attack", PRESET.OSC_B.attack, PRESET.OSC_B.attack)
			updateGUI("osc_b_decay", PRESET.OSC_B.decay, PRESET.OSC_B.decay)
			updateGUI("osc_b_sustain", PRESET.OSC_B.sustain, PRESET.OSC_B.sustain)
			updateGUI("osc_b_release", PRESET.OSC_B.release, PRESET.OSC_B.release)
			updateGUI("osc_b_voices", PRESET.OSC_B.count, PRESET.OSC_B.count)
			updateGUI("osc_b_spread", PRESET.OSC_B.spread, PRESET.OSC_B.spread)
			updateGUI("osc_b_fm", PRESET.OSC_B.harmonicity, PRESET.OSC_B.harmonicity)
			updateGUI("osc_b_fm_depth", PRESET.OSC_B.modulationIndex, PRESET.OSC_B.modulationIndex)
			updateGUI("osc_b_fm_shape", PRESET.OSC_B.modulationShape, PRESET.OSC_B.modulationShape)
			// OSC C
			updateGUI("osc_c_switch", PRESET.OSC_C.enabled)
			updateGUI("osc_c_octave", PRESET.OSC_C.octave, PRESET.OSC_C.octave)
			updateGUI("osc_c_semi", PRESET.OSC_C.detune, PRESET.OSC_C.detune)
			updateGUI("osc_c_volume", PRESET.OSC_C.volume, PRESET.OSC_C.volume)
			updateGUI("osc_c_shape", PRESET.OSC_C.shape, shapeValues[PRESET.OSC_C.shape])
			updateGUI("osc_c_attack", PRESET.OSC_C.attack, PRESET.OSC_C.attack)
			updateGUI("osc_c_decay", PRESET.OSC_C.decay, PRESET.OSC_C.decay)
			updateGUI("osc_c_sustain", PRESET.OSC_C.sustain, PRESET.OSC_C.sustain)
			updateGUI("osc_c_release", PRESET.OSC_C.release, PRESET.OSC_C.release)
			updateGUI("osc_c_voices", PRESET.OSC_C.count, PRESET.OSC_C.count)
			updateGUI("osc_c_spread", PRESET.OSC_C.spread, PRESET.OSC_C.spread)
			updateGUI("osc_c_am", PRESET.OSC_C.harmonicity, PRESET.OSC_C.harmonicity)
			updateGUI("osc_c_am_shape", PRESET.OSC_C.modulationShape, PRESET.OSC_C.modulationShape)
			// FILTER
			filterGroupUpdate(PRESET.FILTER.type)
			updateGUI("filter_switch", PRESET.FILTER.enabled)
			updateGUI("filter_cutoff", PRESET.FILTER.frequency, PRESET.FILTER.frequency)
			updateGUI("filter_resonance", PRESET.FILTER.Q, PRESET.FILTER.Q)
			updateGUI("filter_rolloff", PRESET.FILTER.rolloff, filterRolloffValues[PRESET.FILTER.rolloff])
			updateGUI("filter_type", PRESET.FILTER.type, filterTypeReadoutValues[PRESET.FILTER.type])
			updateGUI("osc_a_filter_switch", PRESET.FILTER.osc_a)
			updateGUI("osc_b_filter_switch", PRESET.FILTER.osc_b)
			updateGUI("osc_c_filter_switch", PRESET.FILTER.osc_c)
			// LFO
			updateSelectBox("lfo_selector", PRESET.LFO.target)
			updateGUI("lfo_switch", PRESET.LFO.enabled)
			updateGUI("lfo_grid", PRESET.LFO.grid, lfoGridReadoutValues[PRESET.LFO.grid])
			updateGUI("lfo_min", PRESET.LFO.min, PRESET.LFO.min)
			updateGUI("lfo_max", PRESET.LFO.max, PRESET.LFO.max)
			updateGUI("lfo_shape", PRESET.LFO.shape, shapeValues[PRESET.LFO.shape])
			// FX
			updateSelectBox("fx_selector", PRESET.FX.type)
			fxGroupUpdate(PRESET.FX.type)
			updateGUI("fx_switch", PRESET.FX.enabled)
			updateGUI("fx_param1", PRESET.FX.param1, PRESET.FX.param1)
			updateGUI("fx_param2", PRESET.FX.param2, PRESET.FX.param2)
			updateGUI("fx_param3", PRESET.FX.param3, PRESET.FX.param3)
			updateGUI("fx_param4", PRESET.FX.param4, PRESET.FX.param4)

			// Update Tone.js //
			// OSC A
			SYNTH_A.set({
				"oscillator": {
					"type": shapeValues[PRESET.OSC_A.shape],
					"count": PRESET.OSC_A.count,
					"spread": PRESET.OSC_A.spread,
				},
				"harmonicity": PRESET.OSC_A.harmonicity,
				"modulationIndex": PRESET.OSC_A.modulationIndex,
				"modulation": {
					"type": shapeValues[PRESET.OSC_A.modulationShape]
				},
				"envelope": {
					"attack": PRESET.OSC_A.attack,
					"decay": PRESET.OSC_A.decay,
					"sustain": PRESET.OSC_A.sustain,
					"release": PRESET.OSC_A.release
				},
				"volume": PRESET.OSC_A.volume
			})
			// OSC B
			SYNTH_B.set({
				"oscillator": {
					"type": shapeValues[PRESET.OSC_B.shape],
					"count": PRESET.OSC_B.count,
					"spread": PRESET.OSC_B.spread,
				},
				"harmonicity": PRESET.OSC_B.harmonicity,
				"modulationIndex": PRESET.OSC_B.modulationIndex,
				"modulation": {
					"type": shapeValues[PRESET.OSC_B.modulationShape]
				},
				"envelope": {
					"attack": PRESET.OSC_B.attack,
					"decay": PRESET.OSC_B.decay,
					"sustain": PRESET.OSC_B.sustain,
					"release": PRESET.OSC_B.release
				},
				"volume": PRESET.OSC_B.volume
			})
			// OSC C
			SYNTH_C.set({
				"oscillator": {
					"type": shapeValues[PRESET.OSC_C.shape],
					"count": PRESET.OSC_C.count,
					"spread": PRESET.OSC_C.spread,
				},
				"harmonicity": PRESET.OSC_C.harmonicity,
				"modulation": {
					"type": shapeValues[PRESET.OSC_C.modulationShape]
				},
				"envelope": {
					"attack": PRESET.OSC_C.attack,
					"decay": PRESET.OSC_C.decay,
					"sustain": PRESET.OSC_C.sustain,
					"release": PRESET.OSC_C.release
				},
				"volume": PRESET.OSC_C.volume
			})
			// FILTER
			FILTER.set({
				"type": filterTypeValues[PRESET.FILTER.type],
				"frequency": PRESET.FILTER.frequency,
				"Q": PRESET.FILTER.Q,
				"gain": PRESET.FILTER.gain,
				"rolloff": filterRolloffValues[PRESET.FILTER.rolloff]
			})
			// LFO
			if(PRESET.LFO.enabled) {
				switch (PRESET.LFO.target) {
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
				"frequency": lfoGridValues[PRESET.LFO.grid],
				"min": PRESET.LFO.min,
				"max": PRESET.LFO.max,
				"type": shapeValues[PRESET.LFO.type]
			})
			// FX
			SELECTED_FX = fxSelectValues[PRESET.FX.type]
			if(PRESET.FX.enabled) {
				SELECTED_FX.set({
					"wet": PRESET.FX.mix
				})
			} else {
				SELECTED_FX.set({
					"wet": 0
				})
			}
			setFXParam1(PRESET.FX.param1)
			setFXParam2(PRESET.FX.param2)
			setFXParam3(PRESET.FX.param3)
			setFXParam4(PRESET.FX.param4)
			// CONNECTIONS
			connectTone()
		}
		reader.readAsText(file)
	}
	toggleDropdown(presetsDropdown)
})

// Control events //
for (let i = 0; i < controls.length; i++) {
	// add event listener to each control

	controls[i].addEventListener("change", async function (e) {
		console.log(e.target.id, e.target.value)
		switch (e.target.id) {
			case "osc_a_switch":
				PRESET.OSC_A.enabled = e.target.value
				// if osc_a toggled off...
				if (e.target.value === 0) {
					SYNTH_A.disconnect()
					PRESET.OSC_A.enabled = 0
				// if osc_a toggled on...
				} else {
					// depending on filter and fx settings, connect to the correct nodes
					if (PRESET.FILTER.enabled && PRESET.FX.enabled) {
						SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
					} else {
						if (PRESET.FILTER.enabled && !PRESET.FX.enabled) {
							SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
						} else if (!PRESET.FILTER.enabled && PRESET.FX.enabled) {
							SYNTH_A.chain(SELECTED_FX, OUTPUT)
						} else {
							SYNTH_A.connect(OUTPUT)
						}
					}
					PRESET.OSC_A.enabled = 1
				}
				break;
			case "osc_b_switch":
				PRESET.OSC_B.enabled = e.target.value
				// if osc_b toggled off...
				if (e.target.value === 0) {
					// turn off
					SYNTH_B.disconnect()
					PRESET.OSC_B.enabled = 0
				// if osc_b toggled on...
				} else {
					// depending on filter and fx settings, connect to the correct nodes
					if (PRESET.FILTER.enabled && PRESET.FX.enabled) {
						SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
					} else {
						if (PRESET.FILTER.enabled && !PRESET.FX.enabled) {
							SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
						} else if (!PRESET.FILTER.enabled && PRESET.FX.enabled) {
							SYNTH_B.chain(SELECTED_FX, OUTPUT)
						} else {
							SYNTH_B.connect(OUTPUT)
						}
					}
					PRESET.OSC_B.enabled = 1
				}
				break;
			case "osc_c_switch":
				PRESET.OSC_C.enabled = e.target.value
				// if osc_c toggled on...
				if (e.target.value === 0) {
					// turn off
					SYNTH_C.disconnect()
					PRESET.OSC_C.enabled = 0
				// if osc_c toggled off...
				} else {
					// depending on filter and fx settings, connect to the correct nodes
					if (PRESET.FILTER.enabled && PRESET.FX.enabled) {
						SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
					} else {
						if (PRESET.FILTER.enabled && !PRESET.FX.enabled) {
							SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
						} else if (!PRESET.FILTER.enabled && PRESET.FX.enabled) {
							SYNTH_C.chain(SELECTED_FX, OUTPUT)
						} else {
							SYNTH_C.connect(OUTPUT)
						}
					}
					PRESET.OSC_C.enabled = 1
				}
				break;
			case "filter_switch":
				PRESET.FILTER.enabled = e.target.value
				// if filter toggled off...
				if (e.target.value === 0) {
					if (PRESET.OSC_A.enabled) {
						SYNTH_A.disconnect()
						SYNTH_A.chain(SELECTED_FX, OUTPUT)
					}
					if (PRESET.OSC_B.enabled) {
						SYNTH_B.disconnect()
						SYNTH_B.chain(SELECTED_FX, OUTPUT)
					}
					if (PRESET.OSC_C.enabled) {
						SYNTH_C.disconnect()
						SYNTH_C.chain(SELECTED_FX, OUTPUT)
					}
					// set PRESET.FILTER.enabled to 0
					PRESET.FILTER.enabled = 0
				// if filter toggled on...
				} else {
					if (PRESET.OSC_A.enabled && PRESET.FILTER.osc_a) {
						SYNTH_A.disconnect()
						SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					if (PRESET.OSC_B.enabled && PRESET.FILTER.osc_b) {
						SYNTH_B.disconnect()
						SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					if (PRESET.OSC_C.enabled && PRESET.FILTER.osc_c) {
						SYNTH_C.disconnect()
						SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					// set PRESET.FILTER.enabled to 1
					PRESET.FILTER.enabled = 1
				}
				break;
			case "osc_a_filter_switch":
				PRESET.FILTER.osc_a = e.target.value
				// if osc_a filter toggled off...
				if (e.target.value === 0 && PRESET.OSC_A.enabled) {
					// turn off
					SYNTH_A.disconnect()
					SYNTH_A.chain(SELECTED_FX, OUTPUT)
				} else if (e.target.value === 1 && PRESET.OSC_A.enabled) {
					// turn on
					SYNTH_A.disconnect()
					SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
				}
				break;
			case "osc_b_filter_switch":
				PRESET.FILTER.osc_b = e.target.value
				// if osc_b filter toggled off...
				if (e.target.value === 0 && PRESET.OSC_B.enabled) {
					// turn off
					SYNTH_B.disconnect()
					SYNTH_B.chain(SELECTED_FX, OUTPUT)
				} else if (e.target.value === 1 && PRESET.OSC_B.enabled) {
					// turn on
					SYNTH_B.disconnect()
					SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
				}
				break;
			case "osc_c_filter_switch":
				PRESET.FILTER.osc_c = e.target.value
				// if osc_c filter toggled off...
				if (e.target.value === 0 && PRESET.OSC_C.enabled) {
					// turn off
					SYNTH_C.disconnect()
					SYNTH_C.chain(SELECTED_FX, OUTPUT)
				} else if (e.target.value === 1 && PRESET.OSC_C.enabled) {
					// turn on
					SYNTH_C.disconnect()
					SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
				}
				break;
			case "lfo_switch":
				PRESET.LFO.enabled = e.target.value
				// if lfo toggled off...
				if (e.target.value === 0) {
					LFO.stop()
					// LFO.disconnect(LFO_TARGET)
					PRESET.LFO.enabled = 0
				// if lfo toggled on...
				} else {
					LFO.connect(LFO_TARGET).start()
					PRESET.LFO.enabled = 1
				}
				break;
			case "fx_switch":
				PRESET.FX.enabled = e.target.value
				// if fx toggled off...
				if (e.target.value === 0) {
					// if filter is enabled...
					SELECTED_FX.set({
						"wet": 0
					})
					// set PRESET.FX.enabled to 0
					PRESET.FX.enabled = 0
				// if fx toggled on...
				} else {
					// if filter is enabled...
					SELECTED_FX.set({
						"wet": PRESET.FX.mix
					})
					// set PRESET.FX.enabled to 1
					PRESET.FX.enabled = 1
				}
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
				break;
			case "osc_a_shape":
				PRESET.OSC_A.shape = e.target.value
				SYNTH_A.set({
					oscillator: {
						type: shapeValues[PRESET.OSC_A.shape],
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
						type: shapeValues[PRESET.OSC_A.shape],
						count: PRESET.OSC_A.count,
						spread: PRESET.OSC_A.spread,
					}
				})
				break;
			case "osc_a_spread":
				PRESET.OSC_A.spread = e.target.value
				SYNTH_A.set({
					oscillator: {
						type: shapeValues[PRESET.OSC_A.shape],
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
						type: shapeValues[PRESET.OSC_A.modulationShape]
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
				break;
			case "osc_b_shape":
				PRESET.OSC_B.shape = e.target.value
				SYNTH_B.set({
					oscillator: {
						type: shapeValues[PRESET.OSC_B.shape],
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
						type: shapeValues[PRESET.OSC_B.shape],
						count: PRESET.OSC_B.count,
						spread: PRESET.OSC_B.spread,
					}
				})
				break;
			case "osc_b_spread":
				PRESET.OSC_B.spread = e.target.value
				SYNTH_B.set({
					oscillator: {
						type: shapeValues[PRESET.OSC_B.shape],
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
						type: shapeValues[PRESET.OSC_B.modulationShape]
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
				break;
			case "osc_c_shape":
				PRESET.OSC_C.shape = e.target.value
				SYNTH_C.set({
					oscillator: {
						type: shapeValues[PRESET.OSC_C.shape],
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
						type: shapeValues[PRESET.OSC_C.shape],
						count: PRESET.OSC_C.count,
						spread: PRESET.OSC_C.spread,
					}
				})
				break;
			case "osc_c_spread":
				PRESET.OSC_C.spread = e.target.value
				SYNTH_C.set({
					oscillator: {
						type: shapeValues[PRESET.OSC_C.shape],
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
						type: shapeValues[PRESET.OSC_C.modulationShape]
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
					PRESET.FILTER.gain = e.target.value
				} else {
					PRESET.FILTER.Q = e.target.value
					FILTER.set({
						Q: e.target.value
					})
					PRESET.FILTER.Q = e.target.value
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
				// TODO: figure out how to disconnect LFO from previous target
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
				PRESET.LFO.shape = e.target.value
				LFO.set({
					type: shapeValues[e.target.value]
				})
				break;
			// ---------- //
			// --- FX --- //
			// ---------- //
			case "fx_selector":
				let PREVIOUS_FX = SELECTED_FX

				// reset all fx wet values to 0 (off)
				resetFX()

				// set Tone & HTML depending on which FX is selected
				fxGroupUpdate(e.target.value)

				if (PRESET.FX.enabled) {
					// set selected FX wet value to PRESET.FX.mix
					SELECTED_FX.set({wet: PRESET.FX.mix})
					// log selected

					// console.log("Removing previous FX: " + PREVIOUS_FX + "...")
					// disconnect previous FX from output chain
					SYNTH_A.disconnect()
					SYNTH_B.disconnect()
					SYNTH_C.disconnect()
					FILTER.disconnect()

					// console.log("Setting FX to " + SELECTED_FX + "...")
					// set output chain to filter -> selected FX -> master gain
					if (PRESET.OSC_A.enabled) {
						SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					if (PRESET.OSC_B.enabled) {
						SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					if (PRESET.OSC_C.enabled) {
						SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
					}
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


// while(heldKeys.length > 0) {
// 	console.log("Keys held!")
// 	console.log(heldKeys.length)
// }

// TODO: Fix bug where if more than one oscillator share the same octave/detune,
//  playing keys in rapid succession will cause weird overlaying notes

keyboard.addEventListener("change", function (e) {
	// Calculate the notes to play based on the keyboard input and synth settings
	let note_a = getNoteFromNumber(e.note[1], PRESET.OSC_A.detune, octaveValues[PRESET.OSC_A.octave]);
	let note_b = getNoteFromNumber(e.note[1], PRESET.OSC_B.detune, octaveValues[PRESET.OSC_B.octave]);
	let note_c = getNoteFromNumber(e.note[1], PRESET.OSC_C.detune, subOctaveValues[PRESET.OSC_C.octave]);

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
