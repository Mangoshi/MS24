import {useEffect, useState} from "react";

const OscillatorGroup = ({x, y}) => {

	const [diameter, setDiameter] = useState(50);

	useEffect(() => {
		const interval = setInterval(() => {
			setDiameter((d) => {
				if (d >= 200) {
					clearInterval(interval);
				}
				document.querySelector("#k1").diameter = d;
				return d + 20;
			});
		}, 1000);
	}, []);

	console.log(diameter)

	return (
		<div style={{top: y, left: x, position: 'absolute'}}>
			<webaudio-knob diameter={diameter} id="k1" min="0" max="100" colors="#FF6188;#2C292D;#D9D9D9"></webaudio-knob>
			<webaudio-knob id="k2" min="0" max="100" colors="#A9DC76;#2C292D;#D9D9D9"></webaudio-knob>
			<webaudio-knob id="k3" min="0" max="100" colors="#FFD866;#2C292D;#D9D9D9"></webaudio-knob>
			<webaudio-slider id="s1" colors="#78DCE8;#2C292D;#D9D9D9" direction="vert"></webaudio-slider>
		</div>
	);
}

export default OscillatorGroup;
