import React, { useState, useEffect, useRef } from "react";

const ResizableElement = ({ widthPercent, heightPercent }) => {
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const parentRef = useRef(null);

	useEffect(() => {
		if (parentRef.current) {
			const parentWidth = parentRef.current.offsetWidth;
			const parentHeight = parentRef.current.offsetHeight;
			setWidth(parentWidth * (widthPercent / 100));
			setHeight(parentHeight * (heightPercent / 100));
		}
	}, [parentRef, widthPercent, heightPercent]);

	return (
		<div ref={parentRef} style={{ position: "relative" }}>
			<webaudio-knob
				id="k1"
				min="0"
				max="100"
				diameter="100"
				width={width}
				height={height}
			></webaudio-knob>
		</div>
	);
};

export default ResizableElement;
