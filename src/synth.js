import * as Tone from 'tone'
import {now} from "tone";

// -- TONE.JS SETUP -- //
const toneContext = new Tone.Context()

const synth = new Tone.PolySynth(Tone.FMSynth).toDestination()

// -- KEYBOARD LOGIC -- //
let keyboard = document.getElementById("keyboard");
function getNoteFromNumber(number) {
	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	// return notes[number % 12];
	return notes[(12 + (number % 12)) % 12];
}
function getOctaveFromNumber(number) {
	return Math.floor(number / 12) + 2;
}
keyboard.addEventListener("mouseover", function () {
	// Focus on keyboard element so it activates physical keyboard input
	keyboard.cv.focus();
	console.log("mouse over keyboard!");
});
let heldKeys = []

keyboard.addEventListener("change", function (e) {
	let note = getNoteFromNumber(e.note[1]) + getOctaveFromNumber(e.note[1]);
	console.log("note" , note, e.note[0] ? "on" : "off");
	if (e.note[0]) {
		// Note on
		synth.triggerAttack(note, now())
	} else {
		// Note off
		synth.triggerRelease(note, "+0.1")
	}
})
