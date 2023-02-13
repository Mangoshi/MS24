import './App.css'

import Synth from './pages/Synth'

function App() {
	// TODO: Do AudioContext user gesture check here?
	//  - Pass Tone instance to Synth component?
	// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
	return (
		<div className="App">
			<Synth/>
		</div>
	)
}

export default App
