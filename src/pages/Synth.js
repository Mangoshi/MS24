import * as Tone from 'tone'

import OscillatorGroup from '../components/OscillatorGroup'

import frame from './assets/Frame.svg'

//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

function playNote() {
	//play a middle 'C' for the duration of an 8th note
	synth.triggerAttackRelease("C4", "8n");
}

const frameStyling = {
	width: '100%'
}

const Synth = () => {
	return (
		<div>
			<h1>Inika</h1>
			<h2>Inconsolata</h2>
			<button onClick={playNote}>Play Note</button>
			<img src={frame} alt='Frame SVG' style={frameStyling}/>
			<OscillatorGroup/>
		</div>
	);
}

export default Synth;
