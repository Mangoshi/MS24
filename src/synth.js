import * as Tone from 'tone'
import {MediaRecorder, register} from "extendable-media-recorder";
import {connect} from 'extendable-media-recorder-wav-encoder'
import BrowserDetector from 'browser-dtector';

// Browser Detection
const browserInfo = new BrowserDetector(window.navigator.userAgent);
const browserName = browserInfo.getBrowserInfo().name;
console.log("Browser:", browserName)

// Media Encoder WAV plugin registration
await register(await connect())
	.then(() => {console.log("MediaRecorder WAV encoder registered")})
	.catch((err) => {console.error(err)})

// TODO:
//  1. SMART PRESET RANDOMIZATION
//  2. PHRASE RECORDER? (Arpeggiator Latch / Pattern Mode)
//  3. EXTRA LFO MODULATION TARGETS
//  4. DISPLAY REVERB LOAD (If possible)

// TODO: BONUS SYNTH FEATURES
//  - Glide (Figure out why it's not working)
//  - Partials control (Will require strange dynamic controls for each partial)
//  - FX Buses (Will require using Tone.Channel: send generators to bus and receive on FX)
//  - Noise Generators (Will require using Tone.Noise instead of synths)

// -- TONE.JS SETUP -- //

// Start Tone.js Transport (so that the arpeggiator works)
Tone.Transport.start()

// -- SYNTH (INITIAL STATE) -- //

let SYNTH = {
	STATE: {
		enabled: false,
		visualisationsEnabled: true,
		settingsDropdownOpen: false,
		presetsPageOpen: false,
		physicalKeyboardActive: true,
		isPlaying: false,
		keysHeld: 0,
		lastKeyDownEvents: [],
		playingFrequencies: [],
		arp_A_frequencies: [],
		arp_B_frequencies: [],
		arp_C_frequencies: []
	},
	THEME: {
		current: "dark",
		pageBackgroundColour: "#000",
		synthBackgroundColour: "#242424",
		synthTextColour: "#FFFFFF",
	}
}

// -- PRESET (INITIAL DATA) -- //

let PRESET = {
	METADATA: {
		name: "Init",
		type: "Default",
		author: "MangoSynth",
		rating: 0,
	},
	MASTER: {
		gain: 1,
		octaveOffset: 0,
		bpm: 120,
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
	},
	ARP: {
		A_enabled: 0,
		B_enabled: 0,
		C_enabled: 0,
		pattern: "up",
		playbackRate: 2,
	}
}

// TODO: Add each FX type to the PRESET object

// -- MIN/MAX DATA (to be used for randomization) -- //
// TODO: Reference Tone.js documentation to ensure correct min/max values
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
	"-3": 2,
	"-2": 3,
	"-1": 4,
	"0": 5,
	"1": 6,
	"2": 7,
	"3": 8,
}
let subOctaveValues = {
	"0": 3,
	"1": 4,
	"2": 5,
	"3": 6,
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
let arpPatternValues = {
	"0": "up",
	"1": "down",
	"2": "upDown",
	"3": "downUp",
	"4": "alternateUp",
	"5": "alternateDown",
	"6": "random",
	"7": "randomOnce",
	"8": "randomWalk",
}
let arpSpeedValues = {
	"0": 0.25,
	"1": 0.5,
	"2": 1,
	"3": 2,
	"4": 4,
	"5": 8,
	"6": 16,
}
let arpSpeedReadoutValues = {
	"0": "1/1",
	"1": "1/2",
	"2": "1/4",
	"3": "1/8",
	"4": "1/16",
	"5": "1/32",
	"6": "1/64",
}
let masterOctaveReadoutValues = {
	"0": "-2",
	"1": "-1",
	"2": "0",
	"3": "1",
	"4": "2",
}

// -- MASTER -- //

const OUTPUT = Tone.getDestination()
const MASTER_GAIN = new Tone.Gain(PRESET.MASTER.gain)
const MASTER_LIMITER = new Tone.Limiter(-10)

// -- RECORD -- //

const REC_DEST = Tone.context.createMediaStreamDestination()
let REC = new MediaRecorder(REC_DEST.stream, {mimeType: 'audio/wav'});
let CHUNKS = [];
let recorderLabel = document.getElementById("rec_label")
console.log("WAV supported?", MediaRecorder.isTypeSupported('audio/wav'))

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
	},
	volume: PRESET.OSC_A.volume
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
	},
	volume: PRESET.OSC_B.volume
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
	},
	volume: PRESET.OSC_C.volume + 6,
})

// SYNTH_A.debug = true
// SYNTH_B.debug = true
// SYNTH_C.debug = true

// -- FILTER -- //

// TODO: Fix shelf filters & strange behavior
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

// -- ARPEGGIATORS -- //

const ARP_A = new Tone.Pattern(function(time, note){
	SYNTH_A.triggerAttackRelease(note, "16n", time);
}, SYNTH.STATE.arp_A_frequencies, PRESET.ARP.pattern).set({playbackRate: PRESET.ARP.playbackRate,})

const ARP_B = new Tone.Pattern(function(time, note){
	SYNTH_B.triggerAttackRelease(note, "16n", time);
}, SYNTH.STATE.arp_B_frequencies, PRESET.ARP.pattern).set({playbackRate: PRESET.ARP.playbackRate,})

const ARP_C = new Tone.Pattern(function(time, note){
	SYNTH_C.triggerAttackRelease(note, "16n", time);
}, SYNTH.STATE.arp_C_frequencies, PRESET.ARP.pattern).set({playbackRate: PRESET.ARP.playbackRate,})

// -- WAVEFORMS -- //

let oscA_waveform = new Tone.Waveform().set({size: 2048})
let oscA_waveform_gain = new Tone.Gain(1)

let oscB_waveform = new Tone.Waveform().set({size: 2048})
let oscB_waveform_gain = new Tone.Gain(1)

let oscC_waveform = new Tone.Waveform().set({size: 2048})
let oscC_waveform_gain = new Tone.Gain(1)

let lfo_waveform = new Tone.Waveform().set({size: 16384})
let lfo_scale = new Tone.Scale(-0.0001, 0.0001)
let lfo_waveform_gain = new Tone.Gain(1)

let master_waveform = new Tone.Waveform().set({size: 2048})
let master_waveform_gain = new Tone.Gain(0.5)

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
		SYNTH_A.chain(oscA_waveform_gain, oscA_waveform)
	}
	if(PRESET.OSC_B.enabled){
		if(PRESET.FILTER.enabled && PRESET.FILTER.osc_b){
			SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
		} else {
			SYNTH_B.chain(SELECTED_FX, OUTPUT)
		}
		SYNTH_B.chain(oscB_waveform_gain, oscB_waveform)
	}
	if(PRESET.OSC_C.enabled){
		if(PRESET.FILTER.enabled && PRESET.FILTER.osc_c){
			SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
		} else {
			SYNTH_C.chain(SELECTED_FX, OUTPUT)
		}
		SYNTH_C.chain(oscC_waveform_gain, oscC_waveform)
	}
}

function connectTone() {
	// Disconnect Synths
	SYNTH_A.disconnect()
	SYNTH_B.disconnect()
	SYNTH_C.disconnect()
	// Disconnect Filter
	FILTER.disconnect()
	// Stop LFO
	LFO.stop()
	// Reset all FX
	resetFX()

	// Set enabled FX
	if(PRESET.FX.enabled) {
		SELECTED_FX.set({
			"wet": PRESET.FX.mix
		})
	}

	// Reconnect Synths
	connectSynths()

	// Reconnect Master FX chain //
	OUTPUT.chain(MASTER_GAIN, MASTER_LIMITER)

	// Reconnect LFO if enabled
	if(PRESET.LFO.enabled){
		LFO.connect(LFO_TARGET).start()
		// LFO -> Scale Values -> Amplify Values -> To Waveform
		LFO.chain(lfo_scale, lfo_waveform_gain, lfo_waveform)
	}

	// Connect master waveform
	OUTPUT.connect(master_waveform_gain)
	master_waveform_gain.connect(master_waveform)

	// Reconnect Master Record
	OUTPUT.connect(REC_DEST)
}
// Make initial connection
connectTone()

// -- GUI CONTROLS -- //

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
	// TODO: Fix bugs!!!
	// If filter type is lowshelf or highshelf...
	if (target === 5 || target === 6) {
		// ...change the filter resonance knob to gain knob
		updateFilterKnob("filter_resonance", 1, 0, 24, 0.1, PRESET.FILTER.gain.toFixed(1), "Gain")
		tooltips["webaudio-knob"].filter_resonance = dynamicTooltips.FilterGain
	} else {
		// ...change the filter gain knob to resonace knob
		updateFilterKnob("filter_resonance", 1, 1, 10, 0.1, PRESET.FILTER.Q, "Q")
		tooltips["webaudio-knob"].filter_resonance = dynamicTooltips.FilterResonance
	}
}

let fxParam1Readout = document.getElementById("fx_param1_readout")
let fxParam1Label = document.getElementById("fx_param1_label")
let fxParam1Group = document.getElementById("fx_param1_group")

let fxParam2Readout = document.getElementById("fx_param2_readout")
let fxParam2Label = document.getElementById("fx_param2_label")
let fxParam2Group = document.getElementById("fx_param2_group")

let fxParam3Readout = document.getElementById("fx_param3_readout")
let fxParam3Label = document.getElementById("fx_param3_label")
let fxParam3Group = document.getElementById("fx_param3_group")

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
	// TODO: Start using MIN_MAX values instead of hardcoding them
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

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Distortion"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Distortion"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["Distortion"]["fx_param3"]
			break;
		case "Chebyshev":
			PRESET.FX.type = "Chebyshev"
			SELECTED_FX = FX_CHEBYSHEV

			updateFxKnob(1, 1, 1, 100, 1, 0, "Order")
			updateFxKnob(2, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(3, 0)
			updateFxKnob(4, 0)

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Chebyshev"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Chebyshev"]["fx_param2"]
			break;
		case "Phaser":
			PRESET.FX.type = "Phaser"
			SELECTED_FX = FX_PHASER

			updateFxKnob(1, 1, 0, 20, 0.01, 0.1, "Frequency")
			updateFxKnob(2, 1, 0, 12, 0.1, 2, "Octaves")
			updateFxKnob(3, 1, 0, 100, 0.1, 1, "Q")
			updateFxKnob(4, 1, 0, 1, 0.1, 1, "Mix")

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Phaser"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Phaser"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["Phaser"]["fx_param3"]
			tooltips["webaudio-knob"].fx_param4 = dynamicTooltips["Phaser"]["fx_param4"]
			break;
		case "Tremolo":
			PRESET.FX.type = "Tremolo"
			SELECTED_FX = FX_TREMOLO

			updateFxKnob(1, 1, 0, 64, 0.1, 0, "Frequency")
			updateFxKnob(2, 1, 0, 1, 0.01, 0, "Depth")
			updateFxKnob(3, 1, 0, 180, 1, 0, "Spread")
			updateFxKnob(4, 1, 0, 1, 0.1, 0.5, "Mix")

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Tremolo"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Tremolo"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["Tremolo"]["fx_param3"]
			tooltips["webaudio-knob"].fx_param4 = dynamicTooltips["Tremolo"]["fx_param4"]
			break;
		case "Vibrato":
			PRESET.FX.type = "Vibrato"
			SELECTED_FX = FX_VIBRATO

			updateFxKnob(1, 1, 0, 1200, 1, 0, "Frequency")
			updateFxKnob(2, 1, 0, 1, 0.01, 0, "Depth")
			updateFxKnob(3, 1, 0, 3, 1, 0, "Type", "['sine','triangle','sawtooth','square'][x]")
			updateFxKnob(4, 1, 0, 1, 0.1, 0.5, "Mix")

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Vibrato"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Vibrato"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["Vibrato"]["fx_param3"]
			tooltips["webaudio-knob"].fx_param4 = dynamicTooltips["Vibrato"]["fx_param4"]
			break;
		case "Delay":
			PRESET.FX.type = "Delay"
			SELECTED_FX = FX_DELAY

			updateFxKnob(1, 1, 0, 1, 0.01, 0, "Time")
			updateFxKnob(2, 1, 0, 1, 0.01, 0.5, "Feedback")
			updateFxKnob(3, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(4, 0)

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Delay"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Delay"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["Delay"]["fx_param3"]
			break;
		case "Reverb":
			PRESET.FX.type = "Reverb"
			SELECTED_FX = FX_REVERB

			updateFxKnob(1, 1, 0, 100, 1, 10, "Decay")
			updateFxKnob(2, 1, 0, 5, 0.1, 0, "PreDelay")
			updateFxKnob(3, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(4, 0)

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["Reverb"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["Reverb"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["Reverb"]["fx_param3"]
			break;
		case "PitchShift":
			PRESET.FX.type = "PitchShift"
			SELECTED_FX = FX_PITCHSHIFT

			updateFxKnob(1, 1, -120, 120, 0.1, 0, "Pitch")
			updateFxKnob(2, 1, 0.01, 12, 0.01, 0.03, "Size")
			updateFxKnob(3, 1, 0, 1, 0.01, 0.5, "Feedback")
			updateFxKnob(4, 1, 0, 1, 0.1, 0.5, "Mix")

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["PitchShift"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["PitchShift"]["fx_param2"]
			tooltips["webaudio-knob"].fx_param3 = dynamicTooltips["PitchShift"]["fx_param3"]
			tooltips["webaudio-knob"].fx_param4 = dynamicTooltips["PitchShift"]["fx_param4"]
			break;
		case "FreqShift":
			PRESET.FX.type = "FreqShift"
			SELECTED_FX = FX_FREQSHIFT

			updateFxKnob(1, 1, 0, 1000, 0.1, 0, "Frequency")
			updateFxKnob(2, 1, 0, 1, 0.1, 0.5, "Mix")
			updateFxKnob(3, 0)
			updateFxKnob(4, 0)

			tooltips["webaudio-knob"].fx_param1 = dynamicTooltips["FreqShift"]["fx_param1"]
			tooltips["webaudio-knob"].fx_param2 = dynamicTooltips["FreqShift"]["fx_param2"]
			break;
		default:
			console.log("Switch default: Nothing set for this case!")
	}
}

// -- TOP ROW STUFF -- //

// Top-row elements //
let synthBody = document.getElementById("synth_body")
let topRowContainer = document.getElementById("top_row_container")
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
let settingsHomeButton = document.getElementById("settings_home_button")
let settingsThemeButton = document.getElementById("settings_theme_button")
let settingsVisualisationsButton = document.getElementById("settings_visualisations_button")
let randomButton = document.getElementById("random_preset_button")

// Functions for top-row buttons
function toggleDropdown(target) {
	if (target.classList.contains("hidden")) {
		target.classList.remove("hidden")
	} else {
		target.classList.add("hidden")
	}
	if (target === settingsDropdown) {
		SYNTH.STATE.settingsDropdownOpen = !SYNTH.STATE.settingsDropdownOpen
	}
}
function togglePresetsPage() {
	// Release all keys
	SYNTH_A.releaseAll()
	SYNTH_B.releaseAll()
	SYNTH_C.releaseAll()
	if (!SYNTH.STATE.presetsPageOpen) {
		// hide synthBody and p5_canvas
		synthBody.classList.add("hidden")
		p5_canvas.classList.add("hidden");
		// show presetsContainer
		presetsContainer.classList.remove("hidden")
		// change topRowContainer border styling
		topRowContainer.classList.add("rounded-br-none", "rounded-bl-none")
		// disable keyboard
		SYNTH.STATE.physicalKeyboardActive = false
	} else {
		// show synthBody and p5_canvas
		synthBody.classList.remove("hidden")
		p5_canvas.classList.remove("hidden");
		// hide presetsContainer
		presetsContainer.classList.add("hidden")
		// undo topRowContainer border styling
		topRowContainer.classList.remove("rounded-br-none", "rounded-bl-none")
		// enable keyboard
		SYNTH.STATE.physicalKeyboardActive = true
	}
	SYNTH.STATE.presetsPageOpen = !SYNTH.STATE.presetsPageOpen
}

// Event listeners for top-row buttons
settingsButton.addEventListener("click", function () {
	toggleDropdown(settingsDropdown)
})
presetsButton.addEventListener("click", function () {
	togglePresetsPage()
	if(SYNTH.STATE.settingsDropdownOpen){
		toggleDropdown(settingsDropdown)
	}
})
randomButton.addEventListener("click", function () {
	console.log("This button will return a randomized preset!")
})

// Function which loops through all elements on the page, goes through each classList, and changes the colours
function updateHtmlClasses(targetClass, newClass) {
	let targetElements = document.getElementsByClassName(targetClass)
	console.log(targetElements.length + " elements found with class '" + targetClass + "'" + "\nChanging to '" + newClass + "'")
	while(targetElements.length > 0) {
		targetElements.item(0).classList.add(newClass)
		targetElements[0].classList.remove(targetClass)
	}
}

// Event listeners for settings dropdown
settingsHomeButton.addEventListener("click", function () {
	SYNTH.STATE.enabled = false;
	consentContainer.style.display = "flex";
	synthContainer.style.display = "none";
	bodyContainer.style.paddingTop = "0rem";
	document.body.style.backgroundColor = SYNTH.THEME.synthBackgroundColour;
	p5_canvas.classList.add("hidden");
	if(SYNTH.STATE.settingsDropdownOpen){
		toggleDropdown(settingsDropdown)
	}
})
function toggleTheme() {
	if (SYNTH.THEME.current === "dark") {
		console.log("Changing theme from " + SYNTH.THEME.current + " to light")
		// Set theme to light
		SYNTH.THEME.current = "light"
		// Update page colours
		updatePageColours("#555", "#999", "#000", "light")
		updateControlColours("masterControl", "#000", "#FFFFFF", "#FFFFFF")
		updateControlColours("toggleControl", "#A9DC76", "#2C292D", "#D9D9D9")
		updateControlColours("subControl", "#000", "#FFFFFF", "#FFFFFF")
		updateControlColours("mainControl1", "#000", "#FF6188", "#FFFFFF")
		updateControlColours("mainControl2", "#000", "#A9DC76", "#FFFFFF")
		updateControlColours("mainControl3", "#000", "#FFD866", "#FFFFFF")
		updateControlColours("mainControl4", "#000", "#78DCE8", "#FFFFFF")
		updateControlColours("adsrControl", "#000", "#AB9DF2", "#FFFFFF")
		updateControlColours("arpControl", "#000", "#AB9DF2", "#FFFFFF")
		updateParamColours("#000", "#ccc")
		// Replace classes
		// updateHtmlClasses("bg-gray-700", "bg-pink-500")
		// updateHtmlClasses("hover:bg-gray-600", "hover:bg-pink-800")
		updateHtmlClasses("border-gray-500", "border-gray-100")
		updateHtmlClasses("border-gray-600", "border-gray-200")
		updateHtmlClasses("border-gray-700", "border-gray-300")
		updateHtmlClasses("bg-stone-900", "bg-custom-white")
		updateHtmlClasses("hover:bg-stone-600", "hover:bg-custom-white")
		updateHtmlClasses("text-gray-300", "text-black")
		updateHtmlClasses("bg-custom-black", "bg-custom-gray")
		updateHtmlClasses("border-blue-400", "bg-blue-400")
		updateHtmlClasses("border-red-400", "bg-red-400")
		updateHtmlClasses("border-green-400", "bg-green-400")
		// Set localStorage
		localStorage.setItem("ms24_opposite_theme", "dark")
	} else {
		console.log("Changing theme from " + SYNTH.THEME.current + " to dark")
		// Set theme to dark
		SYNTH.THEME.current = "dark"
		// Update page colours
		updatePageColours("#111", "#242424", "#fff", "dark")
		updateControlColours("masterControl", "#FFFFFF", "#2C292D", "#D9D9D9")
		updateControlColours("toggleControl", "#A9DC76", "#2C292D", "#D9D9D9")
		updateControlColours("subControl", "#FFFFFF", "#2C292D", "#D9D9D9")
		updateControlColours("mainControl1", "#FF6188", "#2C292D", "#D9D9D9")
		updateControlColours("mainControl2", "#A9DC76", "#2C292D", "#D9D9D9")
		updateControlColours("mainControl3", "#FFD866", "#2C292D", "#D9D9D9")
		updateControlColours("mainControl4", "#78DCE8", "#2C292D", "#D9D9D9")
		updateControlColours("adsrControl", "#AB9DF2", "#2C292D", "#D9D9D9")
		updateControlColours("arpControl", "#AB9DF2", "#2C292D", "#D9D9D9")
		updateParamColours("#FFF", "#000")
		// Replace classes
		// updateHtmlClasses("bg-gray-50", "bg-gray-700")
		updateHtmlClasses("border-gray-100", "border-gray-500")
		updateHtmlClasses("border-gray-200", "border-gray-600")
		updateHtmlClasses("border-gray-300", "border-gray-700")
		updateHtmlClasses("bg-custom-white", "bg-stone-900")
		updateHtmlClasses("hover:bg-custom-white", "hover:bg-stone-600")
		updateHtmlClasses("text-black", "text-gray-300")
		updateHtmlClasses("bg-custom-gray", "bg-custom-black")
		updateHtmlClasses("bg-blue-400", "border-blue-400")
		updateHtmlClasses("bg-red-400", "border-red-400")
		updateHtmlClasses("bg-green-400", "border-green-400")
		// Set localStorage
		localStorage.setItem("ms24_opposite_theme", "light")
	}
}
settingsThemeButton.addEventListener("click", function () {
	toggleTheme()
})
settingsVisualisationsButton.addEventListener("click", function () {
if (SYNTH.STATE.visualisationsEnabled) {
		SYNTH.STATE.visualisationsEnabled = false
		settingsVisualisationsButton.innerHTML = "Enable Visualisations"
		toggleDropdown(settingsDropdown)
	} else {
		SYNTH.STATE.visualisationsEnabled = true
		settingsVisualisationsButton.innerHTML = "Disable Visualisations"
		toggleDropdown(settingsDropdown)
	}
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
	console.log("Preset loaded:", PRESET.METADATA.name)
	// Close presets page if open
	if(SYNTH.STATE.presetsPageOpen) {
		togglePresetsPage()
	}
	// Set input fields
	presetNameInput.value = PRESET.METADATA.name
	presetTypeInput.value = PRESET.METADATA.type
	presetAuthorInput.value = PRESET.METADATA.author
	presetRatingInput.value = PRESET.METADATA.rating
	// Update GUI //
	// MASTER
	updateGUI("master_gain", PRESET.MASTER.gain, PRESET.MASTER.gain)
	updateGUI("master_bpm", PRESET.MASTER.bpm, PRESET.MASTER.bpm)
	// OSC A
	updateGUI("osc_a_switch", PRESET.OSC_A.enabled)
	updateGUI("osc_a_octave", PRESET.OSC_A.octave, PRESET.OSC_A.octave)
	updateGUI("osc_a_semi", PRESET.OSC_A.detune, PRESET.OSC_A.detune)
	updateGUI("osc_a_volume", PRESET.OSC_A.volume, PRESET.OSC_A.volume)
	updateGUI("osc_a_shape", PRESET.OSC_A.shape, shapeReadoutValues[PRESET.OSC_A.shape])
	updateGUI("osc_a_attack", PRESET.OSC_A.attack, PRESET.OSC_A.attack)
	updateGUI("osc_a_decay", PRESET.OSC_A.decay, PRESET.OSC_A.decay)
	updateGUI("osc_a_sustain", PRESET.OSC_A.sustain, PRESET.OSC_A.sustain)
	updateGUI("osc_a_release", PRESET.OSC_A.release, PRESET.OSC_A.release)
	updateGUI("osc_a_voices", PRESET.OSC_A.count, PRESET.OSC_A.count)
	updateGUI("osc_a_spread", PRESET.OSC_A.spread, PRESET.OSC_A.spread)
	updateGUI("osc_a_fm", PRESET.OSC_A.harmonicity, PRESET.OSC_A.harmonicity)
	updateGUI("osc_a_fm_depth", PRESET.OSC_A.modulationIndex, PRESET.OSC_A.modulationIndex)
	updateGUI("osc_a_fm_shape", PRESET.OSC_A.modulationShape, smallShapeReadoutValues[PRESET.OSC_A.modulationShape])
	// OSC B
	updateGUI("osc_b_switch", PRESET.OSC_B.enabled)
	updateGUI("osc_b_octave", PRESET.OSC_B.octave, PRESET.OSC_B.octave)
	updateGUI("osc_b_semi", PRESET.OSC_B.detune, PRESET.OSC_B.detune)
	updateGUI("osc_b_volume", PRESET.OSC_B.volume, PRESET.OSC_B.volume)
	updateGUI("osc_b_shape", PRESET.OSC_B.shape, shapeReadoutValues[PRESET.OSC_B.shape])
	updateGUI("osc_b_attack", PRESET.OSC_B.attack, PRESET.OSC_B.attack)
	updateGUI("osc_b_decay", PRESET.OSC_B.decay, PRESET.OSC_B.decay)
	updateGUI("osc_b_sustain", PRESET.OSC_B.sustain, PRESET.OSC_B.sustain)
	updateGUI("osc_b_release", PRESET.OSC_B.release, PRESET.OSC_B.release)
	updateGUI("osc_b_voices", PRESET.OSC_B.count, PRESET.OSC_B.count)
	updateGUI("osc_b_spread", PRESET.OSC_B.spread, PRESET.OSC_B.spread)
	updateGUI("osc_b_fm", PRESET.OSC_B.harmonicity, PRESET.OSC_B.harmonicity)
	updateGUI("osc_b_fm_depth", PRESET.OSC_B.modulationIndex, PRESET.OSC_B.modulationIndex)
	updateGUI("osc_b_fm_shape", PRESET.OSC_B.modulationShape, smallShapeReadoutValues[PRESET.OSC_B.modulationShape])
	// OSC C
	updateGUI("osc_c_switch", PRESET.OSC_C.enabled)
	updateGUI("osc_c_octave", PRESET.OSC_C.octave, PRESET.OSC_C.octave)
	updateGUI("osc_c_semi", PRESET.OSC_C.detune, PRESET.OSC_C.detune)
	updateGUI("osc_c_volume", PRESET.OSC_C.volume, PRESET.OSC_C.volume)
	updateGUI("osc_c_shape", PRESET.OSC_C.shape, shapeReadoutValues[PRESET.OSC_C.shape])
	updateGUI("osc_c_attack", PRESET.OSC_C.attack, PRESET.OSC_C.attack)
	updateGUI("osc_c_decay", PRESET.OSC_C.decay, PRESET.OSC_C.decay)
	updateGUI("osc_c_sustain", PRESET.OSC_C.sustain, PRESET.OSC_C.sustain)
	updateGUI("osc_c_release", PRESET.OSC_C.release, PRESET.OSC_C.release)
	updateGUI("osc_c_voices", PRESET.OSC_C.count, PRESET.OSC_C.count)
	updateGUI("osc_c_spread", PRESET.OSC_C.spread, PRESET.OSC_C.spread)
	updateGUI("osc_c_am", PRESET.OSC_C.harmonicity, PRESET.OSC_C.harmonicity)
	updateGUI("osc_c_am_shape", PRESET.OSC_C.modulationShape, smallShapeReadoutValues[PRESET.OSC_C.modulationShape])
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
	updateGUI("lfo_rate", PRESET.LFO.grid, lfoGridReadoutValues[PRESET.LFO.grid])
	updateGUI("lfo_min", PRESET.LFO.min, PRESET.LFO.min)
	updateGUI("lfo_max", PRESET.LFO.max, PRESET.LFO.max)
	updateGUI("lfo_shape", PRESET.LFO.type, shapeValues[PRESET.LFO.type])
	// FX
	updateSelectBox("fx_selector", PRESET.FX.type)
	fxGroupUpdate(PRESET.FX.type)
	updateGUI("fx_switch", PRESET.FX.enabled)
	updateGUI("fx_param1", PRESET.FX.param1, PRESET.FX.param1)
	updateGUI("fx_param2", PRESET.FX.param2, PRESET.FX.param2)
	updateGUI("fx_param3", PRESET.FX.param3, PRESET.FX.param3)
	updateGUI("fx_param4", PRESET.FX.param4, PRESET.FX.param4)
	// ARP & NOTES
	updateGUI("arp_a_switch", PRESET.ARP.A_enabled)
	updateGUI("arp_b_switch", PRESET.ARP.B_enabled)
	updateGUI("arp_c_switch", PRESET.ARP.C_enabled)
	updateGUI("arp_pattern", PRESET.ARP.pattern, arpPatternValues[PRESET.ARP.pattern])
	updateGUI("arp_speed", PRESET.ARP.playbackRate, arpSpeedReadoutValues[PRESET.ARP.playbackRate])
	updateGUI("master_octave", PRESET.MASTER.octaveOffset+2, masterOctaveReadoutValues[PRESET.MASTER.octaveOffset+2])

	// Update Tone.js //
	// OSC A
	SYNTH_A.set({
		"oscillator": {
			"type": oscillatorShapeValues[PRESET.OSC_A.shape],
			"count": PRESET.OSC_A.count,
			"spread": PRESET.OSC_A.spread,
		},
		"harmonicity": PRESET.OSC_A.harmonicity,
		"modulationIndex": PRESET.OSC_A.modulationIndex,
		"modulation": {
			"type": oscillatorShapeValues[PRESET.OSC_A.modulationShape]
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
			"type": oscillatorShapeValues[PRESET.OSC_B.shape],
			"count": PRESET.OSC_B.count,
			"spread": PRESET.OSC_B.spread,
		},
		"harmonicity": PRESET.OSC_B.harmonicity,
		"modulationIndex": PRESET.OSC_B.modulationIndex,
		"modulation": {
			"type": oscillatorShapeValues[PRESET.OSC_B.modulationShape]
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
			"type": oscillatorShapeValues[PRESET.OSC_C.shape],
			"count": PRESET.OSC_C.count,
			"spread": PRESET.OSC_C.spread,
		},
		"harmonicity": PRESET.OSC_C.harmonicity,
		"modulation": {
			"type": oscillatorShapeValues[PRESET.OSC_C.modulationShape]
		},
		"envelope": {
			"attack": PRESET.OSC_C.attack,
			"decay": PRESET.OSC_C.decay,
			"sustain": PRESET.OSC_C.sustain,
			"release": PRESET.OSC_C.release
		},
		"volume": PRESET.OSC_C.volume+6
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
	if (PRESET.LFO.enabled) {
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
	if (PRESET.FX.enabled) {
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
	// ARP
	ARP_A.set({
		"pattern": arpPatternValues[PRESET.ARP.pattern],
		"playbackRate": arpSpeedValues[PRESET.ARP.playbackRate]
	})
	ARP_B.set({
		"pattern": arpPatternValues[PRESET.ARP.pattern],
		"playbackRate": arpSpeedValues[PRESET.ARP.playbackRate]
	})
	ARP_C.set({
		"pattern": arpPatternValues[PRESET.ARP.pattern],
		"playbackRate": arpSpeedValues[PRESET.ARP.playbackRate]
	})
	// MASTER
	MASTER_GAIN.gain.value = PRESET.MASTER.gain
	Tone.Transport.set({
		"bpm": PRESET.MASTER.bpm
	})
	// CONNECTIONS
	connectTone()
}

// Function which loads every .ms24preset file in presets folder
// These have to be hardcoded in, because you can't read files from a folder client-side
function loadDefaultPresets(){
	let presetFiles = [
		"Alien Drone.ms24preset",
		"BuddyBass.ms24preset",
		"Cheery Arp.ms24preset",
		"Dark FM.ms24preset",
		"Daylight.ms24preset",
		"Delirium.ms24preset",
		"Digital Flute.ms24preset",
		"Eff Emm.ms24preset",
		"Elysian FM.ms24preset",
		"Hyperspace.ms24preset",
		"Init.ms24preset",
		"Sharp Pluck.ms24preset",
		"Space Engine.ms24preset",
		"Temple Bass.ms24preset",
		"Wubber.ms24preset",
		"Yes FM.ms24preset",
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
	let bgState = 0
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
			if(bgState === 0 && SYNTH.THEME.current === "dark") {
				presetsTableBodyHTML += `
	        <tr class="text-left bg-stone-900 h-[45px]">
	            <td><span class="ml-1">${preset.METADATA.name}</span></td>
	            <td><span class="ml-1">${preset.METADATA.type}</span></td>
	            <td><span class="ml-1">${preset.METADATA.author}</span></td>
	            <td><span class="ml-1">${preset.METADATA.rating}</span></td>
	            <td class="flex justify-end mt-1">
	                <button class="preset_load_button border border-blue-400 hover:border-white transition-all text-gray-300 rounded-lg p-1 w-[135px] text-center mr-1" id="${localStorage.key(i)}-load-button">
	                Load Preset
	                </button>
	                <button class="preset_delete_button border border-red-400 hover:border-white transition-all text-gray-300 rounded-lg p-1 w-[135px] text-center" id="${localStorage.key(i)}-delete-button">
	                Delete Preset
	                </button>
	            </td>
	        </tr>
        	`
				bgState++
			} else if (bgState === 0 && SYNTH.THEME.current === "light") {
				presetsTableBodyHTML += `
	        <tr class="text-left bg-custom-white h-[45px]">
	            <td><span class="ml-1">${preset.METADATA.name}</span></td>
	            <td><span class="ml-1">${preset.METADATA.type}</span></td>
	            <td><span class="ml-1">${preset.METADATA.author}</span></td>
	            <td><span class="ml-1">${preset.METADATA.rating}</span></td>
	            <td class="flex justify-end mt-1">
	                <button class="preset_load_button border bg-blue-400 hover:border-white transition-all text-black rounded-lg p-1 w-[135px] text-center mr-1" id="${localStorage.key(i)}-load-button">
	                Load Preset
	                </button>
	                <button class="preset_delete_button border bg-red-400 hover:border-white transition-all text-black rounded-lg p-1 w-[135px] text-center" id="${localStorage.key(i)}-delete-button">
	                Delete Preset
	                </button>
	            </td>
	        </tr>
        	`
				bgState++
			} else if (bgState === 1 && SYNTH.THEME.current === "dark") {
				presetsTableBodyHTML += `
	        <tr class="text-left h-[45px]">
	            <td><span class="ml-1">${preset.METADATA.name}</span></td>
	            <td><span class="ml-1">${preset.METADATA.type}</span></td>
	            <td><span class="ml-1">${preset.METADATA.author}</span></td>
	            <td><span class="ml-1">${preset.METADATA.rating}</span></td>
	            <td class="flex justify-end mt-1">
	                <button class="preset_load_button border border-blue-400 hover:border-white transition-all text-gray-300 rounded-lg p-1 w-[135px] text-center mr-1" id="${localStorage.key(i)}-load-button">
	                Load Preset
	                </button>
	                <button class="preset_delete_button border border-red-400 hover:border-white transition-all text-gray-300 rounded-lg p-1 w-[135px] text-center" id="${localStorage.key(i)}-delete-button">
	                Delete Preset
	                </button>
	            </td>
	        </tr>
        	`
				bgState--
			} else if (bgState === 1 && SYNTH.THEME.current === "light") {
				presetsTableBodyHTML += `
	        <tr class="text-left h-[45px]">
	            <td><span class="ml-1">${preset.METADATA.name}</span></td>
	            <td><span class="ml-1">${preset.METADATA.type}</span></td>
	            <td><span class="ml-1">${preset.METADATA.author}</span></td>
	            <td><span class="ml-1">${preset.METADATA.rating}</span></td>
	            <td class="flex justify-end mt-1">
	                <button class="preset_load_button border bg-blue-400 hover:border-white transition-all text-black rounded-lg p-1 w-[135px] text-center mr-1" id="${localStorage.key(i)}-load-button">
	                Load Preset
	                </button>
	                <button class="preset_delete_button border bg-red-400 hover:border-white transition-all text-black rounded-lg p-1 w-[135px] text-center" id="${localStorage.key(i)}-delete-button">
	                Delete Preset
	                </button>
	            </td>
	        </tr>
			`
				bgState--
			}
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
	// jQuery selector for the target element
	let jQtarget = "#"+target
	// Set the value of the target element
	$(jQtarget)[0].value = value;
	// If readout is defined, update the readout element
	if(readout !== undefined){
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

// update all controls colors using jQuery
function updateControlColours(targetClass, indicator, background, highlight){
	let jQtargetGroup = "."+targetClass
	$(jQtargetGroup).each(function(){
		$(this)[0].colors = `${indicator};${background};${highlight}`
	})
}
function updateParamColours(textColor, backgroundColor){
	/*
	for(let i = 0; i < targets.length; i++){
		console.log(targets[i])
		let target = "#"+targets[i].id
		console.log("Updating colour of", target, "to", textColor+";"+backgroundColor)
		$(target)[0].colors = `${textColor};${backgroundColor}`
		console.log(targets[i])
	}
	*/
	for(let i = 0; i < webaudioControlsReadouts.length; i++){
		console.log("Updating colour of", webaudioControlsReadouts[i])
		let width = webaudioControlsReadouts[i].width
		let fontSize = webaudioControlsReadouts[i].fontsize
		webaudioControlsReadouts[i]
			.shadowRoot.querySelector("input")
			.setAttribute("style", `color: ${textColor}; background-color: ${backgroundColor}; width: ${width}px; height: 20px; font-size: ${fontSize}px;`)
	}
}
let infoBlocks = document.getElementsByClassName("info_block")
let lfoSelector = document.getElementById("lfo_selector")
let fxSelector = document.getElementById("fx_selector")
// update page colours
function updatePageColours(pageBackground, synthBackground, text, theme){
	document.body.style.backgroundColor = pageBackground
	synthContainer.style.backgroundColor = synthBackground
	document.body.style.color = text
	SYNTH.THEME.synthBackgroundColour = synthBackground
	SYNTH.THEME.synthTextColour = text
	consentContainer.style.backgroundColor = synthBackground
	for(let i = 0; i < infoBlocks.length; i++){
		if(theme==="dark") {
			infoBlocks[i].style.backgroundColor = '#000'
		} else {
			infoBlocks[i].style.backgroundColor = '#dadada'
		}
	}
	lfoSelector.style.backgroundColor = synthBackground
	fxSelector.style.backgroundColor = synthBackground
	SYNTH.THEME.pageBackgroundColour = pageBackground
	SYNTH.THEME.synthBackgroundColour = synthBackground
	SYNTH.THEME.synthTextColour = text
}

// -- RECORDING -- //

async function startRecording() {
	// log state of MediaRecorder
	console.log("MediaRecorder state (pre-start):", REC.state)
	if(REC.state === "inactive"){
		// clear chunks
		CHUNKS = []
		// start recording
		await REC.start()
		// log state of MediaRecorder
		console.log("MediaRecorder state (post-start):", REC.state)
		// set label to "recording..."
		recorderLabel.innerHTML = "Recording..."
	} else {
		console.log("MediaRecorder is not inactive!")
	}
}

async function stopRecording() {
	// log state of MediaRecorder
	console.log("MediaRecorder state (pre-stop):", REC.state)
	if (REC.state === "recording") {
		// stop recording
		await REC.stop()
		// log state of MediaRecorder
		console.log("MediaRecorder state (post-stop):", REC.state)
		// return label to default
		recorderLabel.innerHTML = "Record"
	} else {
		console.log("MediaRecorder is not recording!")
	}
}

// -- MIDI LOGIC -- //

// MIDI Access Class
class MIDIAccess {
	constructor(args = {}) {
		// Either use the passed in function or log to console
		this.onDeviceInput = args.onDeviceInput || console.log;
	}

	start() {
		// Return a promise
		return new Promise((resolve, reject) => {
			// Request MIDI Access
			this._requestAccess().then(access => {
				// Initialize MIDI Access
				this.initialize(access);
				// Resolve the promise
				resolve();
			}).catch(() => reject('Something went wrong.'));
		});
	}

	initialize(access) {
		// Get all MIDI inputs
		const devices = access.inputs.values();
		// Loop through all MIDI inputs
		let index = 0
		for (let device of devices){
			index++
			console.log('Device', index)
			// Initialize the MIDI device
			this.initializeDevice(device);
		}
	}

	initializeDevice(device) {
		// Listen for MIDI messages
		device.onmidimessage = this.onMessage.bind(this);
		// Log the device name, state and type
		console.log(`Name: ${device.name}\nState: ${device.state}\nType: ${device.type}`)
	}

	onMessage(message) {
		// Initialize MIDI data array variables
		let [command, note, velocity] = message.data;
		// Run the onDeviceInput function using the MIDI data
		this.onDeviceInput({ command, note, velocity });
	}

	_requestAccess() {
		// Return a promise
		return new Promise((resolve, reject) => {
			// Check if the browser supports MIDI
			if (navigator.requestMIDIAccess)
				// Request MIDI Access
				navigator.requestMIDIAccess()
					.then(resolve)
					.catch(reject);
			else reject();
		});
	}
}

// Create a new instance of the MIDIAccess class
const MIDI = new MIDIAccess({ onDeviceInput })

// Start MIDI Access
MIDI.start().then(() => {
	console.log("MIDI Access started")
}).catch((err) => {
	console.error(err)
})

// Handle MIDI Inputs
function onDeviceInput({command, note, velocity}) {
	// Log the MIDI data
	console.log('onDeviceInput', {command, note, velocity})
	// MIDI command switch
	switch(command) {
		// Note On
		case 144:
			if (velocity > 0) {
				handleNote("on", note, velocity, "midi")
			} else {
				handleNote("off", note, 127,"midi")
			}
			break;
		// Note Off
		case 128:
			handleNote("off", note, 127, "midi")
			break;
	}
}

// Get the frequency a MIDI note should trigger
function midiToFreq(note) {
	// Return the frequency of a MIDI note
	return Math.pow(2, (note - 69) / 12) * 440
}

// Activate a GUI key based on a MIDI note & state
function guiKeyActivator(note, state) {
	let gui_state = state === "on" ? 1 : 0
	// Octave of the note (0 = C0, 1 = C1, 2 = C2, etc.)
	let octave = Math.floor(note / 12)
	// Key of the note (0 = C, 1 = C#, 2 = D, etc.)
	let key = note % 12
	// Modifier to add to the key to get the GUI key
	let keyModifier = (octave*12)+24
	// GUI key
	let guiKey = key + keyModifier
	console.log("Octave: " + octave + ", Key: " + key + ", Key Modifier: " + keyModifier + ", GUI Key: " + guiKey)
	keyboard.setNote(gui_state, guiKey, 0)
}

// Offset a frequency by an octave and/or semitone
function frequencyOffset(octave, semitone) {
	// Return the frequency offset of an octave and semitone
	return Math.pow(2, (octave + semitone / 12))
}

// -- ARP LOGIC -- //

function startArp(freqA, freqB, freqC) {
	// If ARP A is enabled,
	if (PRESET.ARP.A_enabled && PRESET.OSC_A.enabled) {
		// Add the frequency to the array if it is not already in the array
		if (!SYNTH.STATE.arp_A_frequencies.includes(freqA)) {
			SYNTH.STATE.arp_A_frequencies.push(freqA)
		}
		// Set Tone Pattern values to the updated array of frequencies
		ARP_A.set({
			"values": SYNTH.STATE.arp_A_frequencies,
		})
		// If there is only one frequency in the array, start the arp
		if (SYNTH.STATE.arp_A_frequencies.length === 1) {
			ARP_A.start()
		}
	}
	// Repeat for ARP B and ARP C
	if (PRESET.ARP.B_enabled && PRESET.OSC_B.enabled) {
		if (!SYNTH.STATE.arp_B_frequencies.includes(freqB)) {
			SYNTH.STATE.arp_B_frequencies.push(freqB)
		}
		ARP_B.set({
			"values": SYNTH.STATE.arp_B_frequencies,
		})
		if(SYNTH.STATE.arp_B_frequencies.length === 1) {
			ARP_B.start()
		}
	}
	if (PRESET.ARP.C_enabled && PRESET.OSC_C.enabled) {
		if (!SYNTH.STATE.arp_C_frequencies.includes(freqC)) {
			SYNTH.STATE.arp_C_frequencies.push(freqC)
		}
		ARP_C.set({
			"values": SYNTH.STATE.arp_C_frequencies,
		})
		if(SYNTH.STATE.arp_C_frequencies.length === 1) {
			ARP_C.start()
		}
	}
}
function stopArp(freqA, freqB, freqC) {
	if (SYNTH.STATE.arp_A_frequencies.length > 0) {
		SYNTH.STATE.arp_A_frequencies = SYNTH.STATE.arp_A_frequencies.filter(f => f !== freqA)
		ARP_A.set({
			"values": SYNTH.STATE.arp_A_frequencies,
		})
	}
	if (SYNTH.STATE.arp_B_frequencies.length > 0) {
		SYNTH.STATE.arp_B_frequencies = SYNTH.STATE.arp_B_frequencies.filter(f => f !== freqB)
		ARP_B.set({
			"values": SYNTH.STATE.arp_B_frequencies,
		})
	}
	if (SYNTH.STATE.arp_C_frequencies.length > 0) {
		SYNTH.STATE.arp_C_frequencies = SYNTH.STATE.arp_C_frequencies.filter(f => f !== freqC)
		ARP_C.set({
			"values": SYNTH.STATE.arp_C_frequencies,
		})
	}
	if(SYNTH.STATE.arp_A_frequencies.length === 0 && SYNTH.STATE.arp_B_frequencies.length === 0 && SYNTH.STATE.arp_C_frequencies.length === 0) {
		// Stop all arpeggiators
		ARP_A.stop()
		ARP_B.stop()
		ARP_C.stop()
	}
	if(SYNTH.STATE.keysHeld === 0) {
		// Empty all arpeggiator frequency arrays
		SYNTH.STATE.arp_A_frequencies = []
		SYNTH.STATE.arp_B_frequencies = []
		SYNTH.STATE.arp_C_frequencies = []
		// Stop all arpeggiators
		ARP_A.stop()
		ARP_B.stop()
		ARP_C.stop()
	}
}

// -- KEYBOARD LOGIC -- //

let webaudioControlsReadouts = document.getElementsByTagName("webaudio-param")
for(let readout of webaudioControlsReadouts){
	readout.addEventListener("focusin", e => {
		console.log(e)
		SYNTH.STATE.physicalKeyboardActive = false
	})
	readout.addEventListener("focusout", e => {
		console.log(e)
		SYNTH.STATE.physicalKeyboardActive = true
	})
}
let inputs = document.getElementsByTagName("input")
for(let input of inputs) {
	input.addEventListener("focusin", e => {
		console.log(e)
		SYNTH.STATE.physicalKeyboardActive = false
	})
	input.addEventListener("focusout", e => {
		console.log(e)
		if(!SYNTH.STATE.presetsPageOpen){
			SYNTH.STATE.physicalKeyboardActive = true
		}
	})
}

// Handle any note events (MIDI, keyboard, or mouse)
function handleNote(state, note, velocity, origin) {
	if(SYNTH.STATE.enabled) {
		// Log the note data
		console.log('handleNote', {state, note, velocity})
		// Optional velocity handling, currently disabled
		// let velocityScalar = velocity / 127
		// SYNTH_A.volume.value = Tone.gainToDb(velocityScalar)
		// SYNTH_B.volume.value = Tone.gainToDb(velocityScalar)
		// SYNTH_C.volume.value = Tone.gainToDb(velocityScalar)
		// If the note is a MIDI note, subtract 48 to get the correct frequency
		note = origin === 'midi' ? note - 48 : note
		// console.log("note:",note)
		// If the origin is not the mouse or toggle, activate a GUI key
		if (origin !== "mouse" && origin !== "toggle") {
			guiKeyActivator(note, state)
		}
		let originalFrequency
		if(origin !== "toggle") {
			// Assign to frequency determined by MIDI value
			originalFrequency = midiToFreq(note)
			// Push the frequency to the array of currently playing frequencies
			SYNTH.STATE.playingFrequencies.push(originalFrequency)
		} else {
			// Assign to frequency passed in from toggle
			originalFrequency = note
		}
		// Calculate the frequency for each oscillator (with octave and detune offsets)
		let freqA = originalFrequency * frequencyOffset(octaveValues[PRESET.OSC_A.octave] + PRESET.MASTER.octaveOffset, PRESET.OSC_A.detune)
		let freqB = originalFrequency * frequencyOffset(octaveValues[PRESET.OSC_B.octave] + PRESET.MASTER.octaveOffset, PRESET.OSC_B.detune)
		let freqC = originalFrequency * frequencyOffset(subOctaveValues[PRESET.OSC_C.octave] + PRESET.MASTER.octaveOffset, PRESET.OSC_C.detune)
		// If note state is "on"
		if (state === 'on') {
			// If any of the oscillators are enabled, set the isPlaying state to true
			if (PRESET.OSC_A.enabled || PRESET.OSC_B.enabled || PRESET.OSC_C.enabled) {
				SYNTH.STATE.isPlaying = true
			}
			// Start the arpeggiator listener
			startArp(freqA, freqB, freqC)

			// If the arpeggiator is not enabled for an enabled oscillator,
			// trigger the attack for that oscillator with the calculated frequency
			if (!PRESET.ARP.A_enabled && PRESET.OSC_A.enabled) {
				SYNTH_A.triggerAttack(freqA)
				console.log("OSC A attack", freqA, Tone.Frequency(freqA).toNote())
			}
			if (!PRESET.ARP.B_enabled && PRESET.OSC_B.enabled) {
				SYNTH_B.triggerAttack(freqB)
				console.log("OSC B attack", freqB, Tone.Frequency(freqB).toNote())
			}
			if (!PRESET.ARP.C_enabled && PRESET.OSC_C.enabled) {
				SYNTH_C.triggerAttack(freqC)
				console.log("OSC C attack", freqC, Tone.Frequency(freqC).toNote())
			}
			// If note state is "off"
		} else {
			// Release the note for each oscillator
			SYNTH_A.triggerRelease(freqA)
			console.log("OSC A release", freqA, Tone.Frequency(freqA).toNote())
			SYNTH_B.triggerRelease(freqB)
			console.log("OSC B release", freqB, Tone.Frequency(freqB).toNote())
			SYNTH_C.triggerRelease(freqC)
			console.log("OSC C release", freqC, Tone.Frequency(freqC).toNote())
			// Sometimes a note gets duplicated and this doesn't always filter it out
			SYNTH.STATE.playingFrequencies = SYNTH.STATE.playingFrequencies.filter(f => f !== originalFrequency)
			// This doesn't fix it, but it's still a useful safeguard
			// The actual issue is bypassed in the keydown event handler below
			if (SYNTH.STATE.playingFrequencies.length === 0) {
				SYNTH.STATE.isPlaying = false
				SYNTH_A.releaseAll()
				SYNTH_B.releaseAll()
				SYNTH_C.releaseAll()
			}
			// Stop the arpeggiators
			stopArp(freqA, freqB, freqC)
		}
		// Log ifPlaying
		console.log("isPlaying", SYNTH.STATE.isPlaying)
		// Log the currently playing frequencies
		console.log("SYNTH.STATE.playingFrequencies", SYNTH.STATE.playingFrequencies)
		// Log the arpeggiator frequency array, if enabled
		if (PRESET.ARP.A_enabled && PRESET.OSC_A.enabled) {
			console.log("ARP.notes_A", SYNTH.STATE.arp_A_frequencies)
		}
		if (PRESET.ARP.B_enabled && PRESET.OSC_B.enabled) {
			console.log("ARP.notes_B", SYNTH.STATE.arp_B_frequencies)
		}
		if (PRESET.ARP.C_enabled && PRESET.OSC_C.enabled) {
			console.log("ARP.notes_C", SYNTH.STATE.arp_C_frequencies)
		}
	}
}

// Function which listens to the computer keyboard like a MIDI keyboard
// Sending identical MIDI data to the handleNote function
// The 123456 and QWERTY rows are mapped to the C4-C5 octave
// The ASDFGH and ZXCVBN rows are mapped to the C3-C4 octave
function handleKeyEvent(event) {
	let state = event.type === "keydown" ? "on" : "off"
	// MIDI note switch
	switch (event.key) {
		// Bottom octave (C3-C4)
		case "z":
			handleNote(state, 0, 127)
			break;
		case "s":
			handleNote(state, 1, 127)
			break;
		case "x":
			handleNote(state, 2, 127)
			break;
		case "d":
			handleNote(state, 3, 127)
			break;
		case "c":
			handleNote(state, 4, 127)
			break;
		case "v":
			handleNote(state, 5, 127)
			break;
		case "g":
			handleNote(state, 6, 127)
			break;
		case "b":
			handleNote(state, 7, 127)
			break;
		case "h":
			handleNote(state, 8, 127)
			break;
		case "n":
			handleNote(state, 9, 127)
			break;
		case "j":
			handleNote(state, 10, 127)
			break;
		case "m":
			handleNote(state, 11, 127)
			break;
		case ",":
			handleNote(state, 12, 127)
			break;
		// Top octave (C4-C5)
		case "q":
			handleNote(state, 12, 127);
			break;
		case "2":
			handleNote(state, 13, 127);
			break;
		case "w":
			handleNote(state, 14, 127);
			break;
		case "3":
			handleNote(state, 15, 127);
			break;
		case "e":
			handleNote(state, 16, 127);
			break;
		case "r":
			handleNote(state, 17, 127);
			break;
		case "5":
			handleNote(state, 18, 127);
			break;
		case "t":
			handleNote(state, 19, 127);
			break;
		case "6":
			handleNote(state, 20, 127);
			break;
		case "y":
			handleNote(state, 21, 127);
			break;
		case "7":
			handleNote(state, 22, 127);
			break;
		case "u":
			handleNote(state, 23, 127);
			break;
		case "i":
			handleNote(state, 24, 127);
			break;
		case "9":
			handleNote(state, 25, 127);
			break;
		case "o":
			handleNote(state, 26, 127);
			break;
		case "0":
			handleNote(state, 27, 127);
			break;
		case "p":
			handleNote(state, 28, 127);
			break;
		default:
			// Do nothing for other keys
			break;
	}
}

// Keypress listener to disable quick-find in browser
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

// Keydown listener to handle computer keyboard events (on)
document.addEventListener("keydown", e => {
	// If the key is being held down, return
	// (This prevents the keydown event from firing multiple times)
	if (e.repeat) {
		return
	}
	// Push the key to the lastKeyDownEvents array
	SYNTH.STATE.lastKeyDownEvents.push(e.key)
	// If lastKeyDownEvents does not already contain the key, handle the event
	if (SYNTH.STATE.lastKeyDownEvents.indexOf(e.key) === SYNTH.STATE.lastKeyDownEvents.length - 1) {
		// Log the event
		// console.log("keydown", e)
		// Store previous keysHeld value
		let previouslyHeld = SYNTH.STATE.keysHeld
		// If the physical keyboard is active (not disabled by focused input box)
		if (SYNTH.STATE.physicalKeyboardActive) {
			// Increment keysHeld
			SYNTH.STATE.keysHeld++
			// Log the number of keys held on keydown
			console.log("keysHeld (keydown):", SYNTH.STATE.keysHeld)
			// If keysHeld is over 0, handle the note event
			if (SYNTH.STATE.keysHeld > 0) {
				handleKeyEvent(e)
			}
			// If keysHeld is 1 and previouslyHeld was 0, start the transport
			if (SYNTH.STATE.keysHeld === 1 && previouslyHeld === 0) {
				Tone.Transport.start()
			}
		}
	}
	// Log the lastKeyDownEvents array
	console.log("lastEvents", SYNTH.STATE.lastKeyDownEvents)
})

// Keyup listener to handle computer keyboard events (off)
document.addEventListener("keyup", e => {
	// Filter the key out of the lastKeyDownEvents array
	SYNTH.STATE.lastKeyDownEvents = SYNTH.STATE.lastKeyDownEvents.filter(event => event !== e.key)
	// Log the event
	// console.log("keyup", e)
	// Decrement keysHeld if it is over 0
	// (This prevents bug where keysHeld can become negative)
	if (SYNTH.STATE.keysHeld > 0) {
		SYNTH.STATE.keysHeld--
	}
	// If keysHeld is 0, stop the transport
	if(SYNTH.STATE.keysHeld === 0){
		Tone.Transport.stop()
	}
	// Log the number of keys held on keyup
	console.log("keysHeld (keyup):", SYNTH.STATE.keysHeld)
	// Handle the note event
	handleKeyEvent(e)
	// Log the lastKeyDownEvents array
	console.log("lastEvents", SYNTH.STATE.lastKeyDownEvents)
})

// Virtual (GUI) keyboard
let keyboard = document.getElementById("keyboard");

// Event listener for the virtual (GUI) keyboard
keyboard.addEventListener("change", function (e) {
	// Handle note event
	// e.note[0] is the note state (on/off)
	// e.note[1] is the note number (0-127)
	// Subtracting 24 to align the octave with the other input methods
	handleNote(e.note[0] ? "on" : "off", e.note[1]-24, 127, "mouse")
});

// Function which changes note values on the fly
// Allowing for octave/detune offsets to work while the synth is playing
function changeNote(targetSynth, targetValue, newValue){
	// Original value + offset
	// If octave/detune knob, then its octave/detune + master octave offset
	// If master octave offset knob, then its master octave offset + master octave offset
	let targetOscillator
	let targetArpeggiator
	let targetArpeggiatorState
	let targetArpeggiatorNotes
	let targetSynthName
	if(targetSynth === SYNTH_A) {
		targetOscillator = PRESET.OSC_A
		targetArpeggiator = ARP_A
		targetArpeggiatorState = PRESET.ARP.A_enabled
		targetArpeggiatorNotes = SYNTH.STATE.arp_A_frequencies
		targetSynthName = "A"
	}
	if(targetSynth === SYNTH_B) {
		targetOscillator = PRESET.OSC_B
		targetArpeggiator = ARP_B
		targetArpeggiatorState = PRESET.ARP.B_enabled
		targetArpeggiatorNotes = SYNTH.STATE.arp_B_frequencies
		targetSynthName = "B"
	}
	if(targetSynth === SYNTH_C){
		targetOscillator = PRESET.OSC_C
		targetArpeggiator = ARP_C
		targetArpeggiatorState = PRESET.ARP.C_enabled
		targetArpeggiatorNotes = SYNTH.STATE.arp_C_frequencies
		targetSynthName = "C"
	}
	console.log("changeNote from:", targetValue+"_"+targetSynthName, targetOscillator[targetValue] ? targetOscillator[targetValue] : PRESET.MASTER.octaveOffset, "NEW:", newValue)
	// If synth is playing when control is changed
	if(SYNTH.STATE.isPlaying){
		// For each playing frequency
		for (let frequency of SYNTH.STATE.playingFrequencies) {
			// Calculate offset frequency
			let offsetFrequency
			if (targetSynth !== SYNTH_C) {
				offsetFrequency = frequency * frequencyOffset(octaveValues[targetOscillator.octave]+PRESET.MASTER.octaveOffset, targetOscillator.detune)
			} else {
				offsetFrequency = frequency * frequencyOffset(subOctaveValues[targetOscillator.octave]+PRESET.MASTER.octaveOffset, targetOscillator.detune)
			}
			// Log data
			console.log("releasing:", targetSynthName, offsetFrequency, Tone.Frequency(offsetFrequency).toNote())
			if(targetOscillator.enabled && targetArpeggiatorState){
				console.log("Target oscillator & arpeggiator enabled. Stopping:", offsetFrequency)
				if (targetArpeggiatorNotes.length > 0) {
					targetArpeggiatorNotes = targetArpeggiatorNotes.filter(f => f !== offsetFrequency)
					targetArpeggiator.set({
						"values": targetArpeggiatorNotes
					})
				}
				if(targetArpeggiatorNotes.length === 0) {
					targetArpeggiator.stop()
				}
			}
			// Trigger release
			targetSynth.triggerRelease(offsetFrequency)
		}
		// Log old value
		console.log("old value:", targetSynthName, targetOscillator[targetValue])
		if(targetValue !== "master_octave"){
			// Set new value
			targetOscillator[targetValue] = newValue
		} else {
			PRESET.MASTER.octaveOffset = newValue
		}
		// Log new value
		console.log("new value:", targetSynthName, targetOscillator[targetValue])
		// For each playing frequency
		for (let frequency of SYNTH.STATE.playingFrequencies) {
			// Calculate offset frequency
			let offsetFrequency
			if (targetSynth !== SYNTH_C) {
				offsetFrequency = frequency * frequencyOffset(octaveValues[targetOscillator.octave]+PRESET.MASTER.octaveOffset, targetOscillator.detune)
			} else {
				offsetFrequency = frequency * frequencyOffset(subOctaveValues[targetOscillator.octave]+PRESET.MASTER.octaveOffset, targetOscillator.detune)
			}
			// Log data
			console.log("triggering:", targetSynthName, offsetFrequency, Tone.Frequency(offsetFrequency).toNote())
			// Trigger attack
			if(targetOscillator.enabled && targetArpeggiatorState){
				console.log("Target oscillator & arpeggiator enabled. Stopping:", offsetFrequency)
				// Add the frequency to the array
				targetArpeggiatorNotes.push(offsetFrequency)
				// Set Tone Pattern values to the updated array of frequencies
				targetArpeggiator.set({
					"values": targetArpeggiatorNotes,
				})
				// If there is only one frequency in the array, start the arp
				if (targetArpeggiatorNotes.length === 1) {
					targetArpeggiator.start()
				}
				console.log("New arp notes:", targetArpeggiatorNotes)
			} else {
				targetSynth.triggerAttack(offsetFrequency)
			}
		}
		// If synth is not playing when control is changed
	} else {
		// Log old value
		console.log("old value:", targetSynthName, targetOscillator[targetValue])
		if(targetValue !== "master_octave"){
			// Set new value
			targetOscillator[targetValue] = newValue
		} else {
			PRESET.MASTER.octaveOffset = newValue
		}
		// Log new value
		console.log("new value:", targetSynthName, targetOscillator[targetValue])
		// Release all notes (to avoid hanging notes)
		targetSynth.releaseAll()
	}
	switch(targetSynth) {
		case SYNTH_A:
			SYNTH.STATE.arp_A_frequencies = targetArpeggiatorNotes
			break;
		case SYNTH_B:
			SYNTH.STATE.arp_B_frequencies = targetArpeggiatorNotes
			break;
		case SYNTH_C:
			SYNTH.STATE.arp_C_frequencies = targetArpeggiatorNotes
			break;
	}
	console.log("changeNote from:", targetValue+"_"+targetSynthName, targetOscillator[targetValue] ? targetOscillator[targetValue] : PRESET.MASTER.octaveOffset, "NEW:", newValue)
	console.log("ARP.notes_A", SYNTH.STATE.arp_A_frequencies)
	console.log("ARP.notes_B", SYNTH.STATE.arp_B_frequencies)
	console.log("ARP.notes_C", SYNTH.STATE.arp_C_frequencies)
}

// -- GUI CONTROLS LOGIC -- //

let controls = document.getElementsByClassName("control");
console.log(controls);

// For each control...
for (let i = 0; i < controls.length; i++) {
	// ...add a "change" event listener
	controls[i].addEventListener("change", async function (e) {
		// Log the event target ID and its value
		console.log(e.target.id, e.target.value)
		// Switch case for each control
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
					await startRecording().then(() => {
						// log to console
						console.log("Recording started!")
					}).catch(err => {
						console.error(err)
					})
				// if rec toggled off...
				} else {
					await stopRecording().then(() => {
						// log to console
						console.log("Recording stopped!")
					}).catch(err => {
						console.error(err)
					})
				}
				break;
			case "arp_a_switch":
				// TODO: BUG: If octave is changed while arp is off,
				//  and then arp is turned on, the arp will play the old octave
				PRESET.ARP.A_enabled = e.target.value
				if(e.target.value === 0){
					ARP_A.stop()
					if(PRESET.OSC_A.enabled){
						for(let i = 0; i < SYNTH.STATE.playingFrequencies.length; i++){
							handleNote("on", SYNTH.STATE.playingFrequencies[i], 127, "toggle")
						}
					}
				} else {
					let offsetFrequency
					for(let i= 0; i < SYNTH.STATE.playingFrequencies.length; i++){
						offsetFrequency = SYNTH.STATE.playingFrequencies[i] * frequencyOffset(octaveValues[PRESET.OSC_A.octave]+PRESET.MASTER.octaveOffset, PRESET.OSC_A.detune)
						SYNTH_A.triggerRelease(offsetFrequency)
						// Add the frequency to the array if it doesn't already exist
						if(!SYNTH.STATE.arp_A_frequencies.includes(offsetFrequency)){
							SYNTH.STATE.arp_A_frequencies.push(offsetFrequency)
						}
						// Set Tone Pattern values to the updated array of frequencies
						ARP_A.set({
							"values": SYNTH.STATE.arp_A_frequencies,
						})
						ARP_A.start()
					}
				}
				break;
			case "arp_b_switch":
				PRESET.ARP.B_enabled = e.target.value
				if(e.target.value === 0){
					ARP_B.stop()
					if(PRESET.OSC_B.enabled){
						for(let i = 0; i < SYNTH.STATE.playingFrequencies.length; i++){
							handleNote("on", SYNTH.STATE.playingFrequencies[i], 127, "toggle")
						}
					}
				} else {
					let offsetFrequency
					for(let i= 0; i < SYNTH.STATE.playingFrequencies.length; i++){
						offsetFrequency = SYNTH.STATE.playingFrequencies[i] * frequencyOffset(octaveValues[PRESET.OSC_B.octave]+PRESET.MASTER.octaveOffset, PRESET.OSC_B.detune)
						SYNTH_B.triggerRelease(offsetFrequency)
						// Add the frequency to the array if it doesn't already exist
						if(!SYNTH.STATE.arp_B_frequencies.includes(offsetFrequency)){
							SYNTH.STATE.arp_B_frequencies.push(offsetFrequency)
						}
						// Set Tone Pattern values to the updated array of frequencies
						ARP_B.set({
							"values": SYNTH.STATE.arp_B_frequencies,
						})
						ARP_B.start()
					}
				}
				break;
			case "arp_c_switch":
				PRESET.ARP.C_enabled = e.target.value
				if(e.target.value === 0){
					ARP_C.stop()
					if(PRESET.OSC_C.enabled){
						for(let i = 0; i < SYNTH.STATE.playingFrequencies.length; i++){
							handleNote("on", SYNTH.STATE.playingFrequencies[i], 127, "toggle")
						}
					}
				} else {
					let offsetFrequency
					for(let i= 0; i < SYNTH.STATE.playingFrequencies.length; i++){
						offsetFrequency = SYNTH.STATE.playingFrequencies[i] * frequencyOffset(subOctaveValues[PRESET.OSC_C.octave]+PRESET.MASTER.octaveOffset, PRESET.OSC_C.detune)
						SYNTH_C.triggerRelease(offsetFrequency)
						// Add the frequency to the array if it doesn't already exist
						if(!SYNTH.STATE.arp_C_frequencies.includes(offsetFrequency)){
							SYNTH.STATE.arp_C_frequencies.push(offsetFrequency)
						}
						// Set Tone Pattern values to the updated array of frequencies
						ARP_C.set({
							"values": SYNTH.STATE.arp_C_frequencies,
						})
						ARP_C.start()
					}
				}
				break;
		}
		// initialise URL variable
		let recordingURL
		// once data is available to the recorder...
		REC.ondataavailable = e => {
			// log to console
			console.log("DATA AVAILABLE!", e.data)
			// push data to chunks array
			CHUNKS.push(e.data)
		}
		// once the recorder is stopped...
		REC.onstop = e => {
			// log to console
			console.log("e:", e)
			// create a blob from the chunks array
			let blob = new Blob(CHUNKS, { 'type' : 'audio/wav' })
			// create object URL from blob
			recordingURL = URL.createObjectURL(blob)
			// create anchor element
			const anchor = document.createElement("a")
			// set file name & format (wav)
			anchor.download = "recording.wav"
			// set anchor href to url
			anchor.href = recordingURL
			// click anchor (download)
			anchor.click()
		}
		// once toggle logic is complete,
		// re-connect the synth based on the updated settings
		connectTone()
	})
	// -- CONTINUOUS CONTROL EVENTS (Knobs & Sliders) -- //
	// using "input" instead of "change" to allow for continuous changes
	// with "change", the value only updates when the control is released
	controls[i].addEventListener("input", function (e) {
		console.log(e.target.id, e.target.value);
		switch (e.target.id) {
			// -------------- //
			// --- MASTER --- //
			// -------------- //
			case "master_gain":
				PRESET.MASTER.gain = e.target.value
				MASTER_GAIN.gain.value = e.target.value
				break;
			case "master_bpm":
				// Set preset value
				PRESET.MASTER.bpm = e.target.value
				// Set Tone Transport BPM
				Tone.Transport.set({
					"bpm": e.target.value
				})
				// // Stop & start transport to update BPM without glitches
				// Tone.Transport.stop(+10)
				// Tone.Transport.start(+10)
				// If ARP is enabled, restart it to update BPM
				if(PRESET.ARP.A_enabled){
					ARP_A.start()
				}
				if(PRESET.ARP.B_enabled){
					ARP_B.start()
				}
				if(PRESET.ARP.C_enabled){
					ARP_C.start()
				}
				break;
			// -------------------- //
			// --- OSCILLATOR A --- //
			// -------------------- //
			case "osc_a_octave":
				changeNote(SYNTH_A, "octave", e.target.value)
				console.log("OSC_A OCTAVE:",PRESET.OSC_A.octave)
				break;
			case "osc_a_semi":
				changeNote(SYNTH_A, "detune", e.target.value)
				break;
			case "osc_a_volume":
				PRESET.OSC_A.volume = e.target.value
				SYNTH_A.set({
					"volume": e.target.value
				})
				let wave_a_gain
				if(e.target.value < 0) {
					// If value is negative, increase waveform gain to compensate
					wave_a_gain = 1 + (Math.abs(e.target.value) / 6)
					oscA_waveform_gain.set({
						"gain": wave_a_gain
					})
				} else if (e.target.value === 0) {
					// If value is 0, set waveform gain to 1
					wave_a_gain = 1
					oscA_waveform_gain.set({
						"gain": wave_a_gain
					})
				} else {
					// If value is positive, decrease waveform gain to compensate
					wave_a_gain = 1 - (e.target.value / 12)
					oscA_waveform_gain.set({
						"gain": wave_a_gain
					})
				}
				console.log(wave_a_gain)
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
				changeNote(SYNTH_B, "octave", e.target.value)
				break;
			case "osc_b_semi":
				changeNote(SYNTH_B, "detune", e.target.value)
				break;
			case "osc_b_volume":
				PRESET.OSC_B.volume = e.target.value
				SYNTH_B.set({
					"volume": e.target.value
				})
				let wave_b_gain
				if(e.target.value < 0) {
					// If value is negative, increase waveform gain to compensate
					wave_b_gain = 1 + (Math.abs(e.target.value) / 6)
					oscB_waveform_gain.set({
						"gain": wave_b_gain
					})
				} else if (e.target.value === 0) {
					// If value is 0, set waveform gain to 1
					wave_b_gain = 1
					oscB_waveform_gain.set({
						"gain": wave_b_gain
					})
				} else {
					// If value is positive, decrease waveform gain to compensate
					wave_b_gain = 1 - (e.target.value / 12)
					oscB_waveform_gain.set({
						"gain": wave_b_gain
					})
				}
				console.log(wave_b_gain)
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
				changeNote(SYNTH_C, "octave", e.target.value)
				break;
			case "osc_c_semi":
				changeNote(SYNTH_C, "detune", e.target.value)
				break;
			case "osc_c_volume":
				PRESET.OSC_C.volume = e.target.value
				SYNTH_C.set({
					"volume": e.target.value + 6
				})
				let wave_c_gain
				if(e.target.value < 0) {
					// If value is negative, increase waveform gain to compensate
					wave_c_gain = 1 + (Math.abs(e.target.value) / 6)
					oscC_waveform_gain.set({
						"gain": wave_c_gain
					})
				} else if (e.target.value === 0) {
					// If value is 0, set waveform gain to 1
					wave_c_gain = 1
					oscC_waveform_gain.set({
						"gain": wave_c_gain
					})
				} else {
					// If value is positive, decrease waveform gain to compensate
					wave_c_gain = 1 - (e.target.value / 12)
					oscC_waveform_gain.set({
						"gain": wave_c_gain
					})
				}
				console.log(wave_c_gain)
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
			case "lfo_rate":
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
			// ----------- //
			// --- ARP --- //
			// ----------- //
			case "arp_pattern":
				PRESET.ARP.pattern = e.target.value
				ARP_A.set({
					pattern: arpPatternValues[e.target.value]
				})
				ARP_B.set({
					pattern: arpPatternValues[e.target.value]
				})
				ARP_C.set({
					pattern: arpPatternValues[e.target.value]
				})
				break;
			case "arp_speed":
				PRESET.ARP.playbackRate = e.target.value
				ARP_A.set({
					playbackRate: arpSpeedValues[e.target.value]
				})
				ARP_B.set({
					playbackRate: arpSpeedValues[e.target.value]
				})
				ARP_C.set({
					playbackRate: arpSpeedValues[e.target.value]
				})
				break;
			case "arp_note_length":
				PRESET.ARP.noteLength = e.target.value
				// ARP_A.set({
				// 	interval: arpTimeValues[e.target.value]
				// })
				// ARP_B.set({
				// 	interval: arpTimeValues[e.target.value]
				// })
				// ARP_C.set({
				// 	interval: arpTimeValues[e.target.value]
				// })
				break;
			case "master_octave":
				let oldValue = PRESET.MASTER.octaveOffset
				changeNote(SYNTH_A, "master_octave", e.target.value-2)
				PRESET.MASTER.octaveOffset = oldValue
				changeNote(SYNTH_B, "master_octave", e.target.value-2)
				PRESET.MASTER.octaveOffset = oldValue
				changeNote(SYNTH_C, "master_octave", e.target.value-2)
				break;
			default:
				console.log("Switch default: Nothing set for this case!")
		}
	})
}

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

function p5_sketch(p) {
	p.setup = function () {
		oscilloscope_a_pos = getPositionXY(osc_a_oscilloscope);
		oscilloscope_b_pos = getPositionXY(osc_b_oscilloscope);
		oscilloscope_c_pos = getPositionXY(osc_c_oscilloscope);
		console.log("osc_a pos:",oscilloscope_a_pos)
		console.log("osc_b pos:",oscilloscope_b_pos)
		console.log("osc_c pos:",oscilloscope_c_pos)
		canvasWidth = getSize(synthContainer).width;
		canvasHeight = getSize(synthContainer).height-2;
		p.createCanvas(canvasWidth-16, canvasHeight-16);
	}
	p.windowResized = function () {
		oscilloscope_a_pos = getPositionXY(osc_a_oscilloscope);
		oscilloscope_b_pos = getPositionXY(osc_b_oscilloscope);
		oscilloscope_c_pos = getPositionXY(osc_c_oscilloscope);
		console.log("osc_a pos:",oscilloscope_a_pos)
		console.log("osc_b pos:",oscilloscope_b_pos)
		console.log("osc_c pos:",oscilloscope_c_pos)
		canvasWidth = getSize(synthContainer).width;
		canvasHeight = getSize(synthContainer).height-2;
		p.resizeCanvas(canvasWidth-16, canvasHeight-16);
	}
	p.draw = function () {
		// Redraw background
		p.background(SYNTH.THEME.synthBackgroundColour)
		// If visualisations are enabled
		if(SYNTH.STATE.visualisationsEnabled) {
			// Reset stroke
			p.strokeWeight(1)
			// Draw oscilloscopes
			if (PRESET.OSC_A.enabled) {
				p.drawWaveform(oscA_waveform, 220, 320, 388, 112)
			}
			if (PRESET.OSC_B.enabled) {
				p.drawWaveform(oscB_waveform, 220, 320, 1072, 112)
			}
			if (PRESET.OSC_C.enabled) {
				p.drawWaveform(oscC_waveform, 220, 320, 388, 340)
			}
			if (PRESET.LFO.enabled) {
				p.drawWaveform(lfo_waveform, 220, 50, 388, 690)
			}
			p.drawWaveform(master_waveform, 220, 320, 1072, 570)
			// Set stroke and fill for rectangles
			p.strokeWeight(0)
			// p.fill(0)
			p.fill(SYNTH.THEME.synthBackgroundColour)
			// Horizontal rectangles to enclose the oscilloscopes
			p.rect(0, 0, canvasWidth, 212)
			p.rect(0, 324, canvasWidth, 111)
			p.rect(0, 547, canvasWidth, 113)
			p.rect(0, 772, canvasWidth, 125)
			// Vertical rectangles to enclose the oscilloscopes
			p.rect(0, 0, 382, canvasHeight)
			p.rect(604, 0, 455, canvasHeight)
			p.rect(canvasWidth - 22, 0, 10, canvasHeight)
		}
	}
	p.drawWaveform = function(wave, w, h, x, y) {
		// Adjust x/y position based on current canvas size
		x = x / synthContainer.offsetWidth * p.width;
		y = y / synthContainer.offsetHeight * p.height;

		// Waveform buffer
		let buffer = wave.getValue(0);
		// console.log(buffer)

		// Initialise start variable
		let start;

		// Find the first zero crossing
		for (let i = 1; i < buffer.length; i++){
			if(wave !== lfo_waveform) {
				// if the previous point is negative, and the current point is positive/zero
				// then we've found the zero crossing
				if (buffer[i - 1] < 0 && buffer[i] >= 0) {
					// Set the start to the zero crossing
					start = i;
					break
				}
			} else {
				// since LFO values may be all positive or all negative,
				// to find the zero crossing we need to find the first point
				// where the value is not equal to the previous value
				if (buffer[i - 1] !== buffer[i]) {
					// Set the start to the zero crossing
					start = i;
					break
				}
			}
		}

		// If visualising anything other than the LFO,
		let end
		if(wave !== lfo_waveform) {
			// We draw a portion of the waveform, to avoid the initial transient
			// Otherwise we would see the waveform "jump" horizontally to the start of the buffer
			end = start + buffer.length / 2;
		} else {
			// If visualising the LFO, we draw the whole waveform
			end = buffer.length;
		}


		// Set stroke colour to white
		p.stroke(SYNTH.THEME.synthTextColour);

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

// -- SYNTH STATE / SCREEN SETUP -- //

let consentContainer = document.getElementById("consent_container");
let consentButton = document.getElementById("context_consent_button");
let bodyContainer = document.getElementById("body_container");

let firstEntry = true
consentButton.addEventListener("click", function () {
	consentContainer.style.display = "none";
	synthContainer.style.display = "flex";
	bodyContainer.style.paddingTop = "1rem";
	document.body.style.backgroundColor = SYNTH.THEME.pageBackgroundColour;
	if (Tone.context.state !== "running") {
		Tone.context.resume();
	}
	if(!SYNTH.STATE.enabled && firstEntry){
		new p5(p5_sketch, "p5_canvas");
		SYNTH.STATE.enabled = true;
		firstEntry = false;
		// If theme does not exist in localStorage, set it to dark, otherwise use the value to set SYNTH.THEME.current
		// Then run changeTheme() to update the page colours
		if (localStorage.getItem("ms24_opposite_theme") === null) {
			localStorage.setItem("ms24_opposite_theme", "light")
		} else {
			SYNTH.THEME.current = localStorage.getItem("ms24_opposite_theme")
			toggleTheme()
		}
	} else if (!SYNTH.STATE.enabled && !firstEntry){
		SYNTH.STATE.enabled = true;
	}
	p5_canvas.classList.remove("hidden");
})

// -- TOOLTIPS -- //

let tooltip_top = document.getElementById("tooltip_top");
let tooltip_bottom = document.getElementById("tooltip_bottom");
let tooltip_elements = document.getElementsByClassName("tooltipElement");

for (let i = 0; i < tooltip_elements.length; i++) {
	// Get the element's id
	let element_id = tooltip_elements[i].id;
	// Get the element's tag name
	let element_tag = tooltip_elements[i].localName;
	// Add mouseover event listener to each button
	tooltip_elements[i].addEventListener("mouseover", function () {
		// Log the element's tag and id
		console.log("mouseover", element_tag, element_id)
		// Get the tooltip text from the tooltips object
		let tooltip
		// If the first part of the id is "osc", and the element is a knob or slider
		if (element_id.split("_")[0] === "osc" && element_tag === "webaudio-knob" || element_id.split("_")[0] === "osc" && element_tag === "webaudio-slider") {
			// Log the id without the first two parts (e.g. "osc_a_fm_depth" becomes "fm_depth")
			console.log(element_id.split("_").splice(2).join("_"))
			// Use the id without the first two parts to get the correct tooltip text
			// This is to reduce the amount of duplicate tooltip values
			tooltip = tooltips[element_tag][element_id.split("_").splice(2).join("_")]
		} else {
			// Otherwise, just use the id to get the correct tooltip text
			tooltip = tooltips[element_tag][element_id];
		}
		// Set the tooltip text
		tooltip_top.innerHTML = tooltip.top;
		tooltip_bottom.innerHTML = tooltip.bottom;
	})
	// Add mouseout event listener to each button
	tooltip_elements[i].addEventListener("mouseout", function () {
		console.log("mouseout", element_tag, element_id)
		// Return the tooltip text to the default
		tooltip_top.innerHTML = tooltips.defaults.top;
		tooltip_bottom.innerHTML = tooltips.defaults.bottom;
	})
}

let dynamicTooltips = {
	// Filter (Resonance/Gain)
	FilterResonance: {
		top: "Filter resonance",
		bottom: "This emphasises frequencies near the cutoff, be careful!"
	},
	FilterGain: {
		top: "Filter gain",
		bottom: "This sets the amplitude of the cutoff frequencies!"
	},
	// FX Distortion (Intensity, Oversample, Mix)
	Distortion: {
		fx_param1: {
			top: "Distortion intensity",
			bottom: "The amount of distortion applied to the signal!"
		},
		fx_param2: {
			top: "Distortion oversample",
			bottom: "Higher quality distortion, at the cost of performance!"
		},
		fx_param3: {
			top: "Distortion mix",
			bottom: "The ratio between the dry and wet signals!"
		},
		fx_param4: {
			top: "",
			bottom: ""
		}
	},
	// FX Chebyshev (Order, Mix)
	Chebyshev: {
		fx_param1: {
			top: "Chebyshev order",
			bottom: "The order of the Chebyshev polynomial used for distortion!"
		},
		fx_param2: {
			top: "Chebyshev mix",
			bottom: "The ratio between the dry and wet signals!"
		},
		fx_param3: {
			top: "",
			bottom: ""
		},
		fx_param4: {
			top: "",
			bottom: ""
		}
	},
	// FX Phaser (Frequency, Octaves, Q, Mix)
	Phaser: {
		fx_param1: {
			top: "Phaser frequency",
			bottom: "The speed of the phasing effect!"
		},
		fx_param2: {
			top: "Phaser octaves",
			bottom: "The octaves of the effect!"
		},
		fx_param3: {
			top: "Phaser Q",
			bottom: "The quality factor of the filters!"
		},
		fx_param4: {
			top: "Phaser mix",
			bottom: "The ratio between the dry and wet signals!"
		}
	},
	// FX Tremolo (Frequency, Depth, Spread, Mix)
	Tremolo: {
		fx_param1: {
			top: "Tremolo frequency",
			bottom: "The speed of the tremolo effect!"
		},
		fx_param2: {
			top: "Tremolo depth",
			bottom: "The depth of the tremolo effect!"
		},
		fx_param3: {
			top: "Tremolo spread",
			bottom: "The amount of stereo spread!"
		},
		fx_param4: {
			top: "Tremolo mix",
			bottom: "The ratio between the dry and wet signals!"
		}
	},
	// FX Vibrato (Frequency, Depth, Type, Mix)
	Vibrato: {
		fx_param1: {
			top: "Vibrato frequency",
			bottom: "The speed of the vibrato effect!"
		},
		fx_param2: {
			top: "Vibrato depth",
			bottom: "The depth of the vibrato effect!"
		},
		fx_param3: {
			top: "Vibrato type",
			bottom: "The type of oscillator used for the vibrato effect!"
		},
		fx_param4: {
			top: "Vibrato mix",
			bottom: "The ratio between the dry and wet signals!"
		}
	},
	// FX Delay (Time, Feedback, Mix)
	Delay: {
		fx_param1: {
			top: "Delay time",
			bottom: "The amount of time the incoming signal is delayed by!"
		},
		fx_param2: {
			top: "Delay feedback",
			bottom: "The amount of signal fed back into the delay!"
		},
		fx_param3: {
			top: "Delay mix",
			bottom: "The ratio between the dry and wet signals!"
		},
		fx_param4: {
			top: "",
			bottom: ""
		}
	},
	// FX Reverb (Decay, Pre-Delay, Mix)
	Reverb: {
		fx_param1: {
			top: "Reverb decay",
			bottom: "The duration of the reverb effect!"
		},
		fx_param2: {
			top: "Reverb pre-delay",
			bottom: "The amount of time before the reverb is fully applied!"
		},
		fx_param3: {
			top: "Reverb mix",
			bottom: "The ratio between the dry and wet signals!"
		},
		fx_param4: {
			top: "",
			bottom: ""
		}
	},
	// FX Pitch Shift (Pitch, Window Size, Feedback, Mix)
	PitchShift: {
		fx_param1: {
			top: "Pitch shift pitch",
			bottom: "The pitch offset in semitones!"
		},
		fx_param2: {
			top: "Pitch shift window size",
			bottom: "The sample length, high values result in strange artifacts!"
		},
		fx_param3: {
			top: "Pitch shift feedback",
			bottom: "The amount of signal fed back into the pitch shift!"
		},
		fx_param4: {
			top: "Pitch shift mix",
			bottom: "The ratio between the dry and wet signals!"
		}
	},
	// FX Frequency Shift (Frequency, Mix)
	FreqShift: {
		fx_param1: {
			top: "Frequency shift frequency",
			bottom: "The ring modulator carrier frequency!"
		},
		fx_param2: {
			top: "Frequency shift mix",
			bottom: "The ratio between the dry and wet signals!"
		},
		fx_param3: {
			top: "",
			bottom: ""
		},
		fx_param4: {
			top: "",
			bottom: ""
		}
	}
}

let tooltips = {
	defaults: {
		top: "Tooltips go here!",
		bottom: "Hover over something to see what it does &#128516;"
	},
	// Buttons (Settings, Presets, Random)
	button: {
		settings_button: {
			top: "Open settings menu",
			bottom: "Return home, change the theme, or disable visualisations!"
		},
		presets_button: {
			top: "Open preset menu",
			bottom: "Load a preset, or save your own!"
		},
		random_preset_button: {
			top: "Randomise synth settings [DISABLED]",
			bottom: "Careful! This can result in VERY loud sounds!"
		}
	},
	p: {
		osc_a_label: {
			top: "Oscillator A (FM)",
			bottom: "Oscillators are the main sound generators in a synthesizer!"
		},
		arp_a_label: {
			top: "Arpeggiator A",
			bottom: "Arpeggiators play held notes in a sequence!"
		},
		osc_b_label: {
			top: "Oscillator B (FM)",
			bottom: "Oscillators are the main sound generators in a synthesizer!"
		},
		arp_b_label: {
			top: "Arpeggiator B",
			bottom: "Arpeggiators play held notes in a sequence!"
		},
		osc_c_label: {
			top: "Oscillator C (AM)",
			bottom: "Oscillators are the main sound generators in a synthesizer!"
		},
		arp_c_label: {
			top: "Arpeggiator C",
			bottom: "Arpeggiators play held notes in a sequence!"
		},
		filter_label: {
			top: "Filter",
			bottom: "Filters shape sound by cutting out certain frequencies!"
		}
	},
	label: {
		lfo_label: {
			top: "Low Frequency Oscillator",
			bottom: "LFOs are used to automatically modulate parameters over time!"
		},
		fx_label: {
			top: "FX (Effects)",
			bottom: "Choose from several effects to manipulate your sound with!"
		},
	},
	// Switches (Groups, Arpeggiators, Sends, Record)
	"webaudio-switch": {
		osc_a_switch: {
			top: "Toggle Oscillator A",
			bottom: "Turn the oscillator on or off!"
		},
		arp_a_switch: {
			top: "Toggle Arpeggiator A",
			bottom: "Turn the arpeggiator on or off!"
		},
		osc_b_switch: {
			top: "Toggle Oscillator B",
			bottom: "Turn the oscillator on or off!"
		},
		arp_b_switch: {
			top: "Toggle Arpeggiator B",
			bottom: "Turn the arpeggiator on or off!"
		},
		osc_c_switch: {
			top: "Toggle Oscillator C",
			bottom: "Turn the oscillator on or off!"
		},
		arp_c_switch: {
			top: "Toggle Arpeggiator C",
			bottom: "Turn the arpeggiator on or off!"
		},
		filter_switch: {
			top: "Toggle Filter",
			bottom: "Turn the filter on or off!"
		},
		osc_a_filter_switch: {
			top: "Toggle Oscillator A Send",
			bottom: "Turn the filter on or off for oscillator A!"
		},
		osc_b_filter_switch: {
			top: "Toggle Oscillator B Send",
			bottom: "Turn the filter on or off for oscillator B!"
		},
		osc_c_filter_switch: {
			top: "Toggle Oscillator C Send",
			bottom: "Turn the filter on or off for oscillator C!"
		},
		lfo_switch: {
			top: "Toggle LFO",
			bottom: "Turn the LFO on or off!"
		},
		fx_switch: {
			top: "Toggle FX",
			bottom: "Turn the FX on or off!"
		},
		rec_switch: {
			top: "Toggle recording",
			bottom: "Start or stop recording the synth output!"
		}
	},
	// Controls
	"webaudio-knob": {
		// Master (BPM, Gain, Octave)
		master_bpm: {
			top: "Global BPM",
			bottom: "The tempo of the arpeggiators!"
		},
		master_gain: {
			top: "Master Gain",
			bottom: "The overall volume of the synth!"
		},
		// -- Osc A -- //
		// FM (Voices, Spread, FM, Depth, Shape)
		voices: {
			top: "Voice Count",
			bottom: "The number of voices generated!"
		},
		spread: {
			top: "Voice Spread",
			bottom: "The pitch offset of each voice (in cents)!"
		},
		fm: {
			top: "FM harmonicity",
			bottom: "The ratio the between the carrier and modulator frequencies!"
		},
		fm_depth: {
			top: "FM depth",
			bottom: "The amplitude of the modulator!"
		},
		fm_shape: {
			top: "FM shape",
			bottom: "The shape of the modulator!"
		},
		// AM (AM, Shape)
		am: {
			top: "AM harmonicity",
			bottom: "The ratio the between the carrier and modulator frequencies!"
		},
		am_shape: {
			top: "AM shape",
			bottom: "The shape of the modulator!"
		},
		// ADSR (Attack, Decay, Sustain, Release)
		attack: {
			top: "Attack time",
			bottom: "The time it takes for the envelope to reach its peak!"
		},
		decay: {
			top: "Decay time",
			bottom: "The time it takes for the envelope to reach its sustain level!"
		},
		sustain: {
			top: "Sustain level",
			bottom: "The level the envelope will sustain at!"
		},
		release: {
			top: "Release time",
			bottom: "The time it takes for the envelope to return to silence!"
		},
		// Main (Octave, Detune, Volume, Shape)
		octave: {
			top: "Octave offset",
			bottom: "The pitch offset of the oscillator, in octaves!"
		},
		semi: {
			top: "Semitone offset",
			bottom: "The pitch offset of the oscillator, in semitones!"
		},
		volume: {
			top: "Volume",
			bottom: "The amplitude of the oscillator!"
		},
		// Filter (Cutoff, Q/Gain, Rolloff, Type)
		filter_cutoff: {
			top: "Filter cutoff frequency",
			bottom: "The frequency at which the filter will begin to attenuate!"
		},
		filter_resonance: dynamicTooltips.FilterResonance,
		// LFO (Rate, Min, Max, Shape)
		lfo_rate: {
			top: "LFO rate",
			bottom: "The speed of the LFO (in bars)!"
		},
		lfo_min: {
			top: "LFO minimum value",
			bottom: "The lowest value the LFO will reach!"
		},
		lfo_max: {
			top: "LFO maximum value",
			bottom: "The highest value the LFO will reach!"
		},
		// FX (Param 1, Param 2, Param 3, Param 4)
		fx_param1: dynamicTooltips[PRESET.FX.type].fx_param1,
		fx_param2: dynamicTooltips[PRESET.FX.type].fx_param2,
		fx_param3: dynamicTooltips[PRESET.FX.type].fx_param3,
		fx_param4: dynamicTooltips[PRESET.FX.type].fx_param4,
	},
	"webaudio-slider": {
		shape: {
			top: "Shape",
			bottom: "The oscillator's waveform shape!"
		},
		filter_rolloff: {
			top: "Filter rolloff",
			bottom: "The decibel rolloff (slope) of the filter curve!"
		},
		filter_type: {
			top: "Filter type",
			bottom: "Choose between lowpass, highpass, bandpass, allpass, notch, lowshelf, and highshelf!"
		},
		lfo_shape: {
			top: "LFO shape",
			bottom: "The LFO's waveform shape!"
		},
		arp_pattern: {
			top: "Arpeggiator pattern",
			bottom: "The playback order of the notes!"
		},
		arp_speed: {
			top: "Arp speed",
			bottom: "The playback speed of the notes (in bars)!"
		},
		master_octave: {
			top: "Global octave modifier",
			bottom: "The octave offset for all oscillators!"
		},
	},
	select: {
		lfo_selector: {
			top: "LFO target selector",
			bottom: "Choose between filter frequency and oscillator volume"
		},
		fx_selector: {
			top: "Effect selector",
			bottom: "Choose from a range of different effects!"
		}
	},
	canvas: {
		oscilloscope_a: {
			top: "Oscilloscope A",
			bottom: "This visualises the output of oscillator A!"
		},
		oscilloscope_b: {
			top: "Oscilloscope B",
			bottom: "This visualises the output of oscillator B!"
		},
		oscilloscope_c: {
			top: "Oscilloscope C",
			bottom: "This visualises the output of oscillator C!"
		},
		oscilloscope_lfo: {
			top: "LFO Oscilloscope",
			bottom: "This visualises the output of the LFO!"
		},
		oscilloscope_master: {
			top: "Master Oscilloscope",
			bottom: "This visualises the master output (what you hear)!"
		}
	},
	"webaudio-keyboard": {
		keyboard: {
			top: "GUI Keyboard",
			bottom: "Click on the keys to play them, or use your physical keyboard!"
		}
	}
}
