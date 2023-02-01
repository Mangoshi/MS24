

const OscillatorGroup = () => {
	return (
		<div>
			<h1>Oscillator</h1>
			<webaudio-knob id="knob-2" min="0" max="100" colors="#FF6188;#2C292D;#D9D9D9"></webaudio-knob>
			<webaudio-knob id="knob-2" min="0" max="100" colors="#A9DC76;#2C292D;#D9D9D9"></webaudio-knob>
			<webaudio-knob id="knob-2" min="0" max="100" colors="#FFD866;#2C292D;#D9D9D9"></webaudio-knob>
			<webaudio-slider colors="#78DCE8;#2C292D;#D9D9D9" direction="vert"></webaudio-slider>
		</div>
	);
}

export default OscillatorGroup;
