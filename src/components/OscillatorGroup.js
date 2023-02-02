
const OscillatorGroup = ({x, y, name}) => {

	const knobStyle = {
		paddingLeft: '5px',
		paddingRight: '5px'
	}

	const sliderStyle = {
		paddingLeft: '10px'
	}

	const controlSubGroupStyle = {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: 'lightgrey',
		margin: '10px'
	}

	const oscGroupLabelStyle = {
		paddingBottom: '5px',
		fontSize: '18px',
		alignSelf: 'center'
	}

	const oscGroupValueStyle = {
		paddingTop: '5px',
		alignSelf: 'center'
	}

	const oscillatorControlGroup = {
		display: 'flex',
		justifySelf: 'center',
		alignSelf: 'end',
		backgroundColor: 'salmon'
	}

	const envelopeGroupStyle = {
		display: 'flex',
		backgroundColor: 'lightpink'
	}

	const envelopeVisualiserGroupStyle = {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: 'red'
	}

	const visualiserStyle = {
		width: '100%',
		height: '175px',
		backgroundColor: 'black'
	}
	return (
		<div style={{
			top: y,
			left: x,
			position: 'absolute',
			display: 'flex',
			flexDirection: 'row'
		}}>
			{/* Main Oscillator Controls */}
			<div className="oscillator_control_group" style={oscillatorControlGroup}>
				<div className="octave_control_group" style={controlSubGroupStyle}>
					<div className="osc_group_label" style={oscGroupLabelStyle}>Octave</div>
					<webaudio-knob
						id={name+"_octave_control"}
						diameter="100"
						min="0"
						max="100"
						colors="#FF6188;#2C292D;#D9D9D9"
						style={knobStyle}
					></webaudio-knob>
					<webaudio-param
						link={name+"_octave_control"}
						style={oscGroupValueStyle}
					></webaudio-param>
				</div>
				<div className="semitone_control_group" style={controlSubGroupStyle}>
					<div className="control_label" style={oscGroupLabelStyle}>Semitone</div>
					<webaudio-knob
						id={name+"_semitone_control"}
						diameter="100"
						min="0"
						max="100"
						colors="#A9DC76;#2C292D;#D9D9D9"
						style={knobStyle}
					></webaudio-knob>
					<webaudio-param
						link={name+"_semitone_control"}
						style={oscGroupValueStyle}
					></webaudio-param>
				</div>
				<div className="quantize_control_group" style={controlSubGroupStyle}>
					<div className="quantize_label" style={oscGroupLabelStyle}>Quantize</div>
					<webaudio-knob
						id={name+"_quantize_control"}
						diameter="100"
						min="0"
						max="100"
						colors="#FFD866;#2C292D;#D9D9D9"
						style={knobStyle}
					></webaudio-knob>
					<webaudio-param
						link={name+"_quantize_control"}
						style={oscGroupValueStyle}
					></webaudio-param>
				</div>
				<div className="shape_control_group" style={controlSubGroupStyle}>
					<div className="shape_label" style={oscGroupLabelStyle}>Shape</div>
					<webaudio-slider
						id={name+"_shape_control"}
						width="30"
						height="100"
						colors="#78DCE8;#2C292D;#D9D9D9"
						direction="vert"
						style={sliderStyle}
					></webaudio-slider>
					<webaudio-param
						link={name+"_shape_control"}
						style={oscGroupValueStyle}
					></webaudio-param>
				</div>
			</div>
			{/* Oscillator ADSR Envelope Controls + Visualizer */}
			<div className="envelope_visualiser_group" style={envelopeVisualiserGroupStyle}>
				<div className="envelope_control_group" style={envelopeGroupStyle}>
					<div className="attack_control_group" style={controlSubGroupStyle}>
						<div className="attack_label" style={oscGroupLabelStyle}>ATK</div>
						<webaudio-knob
							id={name+"_attack_control"}
							diameter="50"
							min="0"
							max="100"
							colors="#AB9DF2;#2C292D;#D9D9D9"
							style={knobStyle}
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
							diameter="50"
							min="0"
							max="100"
							colors="#AB9DF2;#2C292D;#D9D9D9"
							style={knobStyle}
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
							diameter="50"
							min="0"
							max="100"
							colors="#AB9DF2;#2C292D;#D9D9D9"
							style={knobStyle}
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
							diameter="50"
							min="0"
							max="100"
							colors="#AB9DF2;#2C292D;#D9D9D9"
							style={knobStyle}
						></webaudio-knob>
						<webaudio-param
							link={name+"_release_control"}
							style={oscGroupValueStyle}
						></webaudio-param>
					</div>
				</div>
				<div className={name+"_visualiser"} style={visualiserStyle}>
					VISUALISER
				</div>
			</div>
		</div>
	);
}

export default OscillatorGroup;
