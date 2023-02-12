import {atom, useAtom, useSetAtom} from 'jotai'
import { useAtomsDebugValue } from 'jotai-devtools'
import * as Tone from 'tone'
import {useState} from "react";
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import produce from "immer";

// --- DEBUG --- //
const DebugAtoms = () => {
	useAtomsDebugValue()
	return null
}

// --- TONE JS --- //
// -- Setup & Util -- //

const now = Tone.now()
// console.log(Tone.context.state)

// -- JSON -- //
let defaultAppData = {
	loaded: false,
	running: false,
	keysHeld: [],
}

let defaultSynthSettings = {
	OSC_A: {
		name: 'OSC A',
		enabled: 1,
		pos: {
			x: 20,
			y: 140
		},
		controls: {
			octave: 0,
			semitone: 0,
			quantize: 0,
			shape: 0,
			attack: 1,
			decay: 500,
			sustain: 1,
			release: 1000,
		},
		settings: {
			oscillator: {
				volume: -5,
				type: "saw"
			},
			envelope: {
				attack: 1,
				decay: 0.2,
				sustain: 1.0,
				release: 2
			},
			filter: {
				Q: 10,
				type: "highpass",
				rolloff: -24
			},
			filterEnvelope: {
				attack: 0,
				decay: 0.32,
				sustain: 0.9,
				release: 3,
				baseFrequency: 150,
				octaves: 4
			}
		}
	}
}

// const polySynth = new Tone.PolySynth(Tone.MonoSynth).toDestination()
const autoFilter = new Tone.AutoFilter("4n").toDestination().start();
const polySynth = new Tone.PolySynth(Tone.MonoSynth).connect(autoFilter)

// --- STATE --- //
// -- Synth General -- //
const windowLoadedAtom = atom(defaultAppData.loaded)
const toneAtom = atom(defaultAppData)
const toneRunningAtom = atom(defaultAppData.running)
const keysHeldAtom = atom(defaultAppData.keysHeld)
// -- Synth Components -- //
const oscillatorA_atom = atom(defaultSynthSettings.OSC_A)
oscillatorA_atom.debugLabel = 'atomOscA'

// --- ZUSTAND --- //
// TODO: Convert Jotai logic above to Zustand logic
const useSynthStore = create((set) => ({
	synth: defaultSynthSettings,
	setSynthControls: (targetGroup, targetSubgroup, targetControl, payload) =>
	set(
		produce((draft) => {
			draft.synth[targetGroup][targetSubgroup][targetControl] = payload
		})
	),
	setSynthSettings: (targetGroup, targetSubgroup, targetControl, payload) =>
	set(
		produce((draft) => {
			draft.synth[targetGroup].settings[targetSubgroup][targetControl] = payload
		})
	),
}))

// console.log(useSynthStore.getState())

// const PlayTest = () => {
// 	const [oscA, setOscA] = useAtom(oscillatorA_atom)
// 	let settings = oscA.settings
// 	console.log(settings)
// 	// polySynth.set(settings)
// 	const play = () => polySynth.triggerAttackRelease("C4", "8n");
// 	return (
// 		<button onClick={play}>Play Test!</button>
// 	)
// }

// --- FUNCTIONAL COMPONENTS --- //
const ChangeSynthJSON = () => {
	const [oscA, setOscA] = useAtom(oscillatorA_atom)
	let oscASetTest
	if(oscA.enabled){
		oscASetTest = () => setOscA({
			...oscA,
			name: 'OSC A: DISABLED',
			enabled: 0,
			controls: {
				...oscA.controls,
				octave: 2},
			settings: {
				...oscA.settings,
				oscillator: {
					...oscA.settings.oscillator,
					type: 'sawtooth'
				}
			}
		})
		polySynth.set({...oscA.settings})
	} else {
		oscASetTest = () => setOscA({
			...oscA,
			name: 'OSC A: ENABLED',
			enabled: 1,
			controls: {
				...oscA.controls,
				octave: 3},
			settings: {
				...oscA.settings,
				oscillator: {
					...oscA.settings.oscillator,
					type: 'square'
				}
			}
		})
		polySynth.set({...oscA.settings})

	}
	return (
		<div>
			<button onClick={oscASetTest}>Set JSON!</button>
		</div>

	)
}

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

function Synth() {

	// --- ATOMS --- //
	let [toneRunning, setToneRunning] = useAtom(toneRunningAtom)
	let [synthLoaded, setSynthLoaded] = useAtom(windowLoadedAtom)
	let [keysHeld, setKeysHeld] = useAtom(keysHeldAtom)
	let [oscA] = useAtom(oscillatorA_atom)
	let [tone] = useAtom(toneAtom)

	let synthData = useSynthStore((state) => state.synth)

	// --- CORE --- //
	const setSynthLoadedTrue = () => setSynthLoaded(true)
	const WindowLoadListener = () => {
		const [windowLoaded] = useAtom(windowLoadedAtom)
		const setLoaded = () => {
			setSynthLoadedTrue()
			console.log("WL:", windowLoaded)
		}
		window.onload = function () {
			setLoaded()
		}
	}

	// --- TONE CONTEXT --- //
	const setToneRunningTrue = () => setToneRunning(true)
	const startContext = () => {
		console.log("Tone is: ", Tone.context.state)
		document.body.addEventListener("click", () => {
			Tone.context.resume().then(() => {
				console.log("Tone is: ", Tone.context.state)
				setToneRunningTrue()
			})
		})
		console.log("Tone Running Atom:", toneRunning)
	}

	const OscillatorControls = ({type, group, control, size, min, max, value, modifier, colors}) => {
		// console.log("OscillatorControls:", group, control, size, min, max, value, colors)

		let testString = "oscillatorA_atom"

		const [oscA, setOscA] = useAtom(oscillatorA_atom)

		const synthState = useSynthStore((state) => state)
		const updateSynthControls = useSynthStore((state) => state.setSynthControls)
		const updateSynthSettings = useSynthStore((state) => state.setSynthSettings)

		let controlElement;
		let controlOutput;

		let key = "oscA"

		let id = group + "_" + control + "_control"
		// console.log("ID:", id)
		controlElement = document.getElementById(id);

		if(controlElement){
			controlElement.addEventListener('change', function (e) {
				console.log("ID:", e.target.id, "Val:", e.target.value);

				// CONTROL PROCESSING
				controlOutput = modifier + e.target.value;

				// SET STATE
				// const setOSC_A = useSynthStore((state) => state.setOSC_A(octaveModifier));
				function setControl(control, value){
					setOscA({...oscA, controls: {...oscA.controls, [control]: value}})
				}
				setControl(control, e.target.value)
				updateSynthControls(group, "controls", control, e.target.value)
				// updateZustandState(group, "settings", "oscillator", e.target.value)
				// setOscA({...oscA, controls: {...oscA.controls, octave: e.target.value}})

				// SET SYNTH
				if(control === "shape"){
					let newType
					let newVolume
					if(e.target.value === 0){
						newType = "sine"
						newVolume = -12
					} else if(e.target.value === 1){
						newType = "square"
						newVolume = -12
					} else if(e.target.value === 2){
						newType = "triangle"
						newVolume = -12
					} else if(e.target.value === 3){
						newType = "sawtooth"
						newVolume = -12
					} else {
						newType = "sine"
						newVolume = -12
					}
					updateSynthSettings(group, "oscillator", "type", newType)
					updateSynthSettings(group, "oscillator", "volume", newVolume)
					polySynth.set({...oscA, oscillator: {volume: newVolume, type: newType}})
				}
				// polySynth.set({...oscA, oscillator: {...oscA.oscillator, octave: controlOutput}})
				// LOGGING
				console.log("Octave modifier:", controlOutput);
			});
			// console.log("Window Loaded!");
		}
		let dynamicGroup = {[group] : {"controls": {[control]: value}}}
		console.log("Dynamic Group:", `${group}-${control}`, dynamicGroup)
		let dynamicGroupValue = dynamicGroup[group].controls[control]
		console.log("Dynamic Group Value:", `${group}-${control}`, dynamicGroupValue)
		return (
			<div>
				{ type === "knob" &&
					<div style={controlGroup}>
						<webaudio-knob
							id={id}
							diameter={size}
							min={min}
							max={max}
							value={dynamicGroupValue}
							colors={colors}
						></webaudio-knob>
						<webaudio-param
							link={id}
							fontSize="14"
						></webaudio-param>
					</div>
				}
				{ type === "slider" &&
					<div style={controlGroup}>
						<webaudio-slider
							id={id}
							width={30}
							height={size}
							min={min}
							max={max}
							value={dynamicGroupValue}
							conv="['sin', 'triangle', 'saw', 'square', 'noise'][x]"
							colors={colors}
							direction="vert"
						></webaudio-slider>
						<webaudio-param
							link={id}
							fontSize="14"
						></webaudio-param>
					</div>
				}
			</div>
		)
	}

	// --- KEYBOARD & NOTE LOGIC --- //

	// TODO: Implement keyboard & held keys array for further testing

	const startNote = 0
	let octave = synthData.OSC_A.controls.octave
	let semitone = synthData.OSC_A.controls.semitone
	let keyboardOctave = Math.floor(startNote/12);
	function getNoteFromNumber(number) {
		const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		// return notes[number % 12];
		return notes[(12 + (number % 12)) % 12];
	}

	let convertedNote = getNoteFromNumber(startNote + semitone)
	let noteAndOctave = convertedNote + (keyboardOctave + octave)


	// --- TONE SIGNALS --- //
	const noteAttackSignal = () => {
		console.log("Note and Octave:", noteAndOctave)
		polySynth.triggerAttack(noteAndOctave, now);
	}
	const noteReleaseSignal = () => {
		console.log("Note and Octave:", noteAndOctave)
		polySynth.triggerRelease(noteAndOctave, "+0.1");
	}
	const ToneTrigger = () => {
		return (
			<div>
				<button onClick={noteAttackSignal}>Play Test!</button>
				<button onClick={noteReleaseSignal}>Stop Test!</button>
			</div>
		)
	}

	const oscA_state = useSynthStore((state) => state.synth.OSC_A)

	const oscA_dataContainer_style = {
		backgroundColor: 'black',
		paddingLeft: '10px',
		paddingRight: '10px',
		margin: '2.5px'
	}

	// --- JSX --- //
	return (
		<div>
			<WindowLoadListener/>
			<DebugAtoms/>
			<h3>App Data</h3>
			{/*<pre>*/}
				Synth Loaded: {JSON.stringify(synthLoaded, null, 2)}
			{/*</pre>*/}
			<pre>
				Tone Running: {JSON.stringify(toneRunning, null, 2)}
			</pre>
			<pre>
				Keys Held: {JSON.stringify(keysHeld, null, 2)}
			</pre>
			<hr/>
			{!toneRunning ?
				<div>
					<button onClick={startContext}>Start Tone!</button>
				</div>
				:
				<div>
					<h3>OSC_A</h3>
					<div style={{display: 'flex'}}>
						<div style={oscA_dataContainer_style}>
							<h4>controls</h4>
							<pre>
								{JSON.stringify(oscA_state.controls, null, 2)}
							</pre>
						</div>
						<div style={oscA_dataContainer_style}>
							<h4>oscillator</h4>
							<pre>
								{JSON.stringify(oscA_state.settings.oscillator, null, 2)}
							</pre>
						</div>
						<div style={oscA_dataContainer_style}>
							<h4>envelope</h4>
							<pre>
								{JSON.stringify(oscA_state.settings.envelope, null, 2)}
							</pre>
						</div>
						<div style={oscA_dataContainer_style}>
							<h4>filter</h4>
							<pre>
								{JSON.stringify(oscA_state.settings.filter, null, 2)}
							</pre>
						</div>
						<div style={oscA_dataContainer_style}>
							<h4>filterEnvelope</h4>
							<pre>
								{JSON.stringify(oscA_state.settings.filterEnvelope, null, 2)}
							</pre>
						</div>
					</div>
					{/*<ChangeSynthJSON/>*/}
					<ToneTrigger/>
					<hr/>
					<div style={controlContainer}>
						<OscillatorControls
							type={"knob"}
							group={"OSC_A"}
							control={"octave"}
							size={100}
							min={-3}
							max={3}
							modifier={3}
							value={oscA_state.controls.octave}
							colors={"#FF6188;#2C292D;#D9D9D9"}
						/>
						<OscillatorControls
							type={"knob"}
							group={"OSC_A"}
							control={"semitone"}
							size={100}
							min={-3}
							max={3}
							value={oscA_state.controls.semitone}
							colors={"#A9DC76;#2C292D;#D9D9D9"}
						/>
						<OscillatorControls
							type={"slider"}
							group={"OSC_A"}
							control={"shape"}
							size={100}
							min={0}
							max={4}
							value={oscA_state.controls.shape}
							colors={"#78DCE8;#2C292D;#D9D9D9"}
						/>
					</div>
				</div>
			}
		</div>
	)
}

export default Synth
