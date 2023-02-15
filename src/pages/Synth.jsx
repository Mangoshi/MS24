import * as Tone from 'tone'
import { create } from 'zustand'
import produce from "immer";
import {useEffect} from "react";

// --- TONE JS --- //

// -- JSON -- //
let controlsData = {
	keysHeld: [],
	keysReleased: [],
	OSC_A: {
		octave: 1,
		semitone: 0,
		quantize: 0,
		shape: 0,
		attack: 1,
		decay: 500,
		sustain: 1,
		release: 1000,
	},
	FM: {
		harmonicity: 1,
		depth: 0,
	},
	OSC_B: {
		octave: 1,
		semitone: 7,
		quantize: 0,
		shape: 2,
		attack: 1,
		decay: 500,
		sustain: 1,
		release: 1000,
	}
}

let defaultSynthSettings = {
	SYNTH: {
		maxPolyphony: 12,
		glide: 0,
		volume: 1,
	},
	OSC_A: {
		name: 'OSC A',
		enabled: 1,
		pos: {
			x: 20,
			y: 140
		},
		oscillator: {
			volume: 5,
			type: "sine",
		},
		detune: 0,
		envelope: {
			attack: 1,
			decay: 1,
			sustain: 1,
			release: 1
		},
	},
	FM: {
		harmonicity: 1.2,
		depth: 1
	},
	OSC_B: {
		name: 'OSC A',
		enabled: 1,
		pos: {
			x: 20,
			y: 140
		},
		oscillator: {
			volume: 5,
			type: "sawtooth"
		},
		envelope: {
			attack: 1,
			decay: 1,
			sustain: 1,
			release: 1
		},
	},
	OSC_SUB: {},
	FILTER: {
		filter: {
			Q: 5,
			type: "lowpass",
			rolloff: -12
		},
		filterEnvelope: {
			attack: 0.1,
			decay: 0.2,
			sustain: 1,
			release: 2,
			baseFrequency: 150
		},
	},
	LFO: {},
	FX: {},
	MIDI: {}
}

let partials = new Array(8).fill(0).map(() => Math.random())

// -- Setup & Util -- //
// const polySynth = new Tone.PolySynth(Tone.MonoSynth).toDestination()
const autoFilter = new Tone.AutoFilter("8n").toDestination().start();
const fmPolySynth = new Tone.PolySynth(Tone.FMSynth, {
	volume: defaultSynthSettings.SYNTH.volume,
	oscillator: defaultSynthSettings.OSC_A.oscillator,
	detune: defaultSynthSettings.OSC_A.detune,
	envelope: defaultSynthSettings.OSC_A.envelope,
	modulation: {
		volume: defaultSynthSettings.OSC_B.oscillator.volume,
		type: "fm"+defaultSynthSettings.OSC_B.oscillator.type,
	},
	modulationEnvelope: defaultSynthSettings.OSC_B.envelope,
	harmonicity: defaultSynthSettings.FM.harmonicity,
	modulationIndex: defaultSynthSettings.FM.depth,
	portamento: defaultSynthSettings.SYNTH.glide,
}).connect(autoFilter)
// Chain connections
// fmPolySynth.chain(autoFilter, Tone.Destination)
// Chain connections (in parallel)
// fmPolySynth.fan(autoFilter, Tone.Destination)
const now = Tone.now()
// console.log(Tone.context.state)
console.log(fmPolySynth)
fmPolySynth.debug = true

// --- zSTATE --- //
const useControlsStore = create((set) => ({
	control: controlsData,
	setControlsData: (targetGroup, target, payload) =>
		set(
			produce((draft) => {
				draft.control[targetGroup][target] = payload
			})
		),
	setOscillatorData: (targetGroup, payload) =>
		set(
			produce((draft) => {
				draft.control[targetGroup].oscillator = payload
			})
		),
	addKeysHeld: (payload) =>
		set(
			produce((draft) => {
				draft.control.keysHeld.push(payload)
				// polySynth.triggerAttack(payload, now);
			})
		),
	addKeysReleased: (payload) =>
		set(
			produce((draft) => {
				draft.control.keysReleased.push(payload)
				// polySynth.triggerRelease(payload, "+0.1");
			})
		),
	filterKeysHeld: (payload) =>
		set(
			produce((draft) => {
				draft.control.keysHeld = draft.control.keysHeld.filter((key) => key !== payload)
			})
		),
	clearKeysReleased: () =>
		set(
			produce((draft) => {
				draft.control.keysReleased = []
				// if(draft.control.keysHeld.length <= 1) {
				// 	polySynth.releaseAll()
				// }
			})
		)
}))
const useSynthStore = create((set) => ({
	synth: defaultSynthSettings,
	setSynthSettings: (targetGroup, target, payload) =>
		set(
			produce((draft) => {
				draft.synth[targetGroup][target] = payload
			})
		),
}))

// --- STYLING --- //
const controlContainer = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
}
const controlGroup = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	paddingRight: '10px'
}
const oscillatorDataContainer = {
	backgroundColor: 'black',
	paddingLeft: '10px',
	paddingRight: '10px',
	margin: '2.5px'
}



function Synth({appData}) {
	// -- State Getters -- //
	let synthState = useSynthStore((state) => state.synth)
	let controlsState = useControlsStore((state) => state.control)
	// -- State Setters -- //
	const updateSynthState = useSynthStore((state) => state.setSynthSettings)
	const updateControlsState = useControlsStore((state) => state.setControlsData)
	const updateOscillatorState = useControlsStore((state) => state.setOscillatorData)

	const OscillatorControls = (
		{
			type,
			group,
			control,
			size,
			min,
			max,
			step,
			value,
			modifier,
			colors,
		}) => {
		// console.log("OscillatorControls:", group, control, size, min, max, value, colors)

		let controlElement;
		let controlOutput;

		let id = group + "_" + control + "_control"
		// console.log("ID:", id)

		let dynamicGroupValue
		let dynamicGroup

		useEffect(() => {
			controlElement = document.getElementById(id);
			controlElement.addEventListener('change', function (e) {
				console.log("ID:", e.target.id, "Val:", e.target.value);
				if(control === "shape") {
					dynamicGroup = {[group]: {"oscillator": {[control]: value}}}
					dynamicGroupValue = dynamicGroup[group].oscillator[control]
					console.log("Dynamic Group:", `${group}-${control}`, dynamicGroup)
					console.log("Dynamic Group Value:", `${group}-${control}`, dynamicGroupValue)

					const newControlsLookup = {
						0: {type: "sine", volume: 5},
						1: {type: "triangle", volume: 5},
						2: {type: "sawtooth", volume: 5},
						3: {type: "square", volume: 5}
					};

					const newControls = newControlsLookup[e.target.value] || newControlsLookup[0];
					console.log("Updating Synth Settings:", group, newControls)
					updateControlsState(group, control, e.target.value)
					updateSynthState(group, "oscillator", newControls)
					if(group === "OSC_A"){
						console.log("Updating OSC_A")
						fmPolySynth.set({
							oscillator: {
								type: newControls.type,
								volume: newControls.volume
							}
						})
					} else if (group === "OSC_B"){
						console.log("Updating OSC_B")
						fmPolySynth.set({
							modulation: {
								type: newControls.type,
								modulationType: newControls.type,
								volume: newControls.volume
							}
						})
					}
				} else if (control === "harmonicity" || control === "depth") {
					dynamicGroup = {[group] : {[control]: value}}
					dynamicGroupValue = dynamicGroup[group][control]
					console.log("Dynamic Group:", `${group}-${control}`, dynamicGroup)
					console.log("Dynamic Group Value:", `${group}-${control}`, dynamicGroupValue)

					let controlTarget = control

					if(control==="depth") {
						controlTarget = "modulationIndex"
					}

					console.log("Updating Synth Controls:", group, control, controlTarget, e.target.value)
					updateControlsState(group, control, e.target.value)

					fmPolySynth.set({
						[controlTarget]: e.target.value
					})
				}
				else {
					dynamicGroup = {[group] : {"controls": {[control]: value}}}
					dynamicGroupValue = dynamicGroup[group].controls[control]
					console.log("Dynamic Group:", `${group}-${control}`, dynamicGroup)
					console.log("Dynamic Group Value:", `${group}-${control}`, dynamicGroupValue)

					// if(group === "OSC_A" && control==="octave") {
					// 	fmPolySynth.set({
					// 		frequency: 1 * e.target.value
					// 	})
					// } else if (group === "OSC_B" && control==="octave") {
					// 	fmPolySynth.set({
					// 		harmonicity: 1 * e.target.value
					// 	})
					// }

					controlOutput = e.target.value + modifier;
					console.log("Updating Synth Controls:", group, "controls", control, e.target.value)
					updateControlsState(group, control, e.target.value)
				}
				console.log("get:",fmPolySynth.get())
			})
		}, [])

		return (
			<div>
				{
					type === "knob" &&
					<div style={controlGroup}>
						<div>{control}</div>
						<webaudio-knob
							id={id}
							diameter={size}
							min={min}
							max={max}
							value={value}
							colors={colors}
							step={step}
						></webaudio-knob>
						<webaudio-param
							link={id}
							fontSize="14"
						></webaudio-param>
					</div>
				} {
				type === "slider" &&
				<div style={controlGroup}>
					<div>{control}</div>
					<webaudio-slider
						id={id}
						width={30}
						height={size}
						min={min}
						max={max}
						value={value}
						conv="['sine', 'triangle', 'sawtooth', 'square', 'noise'][x]"
						colors={colors}
						direction="vert"
					></webaudio-slider>
					<webaudio-param
						link={id}
						fontSize="14"
						width="50"
					></webaudio-param>
				</div>
			}
			</div>
		)
	}

	// --- KEYBOARD & NOTE LOGIC --- //

	// -- TONE SIGNALS -- //
	function noteAttackSignal(key){
		console.log("Attack:", key)
		fmPolySynth.triggerAttack(key, now);
	}
	function noteReleaseSignal(key){
		console.log("Release:", key)
		fmPolySynth.triggerRelease(key, "+0.1");
	}
	function noteAttackReleaseSignal(key){
		console.log("Attack+Release:", key)
		fmPolySynth.triggerAttackRelease(key, "16n");
	}

	const Keyboard = () => {
		let keysHeld = useControlsStore((state) => state.control.keysHeld)
		let keysReleased = useControlsStore((state) => state.control.keysReleased)
		let octave = useControlsStore((state) => state.control.OSC_A.octave)
		let semitone = useControlsStore((state) => state.control.OSC_A.semitone)

		const addKeysHeld = useControlsStore((state) => state.addKeysHeld)
		const addKeysReleased = useControlsStore((state) => state.addKeysReleased)
		const removeKeysHeld = useControlsStore((state) => state.filterKeysHeld)
		const clearKeysReleased = useControlsStore((state) => state.clearKeysReleased)

		console.log("keysHeld array: ", keysHeld)
		console.log("keysReleased array: ", keysReleased)
		console.log("Octave:", octave, "Semitone:", semitone)

		// -- KEYBOARD LOGIC -- //
		function getNoteFromNumber(number) {
			const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
			// return notes[number % 12];
			return notes[(12 + (number % 12)) % 12];
		}

		useEffect(() => {
			console.log("Initializing Keyboard...")
			// console.log("keysHeld array: ", keysHeld)
			// console.log("keysReleased array: ", keysReleased)

			let keyboard = document.getElementById("keyboard");
			console.log("KEYBOARD LOADED!")

			keyboard.addEventListener("mouseover", function () {
				// Focus on keyboard element so it activates physical keyboard input
				keyboard.cv.focus();
				// console.log("mouse over keyboard!");
			});

			let heldKeys = []
			keyboard.addEventListener("change", function (e) {
				console.log("KEY CHANGE!", e.note)
				const inputKey = e.note[1]
				let keyboardOctave = Math.floor(inputKey / 12);
				let convertedNote = getNoteFromNumber(inputKey + semitone)
				let noteAndOctave = convertedNote + (keyboardOctave + octave)
				console.log("Input Key: ", inputKey)
				console.log("Keyboard Octave: ", keyboardOctave)
				console.log("Modifier Octave: ", octave)
				console.log("Converted Note: ", convertedNote)

				if (e.note[0]) {
					console.log("Held note: ", noteAndOctave)
					console.log("Modulo test: ", -1 % 12)

					// -- Update State -- //
					// DEACTIVATED FOR NOW DUE TO BUGS //
					// addKeysHeld(noteAndOctave)

					// -- Update local array -- //
					heldKeys.push(noteAndOctave)
					console.log("heldKeys array: ", heldKeys)

					// -- Direct Tone.js Trigger -- //
					noteAttackSignal(noteAndOctave)
					// noteAttackReleaseSignal(noteAndOctave)
				} else {
					console.log("Released note: ", noteAndOctave)

					// -- Update State -- //
					// DEACTIVATED FOR NOW DUE TO BUGS //
					// addKeysReleased(noteAndOctave)
					// removeKeysHeld(noteAndOctave)

					// -- Update local array -- //
					heldKeys = heldKeys.filter((key) => key !== noteAndOctave)
					console.log("heldKeys array: ", heldKeys)

					// -- Direct Tone.js Trigger -- //
					noteReleaseSignal(noteAndOctave)

					// Stop all notes if no keys are held (glitch safeguard) //
					if(heldKeys.length === 0) {
						console.log("heldKeys array: ", heldKeys)
						fmPolySynth.releaseAll()
						// clearKeysReleased()
					}
					// noteReleaseSignal(keysReleased)
				}
				// console.log("keysHeld array: ", keysHeld)
				// console.log("keysReleased array: ", keysReleased)
			});
		}, [])


		return (
			<div style={{display: 'flex', justifyContent: 'center', margin: '10px'}}>
				<webaudio-keyboard id="keyboard" keys="49" ></webaudio-keyboard>
			</div>
		)
	}

	// function setOscillatorTest () {
	// 	console.log("Setting oscillator test...")
	// 	let newSettings = {
	// 		volume: 0,
	// 		type: "sine",
	// 	}
	// 	updateSynthStore("OSC_A", "oscillator", newSettings);
	// }

	// --- JSX --- //
	return (
		<div>
			{/*<button onClick={setOscillatorTest}>Set Oscillator Test</button>*/}
			<h3>App Data</h3>
			<pre>
				{JSON.stringify(appData, null, 2)}
			</pre>
			<hr/>
			<div>
				<div style={{display: 'flex', flexDirection: 'row'}}>
					<div style={{display: 'flex', flexDirection: 'column'}}>
						<h3 style={{alignSelf: 'center'}}>Oscillator A</h3>
						<div style={{display: 'flex'}}>
							<div style={oscillatorDataContainer}>
								<h4>controls</h4>
								<pre>
									{JSON.stringify(controlsState.OSC_A, null, 2)}
								</pre>
							</div>
							<div style={oscillatorDataContainer}>
								<h4>oscillator</h4>
								<pre>
									{JSON.stringify(synthState.OSC_A.oscillator, null, 2)}
								</pre>
								<h4>envelope</h4>
								<pre>
									{JSON.stringify(synthState.OSC_A.envelope, null, 2)}
								</pre>
							</div>
						</div>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<OscillatorControls
								type={"knob"}
								group={"OSC_A"}
								control={"octave"}
								size={50}
								min={-3}
								max={3}
								step={1}
								modifier={3}
								value={controlsState.OSC_A.octave}
								colors={"#FF6188;#2C292D;#D9D9D9"}
							/>
							<OscillatorControls
								type={"knob"}
								group={"OSC_A"}
								control={"semitone"}
								size={50}
								min={-12}
								max={12}
								step={1}
								value={controlsState.OSC_A.semitone}
								colors={"#A9DC76;#2C292D;#D9D9D9"}
							/>
							<OscillatorControls
								type={"slider"}
								group={"OSC_A"}
								control={"shape"}
								size={50}
								min={0}
								max={4}
								value={controlsState.OSC_A.shape}
								colors={"#78DCE8;#2C292D;#D9D9D9"}
							/>
						</div>
					</div>
					<div style={{display: 'flex', flexDirection: 'column'}}>
						<h3 style={{alignSelf: 'center'}}>Oscillator B</h3>
						<div style={{display: 'flex'}}>
							<div style={oscillatorDataContainer}>
								<h4>controls</h4>
								<pre>
									{JSON.stringify(controlsState.OSC_B, null, 2)}
								</pre>
							</div>
							<div style={oscillatorDataContainer}>
								<h4>oscillator</h4>
								<pre>
									{JSON.stringify(synthState.OSC_B.oscillator, null, 2)}
								</pre>
								<h4>envelope</h4>
								<pre>
									{JSON.stringify(synthState.OSC_B.envelope, null, 2)}
								</pre>
							</div>
						</div>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<OscillatorControls
								type={"knob"}
								group={"OSC_B"}
								control={"octave"}
								size={50}
								min={-3}
								max={3}
								step={1}
								modifier={3}
								value={controlsState.OSC_B.octave}
								colors={"#FF6188;#2C292D;#D9D9D9"}
							/>
							<OscillatorControls
								type={"knob"}
								group={"OSC_B"}
								control={"semitone"}
								size={50}
								min={-12}
								max={12}
								step={1}
								value={controlsState.OSC_B.semitone}
								colors={"#A9DC76;#2C292D;#D9D9D9"}
							/>
							<OscillatorControls
								type={"slider"}
								group={"OSC_B"}
								control={"shape"}
								size={50}
								min={0}
								max={4}
								value={controlsState.OSC_B.shape}
								colors={"#78DCE8;#2C292D;#D9D9D9"}
							/>
						</div>
					</div>
				</div>
				<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
					<div style={{display: 'flex', flexDirection: 'column'}}>
						<h3 style={{alignSelf: 'center'}}>A/B Frequency Modulation</h3>
						<div style={{display: 'flex', alignSelf: 'center'}}>
							<div style={oscillatorDataContainer}>
								<h4>controls</h4>
								<pre>
									{JSON.stringify(controlsState.FM, null, 2)}
								</pre>
							</div>
							<div style={oscillatorDataContainer}>
								<h4>settings</h4>
								<pre>
									{JSON.stringify(synthState.FM, null, 2)}
								</pre>
							</div>
						</div>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<OscillatorControls
								type={"knob"}
								group={"FM"}
								control={"harmonicity"}
								size={50}
								min={0}
								max={5}
								step={.01}
								modifier={3}
								value={controlsState.FM.harmonicity}
								colors={"#FF6188;#2C292D;#D9D9D9"}
							/>
							<OscillatorControls
								type={"knob"}
								group={"FM"}
								control={"depth"}
								size={50}
								min={1}
								max={100}
								step={.1}
								value={controlsState.FM.depth}
								colors={"#A9DC76;#2C292D;#D9D9D9"}
							/>
						</div>
					</div>
				</div>
				<Keyboard/>
			</div>
		</div>
	)
}

export default Synth
