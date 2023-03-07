import * as Tone from "tone";

let consentContainer = document.getElementById("consentContainer");
let consentButton = document.getElementById("contextConsentButton");
let synthContainer = document.getElementById("synthContainer");

// const loadScript = (FILE_URL, async = true, type = "module") => {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			const scriptEle = document.createElement("script");
// 			scriptEle.type = type;
// 			scriptEle.async = async;
// 			scriptEle.src =FILE_URL;
//
// 			scriptEle.addEventListener("load", (ev) => {
// 				resolve({ status: true });
// 			});
//
// 			scriptEle.addEventListener("error", (ev) => {
// 				reject({
// 					status: false,
// 					message: `Failed to load the script ＄{FILE_URL}`
// 				});
// 			});
//
// 			document.body.appendChild(scriptEle);
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});
// };

consentButton.addEventListener("click", function () {
	consentContainer.style.display = "none";
	synthContainer.style.display = "flex";
	if (Tone.context.state !== "running") {
		Tone.context.resume();
	}
	// loadScript("src/synth.js")
	// 	.then( data  => {
	// 		console.log("Script loaded successfully", data);
	// 	})
	// 	.catch( err => {
	// 		console.error(err);
	// 	});
})
