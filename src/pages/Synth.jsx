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
			shape: 'sin',
			attack: 1,
			decay: 500,
			sustain: 1,
			release: 1000,
		},
		settings: {
			oscillator: {
				volume: -5,
				type: "square"
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
	setSynthData: (targetGroup, targetSubgroup, targetControl, payload) =>
	set(
		produce((draft) => {
			draft.synth[targetGroup][targetSubgroup][targetControl] = payload
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

	const OscillatorControls = ({group, control, size, min, max, value, modifier, colors}) => {
		// console.log("OscillatorControls:", group, control, size, min, max, value, colors)

		let testString = "oscillatorA_atom"

		const [oscA, setOscA] = useAtom(oscillatorA_atom)

		const zustandState = useSynthStore((state) => state)
		const updateZustandState = useSynthStore((state) => state.setSynthData)

		let controlElement;
		let controlOutput;

		let key = "oscA"

		let id = group + "_" + control + "_control"
		// console.log("ID:", id)
		controlElement = document.getElementById(id);

		if(controlElement){
			controlElement.addEventListener('change', function (e) {
				console.log("ID:", e.target.id, "Val:", e.target.value);
				// CONTROL OUTPUT
				controlOutput = modifier + e.target.value;
				// SETTING
				// const setOSC_A = useSynthStore((state) => state.setOSC_A(octaveModifier));
				function setControl(control, value){
					setOscA({...oscA, controls: {...oscA.controls, [control]: value}})
				}
				setControl(control, e.target.value)
				updateZustandState(group, "controls", control, e.target.value)
				updateZustandState(group, "settings", "oscillator", e.target.value)
				// setOscA({...oscA, controls: {...oscA.controls, octave: e.target.value}})
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
			</div>
		)
	}

	// --- KEYBOARD & NOTE LOGIC --- //

	// TODO: Implement keyboard & held keys array for further testing

	const startNote = 0
	let octave = oscA.controls.octave
	let semitone = oscA.controls.semitone
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

	const zustandState = useSynthStore((state) => state)

	// --- JSX --- //
	return (
		<div>
			<WindowLoadListener/>
			<DebugAtoms/>
			{/*<pre>*/}
				Synth Loaded: {JSON.stringify(synthLoaded, null, 2)}
			{/*</pre>*/}
			<pre>
				Tone Running: {JSON.stringify(toneRunning, null, 2)}
			</pre>
			<pre>
				Keys Held: {JSON.stringify(keysHeld, null, 2)}
			</pre>
			{!toneRunning ?
				<div>
					<button onClick={startContext}>Start Tone!</button>
				</div>
				:
				<div>
					<pre>
						{JSON.stringify(zustandState, null, 2)}
					</pre>
					<ChangeSynthJSON/>
					<ToneTrigger/>
					<hr/>
					<div style={controlContainer}>
						<OscillatorControls
							group={"OSC_A"}
							control={"octave"}
							size={60}
							min={-3}
							max={3}
							modifier={3}
							value={oscA.controls.octave}
							colors={"#FF6188;#2C292D;#D9D9D9"}
						/>
						<OscillatorControls
							group={"OSC_A"}
							control={"semitone"}
							size={60}
							min={-3}
							max={3}
							modifier={0}
							value={oscA.controls.semitone}
							colors={"#A9DC76;#2C292D;#D9D9D9"}
						/>
					</div>
				</div>
			}
		</div>
	)
}

export default Synth
