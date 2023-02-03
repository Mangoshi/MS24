import * as Tone from 'tone'

import OscillatorGroup from '../components/OscillatorGroup'

import frame_svg from './assets/Frame.svg'

import React from "react";

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

class TestClass extends React.Component {
	render(x,y) {
		let oscillatorGroupContainerStyle = {
			position: 'absolute',
			left: x,
			top: y,
			display: 'flex',
			flexDirection: 'row',
			backgroundColor: 'red',
			width: '1200px'
		}
		return (
			<div style={oscillatorGroupContainerStyle}>
				test
			</div>
		);
	}
}

function TestClass2({x, y, bg}) {
	let oscillatorGroupContainerStyle = {
		position: 'absolute',
		left: x,
		top: y,
		display: 'flex',
		flexDirection: 'row',
		backgroundColor: bg,
		width: '1200px'
	}
	return (
		<div style={oscillatorGroupContainerStyle}>
			test
		</div>
	);
}

const Synth = () => {
	return (
		<div style={containerStyling}>
			<div style={frameStyling2}>
				<TestClass x={0} y={0} />
				<TestClass2 x={0} y={20} bg='lime' />
				<OscillatorGroup x={20} y={100} name={"OSC-A"} enabled={1}/>
				{/*<OscillatorGroup x={800} y={100} name={"OSC-B"} enabled={0}/>*/}
			</div>
		</div>
	);
}

export default Synth;
