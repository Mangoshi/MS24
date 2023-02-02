import * as Tone from 'tone'

import OscillatorGroup from '../components/OscillatorGroup'

import frame_svg from './assets/Frame.svg'
import {useRef} from "react";

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
	width: '100%',
	height: '100%',
	backgroundColor: 'grey'
}

const Synth = () => {
	const parentRef = useRef(null);
	return (
		<div style={containerStyling}>
			<div ref={parentRef} style={frameStyling2}>
					<OscillatorGroup parentRef={parentRef} x={100} y={200} heightPercent={5} widthPercent={5}/>
			</div>
		</div>
	);
}

export default Synth;
