import './OscillatorGroup.css'
import Sketch from 'react-p5'
import * as Tone from 'tone'

const OscillatorGroup = ({x, y, name, enabled}) => {

	let oscillatorGroupContainerStyle = {
		position: 'absolute',
		left: x,
		top: y,
		display: 'flex',
		flexDirection: 'row',
		backgroundColor: 'darkgrey'
	}

	const leftContainer = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		backgroundColor: 'darkgrey'
	}

	const toggleLabelGroupStyle = {
		display: 'flex',
		backgroundColor: 'lightgrey',
		margin: '10px'
	}

	const mainControlsGroup = {
		display: 'flex',
		justifySelf: 'center',
		alignSelf: 'end',
		backgroundColor: 'darkgrey'
	}

	const controlSubGroupStyle = {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: 'lightgrey',
		margin: '10px',
		alignItems: 'center'
	}

	const oscGroupLabelStyle = {
		paddingBottom: '5px',
		fontSize: '20px',
		alignSelf: 'center',
	}

	const oscGroupValueStyle = {
		paddingTop: '5px',
		alignSelf: 'center'
	}

	const rightContainer = {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: 'black',
		padding: '10px'
	}

	const envGroupStyle = {
		display: 'flex',
		backgroundColor: 'darkgrey'
	}


	const bigKnobParams = {
		diameter: 100,
	}

	const sliderParams = {
		width: 30,
		height: 100,
	}

	const smallKnobParams = {
		diameter: 50,
	}

	const componentLabel = {
		fontSize: '24px',
		alignSelf: 'center',
		paddingLeft: '5px'
	}

	// window.onload=function(){
	// 	console.log("Window Loaded");
	// 	let mainToggle = document.getElementById(name+"_toggle")
	// 	mainToggle.addEventListener('change', function(e) {
	// 		console.log("ID:",e.target.id, "Val:", e.target.value);
	// 	});
	// 	let knobs = document.getElementsByTagName('webaudio-knob');
	// 	for (let i = 0; i < knobs.length; i++) {
	// 		const knob = knobs[i];
	// 		knob.addEventListener('change', function(e) {
	// 			console.log("ID:",e.target.id, "Val:", e.target.value);
	// 		});
	// 	}
	// 	let slider = document.getElementById(name+"_shape_control");
	// 	slider.addEventListener('change', function(e) {
	// 		console.log("ID:",e.target.id, "Val:", e.target.value);
	// 	});
	// 	const keyboard = document.getElementById('keyboard');
	// 	keyboard.addEventListener('change', function(e) {
	// 		if(e.note[0])
	// 			console.log("Note-On:"+e.note[1]);
	// 		else
	// 			console.log("Note-Off:"+e.note[1]);
	// 	});
	// }



	const visualiserStyle = {
		width: '100%',
		height: '150px',
		backgroundColor: 'lightgrey',
		borderRadius: '20px',
		marginTop: '10px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	}

	const setup = (p5, canvasParentRef) => {
		p5.createCanvas(278, 120).parent(canvasParentRef)
	}
	const draw = p5 => {
		p5.background('lightgrey')
		// p5.textSize(16)
		// p5.text('I AM CANVAS', 85, 69)
	}

	// let slider = document.getElementById(name+"_shape_control");
	//
	// let slider_string_val
	// console.log(slider.value)
	// switch (slider.value) {
	// 	case 0: slider_string_val = "sine"; break;
	// 	case 1: slider_string_val = "sawtooth"; break;
	// 	case 2: slider_string_val = "square"; break;
	// 	case 3: slider_string_val = "triangle"; break;
	// 	case 4: slider_string_val = "sine"; break;
	// 	default: slider_string_val = "sine"; break;
	// }
	//
	// console.log(slider_string_val)
	//
	// const oscillator = new Tone.OmniOscillator({
	// 	"frequency" : 40,
	// 	volume: -20,
	// 	type: slider_string_val.toString()
	// }).toDestination();

	const startContext = () => {
		console.log("Tone is: ", Tone.context.state)
		document.body.addEventListener("click", () => {
			Tone.context.resume().then(r => console.log("Tone is: ", Tone.context.state))
		})
	}

	const oscillator = new Tone.OmniOscillator({
		"frequency" : 440,
		volume: -20,
		type: "sine"
	}).toDestination();

	const synth = new Tone.Synth({
		oscillator: {
			volume: -20,
			type: "sine"
		},
		envelope: {
			attack: 0.1,
			decay: 0.001,
			sustain: 1,
			release: 20
		}
	}).toDestination();

	function makeSynth() {
		let synth2 = new Tone.MonoSynth();
		let synthJSON = {
			oscillator: {
				type: "sawtooth",
				volume: -20
			},
			filter: {
				Q: 2,
				type: "lowpass",
				rolloff: -12
			},
			envelope: {
				attack: 0.5,
				decay: 3,
				sustain: 0,
				release: 0.45
			},
			filterEnvelope: {
				attack: 1,
				decay: 0.32,
				sustain: 0.9,
				release: 3,
				baseFrequency: 150,
				octaves: 4
			}
		}
		synth2.set(synthJSON)

		let effect1, effect2, effect3;

		// make connections
		synth2.connect(Tone.Destination);

		// define deep dispose function
		function deep_dispose() {
			if(synth2 !== undefined && synth2 != null) {
				synth2.dispose();
				synth2 = null;
			}
		}

		return {
			synth2: synth2,
			deep_dispose: deep_dispose
		};
	}


	let synth2 = makeSynth().synth2;

	const playSound = () => oscillator.start()
	const stopSound = () => oscillator.stop()
	const triggerSynth = () => synth.triggerAttackRelease("A3", 1)
	const triggerSynth2 = () => synth2.triggerAttackRelease("A2", 1)

	window.addEventListener('load', function(){
		console.log("Window Loaded");
		let mainToggle = document.getElementById(name+"_toggle")
		mainToggle.addEventListener('change', function(e) {
			console.log("ID:",e.target.id, "Val:", e.target.value);
		});
		let knobs = document.getElementsByTagName('webaudio-knob');
		for (let i = 0; i < knobs.length; i++) {
			const knob = knobs[i];
			knob.addEventListener('change', function(e) {
				console.log("ID:",e.target.id, "Val:", e.target.value);
			});
		}
		let slider = document.getElementById(name+"_shape_control");
		slider.addEventListener('change', function(e) {
			console.log("ID:",e.target.id, "Val:", e.target.value);
		});
		const keyboard = document.getElementById('keyboard');
		keyboard.addEventListener('change', function(e) {
			if (e.note[0]) {
				console.log("Note-On:" + e.note[1]);
				// synth.triggerAttackRelease('B3', 1)
				oscillator.frequency.value = (e.note[1]+1)*100
				oscillator.start()
			}
			else {
				console.log("Note-Off:"+e.note[1]);
				oscillator.stop()
			}
		});
	})


	return (
		<div>
			<div style={oscillatorGroupContainerStyle}>
				<button onClick={startContext}>
					context
				</button>
				<button onClick={playSound}>
					start
				</button>
				<button onClick={stopSound}>
					stop
				</button>
				<button onClick={triggerSynth}>
					synth
				</button>
				<button onClick={triggerSynth2}>
					synth2
				</button>
				{/* Main Controls */}
				<div className="leftContainer" style={leftContainer}>
					<div className="toggle_label_group" style={toggleLabelGroupStyle}>
						<webaudio-switch
							id={name+"_toggle"}
							colors="#A9DC76;#2C292D;#D9D9D9"
							value={enabled}
						></webaudio-switch>
						<div className="component_label" style={componentLabel}>{name}</div>
					</div>
					<div className="main_controls_group" style={mainControlsGroup}>
						<div className="octave_control_group" style={controlSubGroupStyle}>
							<div className="osc_group_label" style={oscGroupLabelStyle}>Octave</div>
							<webaudio-knob
								id={name+"_octave_control"}
								diameter={bigKnobParams.diameter}
								min="-6"
								max="6"
								value="0"
								colors="#FF6188;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_octave_control"}
								style={oscGroupValueStyle}
								fontSize="14"
							></webaudio-param>
						</div>
						<div className="semitone_control_group" style={controlSubGroupStyle}>
							<div className="control_label" style={oscGroupLabelStyle}>Semitone</div>
							<webaudio-knob
								id={name+"_semitone_control"}
								diameter={bigKnobParams.diameter}
								min="-12"
								max="12"
								value="0"
								colors="#A9DC76;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_semitone_control"}
								style={oscGroupValueStyle}
								fontSize="14"
							></webaudio-param>
						</div>
						<div className="quantize_control_group" style={controlSubGroupStyle}>
							<div className="quantize_label" style={oscGroupLabelStyle}>Quantize</div>
							<webaudio-knob
								id={name+"_quantize_control"}
								diameter={bigKnobParams.diameter}
								min="0"
								max="100"
								colors="#FFD866;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_quantize_control"}
								style={oscGroupValueStyle}
								fontSize="14"
							></webaudio-param>
						</div>
						<div className="shape_control_group" style={controlSubGroupStyle}>
							<div className="shape_label" style={oscGroupLabelStyle}>Shape</div>
							<webaudio-slider
								id={name+"_shape_control"}
								width={sliderParams.width}
								height={sliderParams.height}
								min="0"
								max="4"
								value="4"
								conv="['noise','tri','sqr','saw','sin'][x]"
								colors="#78DCE8;#2C292D;#D9D9D9"
								direction="vert"
							></webaudio-slider>
							<webaudio-param
								link={name+"_shape_control"}
								style={oscGroupValueStyle}
								fontSize="14"
								width="50"
							></webaudio-param>
						</div>
					</div>
				</div>
				{/* Oscillator ADSR Envelope Controls + Visualizer */}
				<div className="rightContainer" style={rightContainer}>
					<div className="envelope_control_group" style={envGroupStyle}>
						<div className="attack_control_group" style={controlSubGroupStyle}>
							<div className="attack_label" style={oscGroupLabelStyle}>ATK</div>
							<webaudio-knob
								id={name+"_attack_control"}
								diameter={smallKnobParams.diameter}
								min="0"
								max="1000"
								value="0.5"
								colors="#AB9DF2;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_attack_control"}
								style={oscGroupValueStyle}
							></webaudio-param>
						</div>
						<div className="decay_control_group" style={controlSubGroupStyle}>
							<div className="decay_label" style={oscGroupLabelStyle}>DEC</div>
							<webaudio-knob
								id={name+"_decay_control"}
								diameter={smallKnobParams.diameter}
								min="0"
								max="10000"
								value="500"
								colors="#AB9DF2;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_decay_control"}
								style={oscGroupValueStyle}
							></webaudio-param>
						</div>
						<div className="sustain_control_group" style={controlSubGroupStyle}>
							<div className="sustain_label" style={oscGroupLabelStyle}>SUS</div>
							<webaudio-knob
								id={name+"_sustain_control"}
								diameter={smallKnobParams.diameter}
								min="0"
								max="20"
								value="0"
								colors="#AB9DF2;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_sustain_control"}
								style={oscGroupValueStyle}
							></webaudio-param>
						</div>
						<div className="release_control_group" style={controlSubGroupStyle}>
							<div className="release_label" style={oscGroupLabelStyle}>REL</div>
							<webaudio-knob
								id={name+"_release_control"}
								diameter={smallKnobParams.diameter}
								min="0"
								max="10000"
								value="1000"
								colors="#AB9DF2;#2C292D;#D9D9D9"
							></webaudio-knob>
							<webaudio-param
								link={name+"_release_control"}
								style={oscGroupValueStyle}
							></webaudio-param>
						</div>
					</div>
					<div className={name+"_visualiser"} style={visualiserStyle}>
						<Sketch setup={setup} draw={draw} />
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', top: 450, left: 20}}>
				<webaudio-keyboard id="keyboard" keys="49"></webaudio-keyboard>
			</div>
		</div>
	);
}

export default OscillatorGroup;
