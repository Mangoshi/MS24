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
//  - If a user clicks save, save the object to local storage / download as JSON
//  - If a user clicks load, load the object from local storage / upload JSON (then set all parameters)
//  - If a user clicks randomize, randomize the object (this will require min/max values for each parameter)
//  NEED:
//  - Object matching synth data structure
//  - Function for loading a preset & setting all parameters
//  - Function for saving a preset & downloading as JSON
//  - Function for randomizing a preset & setting all parameters
//  - Functions for updating the interface based on the current preset

// -- PRESET DATA (INITIAL) -- //

let PRESET = {
	MASTER: {
		gain: 0.5
	},
	OSC_A: {
		enabled: 1,
		octave: 3,
		detune: 0,
		volume: 0,
		shape: "sine",
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1
	},
	OSC_B: {
		enabled: 1,
		octave: 4,
		detune: 0,
		volume: 0,
		shape: "triangle",
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1
	},
	OSC_C: {
		enabled: 0,
		octave: 1,
		detune: 0,
		volume: 0,
		shape: "sawtooth",
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1
	},
	FILTER: {
		enabled: 1,
		frequency: 1000,
		Q: 1,
		rolloff: -12,
		type: "lowpass",
		osc_a: 1,
		osc_b: 1,
		osc_c: 1
	},
	LFO: {
		enabled: 0,
		target: "FilterFrequency",
		type: "sine",
		grid: "4n",
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
		osc_a: 1,
		osc_b: 1,
		osc_c: 1
	}
}

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
	"0": "sine",
	"1": "triangle",
	"2": "sawtooth",
	"3": "square",
	"4": "sine",
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

const SYNTH_A = new Tone.PolySynth(Tone.Synth)
SYNTH_A.set({
	oscillator: {
		type: PRESET.OSC_A.shape
	}
})
const SYNTH_B = new Tone.PolySynth(Tone.Synth)
SYNTH_B.set({
	oscillator: {
		type: PRESET.OSC_B.shape
	}
})
const SYNTH_C = new Tone.PolySynth(Tone.Synth)
SYNTH_C.set({
	oscillator: {
		type: PRESET.OSC_C.shape
	}
})

SYNTH_A.debug = true
SYNTH_B.debug = true
SYNTH_C.debug = true

// -- FILTER -- //

const FILTER = new Tone.Filter(PRESET.FILTER.frequency, PRESET.FILTER.type, PRESET.FILTER.rolloff)

// -- LFO -- //

let LFO_TARGET_VALUE = PRESET.FILTER.frequency

const LFO = new Tone.LFO("4n", 0, LFO_TARGET_VALUE).start()

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

// -- NOTES -- //

const ARP = new Tone.Pattern(function(time, note){
	SYNTH_A.triggerAttackRelease(note, 0.25);
	SYNTH_B.triggerAttackRelease(note, 0.25);
	SYNTH_C.triggerAttackRelease(note, 0.25);
}, ["C4", "D4", "E4", "G4", "A4"]);

// -- INITIAL CONNECTIONS -- //

let SELECTED_FX = FX_DISTORTION

// Synths to Master //
if(PRESET.OSC_A.enabled){
	SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
}
if(PRESET.OSC_B.enabled){
	SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
}
if(PRESET.OSC_C.enabled) {
	SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
}

// Master FX Chain //
OUTPUT.chain(MASTER_GAIN, MASTER_LIMITER)

// Modulation //
let LFO_TARGET = FILTER.frequency

LFO.connect(LFO_TARGET).stop()

// Master Record
OUTPUT.connect(RECORDER)

// -- CONTROLS DATA -- //

let controls = document.getElementsByClassName("control");
// console.log(controls);

// TODO (?) [idea]:
//  - Infinite loop / listener to fire attack/release signals on array of notes playing
//  - This is kept outside the event listeners
//  - onChange pushes note to array
//  - onRelease removes note from array
//  - Controls changes the array / signals

// Initialize Synth variables
let oscAEnabled = true
let oscBEnabled = true
let oscCEnabled = false
let filterEnabled = true
let selectedFilter = "lowpass"
let filterResonance = 0
let filterGain = 0
let lfoEnabled = false
let fxEnabled = true
let fxMix = 0.5

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

let recorderLabel = document.getElementById("rec_label")

// -- EVENT LISTENERS -- //
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

for (let i = 0; i < controls.length; i++) {
	// add event listener to each control

	controls[i].addEventListener("change", async function (e) {
		switch (e.target.id) {
			case "osc_a_switch":
				PRESET.OSC_A.enabled = e.target.value
				// if osc_a toggled off...
				if (e.target.value === 0) {
					SYNTH_A.disconnect()
					oscAEnabled = false
				// if osc_a toggled on...
				} else {
					// depending on filter and fx settings, connect to the correct nodes
					if (filterEnabled && fxEnabled) {
						SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
					} else {
						if (filterEnabled && !fxEnabled) {
							SYNTH_A.chain(FILTER, OUTPUT)
						} else if (!filterEnabled && fxEnabled) {
							SYNTH_A.chain(SELECTED_FX, OUTPUT)
						} else {
							SYNTH_A.connect(OUTPUT)
						}
					}
					oscAEnabled = true
				}
				break;
			case "osc_b_switch":
				PRESET.OSC_B.enabled = e.target.value
				// if osc_b toggled off...
				if (e.target.value === 0) {
					// turn off
					SYNTH_B.disconnect()
					oscBEnabled = false
				// if osc_b toggled on...
				} else {
					// depending on filter and fx settings, connect to the correct nodes
					if (filterEnabled && fxEnabled) {
						SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
					} else {
						if (filterEnabled && !fxEnabled) {
							SYNTH_B.chain(FILTER, OUTPUT)
						} else if (!filterEnabled && fxEnabled) {
							SYNTH_B.chain(SELECTED_FX, OUTPUT)
						} else {
							SYNTH_B.connect(OUTPUT)
						}
					}
					oscBEnabled = true
				}
				break;
			case "osc_c_switch":
				PRESET.OSC_C.enabled = e.target.value
				// if osc_c toggled on...
				if (e.target.value === 0) {
					// turn off
					SYNTH_C.disconnect()
					oscCEnabled = false
				// if osc_c toggled off...
				} else {
					// depending on filter and fx settings, connect to the correct nodes
					if (filterEnabled && fxEnabled) {
						SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
					} else {
						if (filterEnabled && !fxEnabled) {
							SYNTH_C.chain(FILTER, OUTPUT)
						} else if (!filterEnabled && fxEnabled) {
							SYNTH_C.chain(SELECTED_FX, OUTPUT)
						} else {
							SYNTH_C.connect(OUTPUT)
						}
					}
					oscCEnabled = true
				}
				break;
			case "filter_switch":
				PRESET.FILTER.enabled = e.target.value
				// if filter toggled off...
				if (e.target.value === 0) {
					// and fx is on...
					if (fxEnabled) {
						if (oscAEnabled) {
							SYNTH_A.disconnect()
							SYNTH_A.chain(SELECTED_FX, OUTPUT)
						}
						if (oscBEnabled) {
							SYNTH_B.disconnect()
							SYNTH_B.chain(SELECTED_FX, OUTPUT)
						}
						if (oscCEnabled) {
							SYNTH_C.disconnect()
							SYNTH_C.chain(SELECTED_FX, OUTPUT)
						}
					// and fx is off...
					} else {
						if (oscAEnabled) {
							SYNTH_A.disconnect()
							SYNTH_A.connect(OUTPUT)
						}
						if (oscBEnabled) {
							SYNTH_B.disconnect()
							SYNTH_B.connect(OUTPUT)
						}
						if (oscCEnabled) {
							SYNTH_C.disconnect()
							SYNTH_C.connect(OUTPUT)
						}
					}
					// set filterEnabled to false
					filterEnabled = false
				// if filter toggled on...
				} else {
					// and fx is on...
					if (fxEnabled) {
						if (oscAEnabled) {
							SYNTH_A.disconnect()
							SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
						}
						if (oscBEnabled) {
							SYNTH_B.disconnect()
							SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
						}
						if (oscCEnabled) {
							SYNTH_C.disconnect()
							SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
						}
					// and fx is off...
					} else {
						if (oscAEnabled) {
							SYNTH_A.disconnect()
							SYNTH_A.chain(FILTER, OUTPUT)
						}
						if (oscBEnabled) {
							SYNTH_B.disconnect()
							SYNTH_B.chain(FILTER, OUTPUT)
						}
						if (oscCEnabled) {
							SYNTH_C.disconnect()
							SYNTH_C.chain(FILTER, OUTPUT)
						}
					}
					// set filterEnabled to true
					filterEnabled = true
				}
				break;
			case "lfo_switch":
				PRESET.LFO.enabled = e.target.value
				// if lfo toggled off...
				if (e.target.value === 0) {
					LFO.stop()
					// LFO.disconnect(LFO_TARGET)
					lfoEnabled = false
				// if lfo toggled on...
				} else {
					LFO.start()
					// LFO.connect(LFO_TARGET)
					lfoEnabled = true
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
					// set fxEnabled to false
					fxEnabled = false
				// if fx toggled on...
				} else {
					// if filter is enabled...
					SELECTED_FX.set({
						"wet": fxMix
					})
					// set fxEnabled to true
					fxEnabled = true
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
				PRESET.OSC_A.octave = octaveValues[e.target.value]
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
				PRESET.OSC_A.shape = shapeValues[e.target.value]
				SYNTH_A.set({
					oscillator: {
						type: PRESET.OSC_A.shape
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
			// -------------------- //
			// --- OSCILLATOR B --- //
			// -------------------- //
			case "osc_b_octave":
				PRESET.OSC_B.octave = octaveValues[e.target.value]
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
				PRESET.OSC_B.shape = shapeValues[e.target.value]
				SYNTH_B.set({
					oscillator: {
						type: PRESET.OSC_B.shape
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
			// -------------------- //
			// --- OSCILLATOR C --- //
			// -------------------- //
			case "osc_c_octave":
				PRESET.OSC_C.octave = subOctaveValues[e.target.value]
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
				PRESET.OSC_C.shape = shapeValues[e.target.value]
				SYNTH_C.set({
					oscillator: {
						type: PRESET.OSC_C.shape
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
				if (selectedFilter === 'lowshelf' || selectedFilter === 'highshelf') {
					PRESET.FILTER.gain = e.target.value
					FILTER.set({
						gain: e.target.value
					})
					filterGain = e.target.value
				} else {
					PRESET.FILTER.Q = e.target.value
					FILTER.set({
						Q: e.target.value
					})
					filterResonance = e.target.value
				}
				break;
			case "filter_rolloff":
				PRESET.FILTER.rolloff = filterRolloffValues[e.target.value]
				FILTER.set({
					rolloff: filterRolloffValues[e.target.value]
				})
				break;
			case "filter_type":
				PRESET.FILTER.type = filterTypeValues[e.target.value]
				FILTER.set({
					type: filterTypeValues[e.target.value]
				})
				// If filter type is lowshelf or highshelf...
				if (e.target.value === 5 || e.target.value === 6) {
					// ...change the filter Q knob to gain knob
					updateFilterKnob("filter_resonance", 1, -24, 24, 0.1, filterGain.toFixed(1), "Gain")
				// Else if filter type is not lowshelf or highshelf...
				} else {
					// ...change the filter gain knob to Q knob
					updateFilterKnob("filter_resonance", 1, 0, 100, 1, filterResonance, "Q")
				}
				selectedFilter = filterTypeValues[e.target.value]
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
					case "FilterResonance":
						PRESET.LFO.target = "FilterResonance"
						LFO_TARGET = FILTER.Q
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
				PRESET.LFO.grid = lfoGridValues[e.target.value]
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
				PRESET.LFO.shape = shapeValues[e.target.value]
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
				switch (e.target.value) {
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

				if (fxEnabled) {
					// set selected FX wet value to fxMix
					SELECTED_FX.set({wet: fxMix})
					// log selected

					// console.log("Removing previous FX: " + PREVIOUS_FX + "...")
					// disconnect previous FX from output chain
					SYNTH_A.disconnect()
					SYNTH_B.disconnect()
					SYNTH_C.disconnect()
					FILTER.disconnect()

					// console.log("Setting FX to " + SELECTED_FX + "...")
					// set output chain to filter -> selected FX -> master gain
					if (oscAEnabled) {
						SYNTH_A.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					if (oscBEnabled) {
						SYNTH_B.chain(FILTER, SELECTED_FX, OUTPUT)
					}
					if (oscCEnabled) {
						SYNTH_C.chain(FILTER, SELECTED_FX, OUTPUT)
					}
				}
				break;
			case "fx_param1":
				PRESET.FX.param1 = e.target.value
				switch (SELECTED_FX) {
					case FX_DISTORTION:
						FX_DISTORTION.set({
							"distortion": e.target.value
						})
						break;
					case FX_CHEBYSHEV:
						FX_CHEBYSHEV.set({
							"order": e.target.value
						})
						break;
					case FX_PHASER:
						FX_PHASER.set({
							"frequency": e.target.value
						})
						break;
					case FX_TREMOLO:
						FX_TREMOLO.set({
							"frequency": e.target.value
						})
						break;
					case FX_VIBRATO:
						FX_VIBRATO.set({
							"frequency": e.target.value
						})
						break;
					case FX_DELAY:
						FX_DELAY.set({
							"delayTime": e.target.value
						})
						break;
					case FX_REVERB:
						FX_REVERB.set({
							"decay": e.target.value
						})
						break;
					case FX_PITCHSHIFT:
						FX_PITCHSHIFT.set({
							"pitch": e.target.value
						})
						break;
					case FX_FREQSHIFT:
						FX_FREQSHIFT.set({
							"frequency": e.target.value
						})
						break;
					default:
						console.log("Switch default: Nothing set for this case!")
				}
				break;
			case "fx_param2":
				PRESET.FX.param2 = e.target.value
				switch (SELECTED_FX) {
					case FX_DISTORTION:
						FX_DISTORTION.set({
							"oversample": distortionOversampleValues[e.target.value]
						})
						break;
					case FX_CHEBYSHEV:
						fxMix = e.target.value
						FX_CHEBYSHEV.set({
							"wet": e.target.value
						})
						break;
					case FX_PHASER:
						FX_PHASER.set({
							"octaves": e.target.value
						})
						break;
					case FX_TREMOLO:
						FX_TREMOLO.set({
							"depth": e.target.value
						})
						break;
					case FX_VIBRATO:
						FX_VIBRATO.set({
							"depth": e.target.value
						})
						break;
					case FX_DELAY:
						FX_DELAY.set({
							"feedback": e.target.value
						})
						break;
					case FX_REVERB:
						FX_REVERB.set({
							"preDelay": e.target.value
						})
						break;
					case FX_PITCHSHIFT:
						FX_PITCHSHIFT.set({
							"windowSize": e.target.value
						})
						break;
					case FX_FREQSHIFT:
						fxMix = e.target.value
						FX_FREQSHIFT.set({
							"wet": e.target.value
						})
						break;
					default:
						console.log("Switch default: Nothing set for this case!")
				}
				break;
			case "fx_param3":
				PRESET.FX.param3 = e.target.value
				switch (SELECTED_FX) {
					case FX_DISTORTION:
						fxMix = e.target.value
						FX_DISTORTION.set({
							"wet": e.target.value
						})
						break;
					case FX_PHASER:
						FX_PHASER.set({
							"Q": e.target.value
						})
						break;
					case FX_TREMOLO:
						FX_TREMOLO.set({
							"spread": e.target.value
						})
						break;
					case FX_VIBRATO:
						FX_VIBRATO.set({
							"type": shapeValues[e.target.value]
						})
						break;
					case FX_DELAY:
						FX_DELAY.set({
							"delayTime": e.target.value
						})
						break;
					case FX_REVERB:
						fxMix = e.target.value
						FX_REVERB.set({
							"wet": e.target.value
						})
						break;
					case FX_PITCHSHIFT:
						FX_PITCHSHIFT.set({
							"feedback": e.target.value
						})
						break;
					default:
						console.log("Switch default: Nothing set for this case!")
				}
				break;
			case "fx_param4":
				PRESET.FX.param4 = e.target.value
				fxMix = e.target.value
				if(fxEnabled) {
					switch (SELECTED_FX) {
						case FX_PHASER:
							FX_PHASER.set({
								"wet": e.target.value
							})
							break;
						case FX_TREMOLO:
							FX_TREMOLO.set({
								"wet": e.target.value
							})
							break;
						case FX_VIBRATO:
							FX_VIBRATO.set({
								"wet": e.target.value
							})
							break;
						case FX_PITCHSHIFT:
							FX_PITCHSHIFT.set({
								"wet": e.target.value
							})
							break;
						default:
							console.log("Switch default: Nothing set for this case!")
					}
				}
				break;
			default:
				console.log("Switch default: Nothing set for this case!")
		}
	})
}

let presetsButton = document.getElementById("presets_button")

presetsButton.addEventListener("click", function() {
	console.log(PRESET)
})

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
	let note_a = getNoteFromNumber(e.note[1], PRESET.OSC_A.detune, PRESET.OSC_A.octave);
	let note_b = getNoteFromNumber(e.note[1], PRESET.OSC_B.detune, PRESET.OSC_B.octave);
	let note_c = getNoteFromNumber(e.note[1], PRESET.OSC_C.detune, PRESET.OSC_C.octave);

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
