import './App.css'
import Synth from './pages/Synth'
import { create } from "zustand";
import produce from "immer";
import useScript from './hooks/useScript';
import {useEffect} from "react";
import * as Tone from "tone";

// -- JSON -- //
let defaultAppData = {
	windowLoaded: false,
	toneRunning: false
}

// --- zSTATE --- //
const useAppDataStore = create((set) => (
	{
	windowLoaded: defaultAppData.windowLoaded,
	toneRunning: defaultAppData.toneRunning,
	setWindowLoaded: (payload) =>
		set(
			produce((draft) => {
				draft.windowLoaded = payload
			})
		),
	setToneRunning: (payload) =>
		set(
			produce((draft) => {
				draft.toneRunning = payload
			})
		)
	}
))

function App() {

	// --- GUI LIBRARY IMPORT --- //
	useScript('../webaudio-controls.js');

	// --- ZUSTAND STATE --- //
	const [appData] = useAppDataStore((state) => [state])

	// --- WINDOW STATE --- //
	useEffect(() => {
		window.addEventListener('load', (event) => {
			console.log("Window Loaded")
			appData.setWindowLoaded(true)
		})
	}, [])

	// --- TONE CONTEXT --- //
	const startContext = () => {
		if (Tone.context.state !== "running") {
			Tone.context.resume().then(() => {
				console.log("Tone is now:", Tone.context.state);
				appData.setToneRunning(true);
			});
		}
	}

	// --- RENDER --- //
	return (
		<div className="App" >
			{
				appData.toneRunning ?
				<Synth appData={appData}/> :
				<div className="clickMe" onClick={startContext}>Click me to start!</div>
			}
		</div>
	)
}

export default App
