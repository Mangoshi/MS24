import * as Tone from 'tone'

import OscillatorGroup from '../components/OscillatorGroup'

import frame_svg from './assets/Frame.svg'

//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

function playNote() {
	//play a middle 'C' for the duration of an 8th note
	synth.triggerAttackRelease("C4", "8n");
}

const containerStyling = {
	aspectRatio: '16/9',
	position: 'relative',
}

const frameStyling1 = {
	width: '100%',
	height: '100%',
	backgroundImage: `url(${frame_svg})`,
	backgroundSize: 'contain',
	backgroundRepeat: 'no-repeat',
	position: 'relative',
}

const frameStyling2 = {
	width: '1280px',
	aspectRatio: '16/9',
	backgroundColor: 'grey'
}

const Synth = () => {
	return (
		<div style={containerStyling}>
			<div style={frameStyling2}>
					<OscillatorGroup x={20} y={100} name={"OSC1"}/>
					{/*<OscillatorGroup x={700} y={100} name={"OSC2"}/>*/}
			</div>
		</div>
	);
}

export default Synth;
