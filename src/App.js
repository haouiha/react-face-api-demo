import * as faceapi from 'face-api.js';
import { useEffect, useRef } from 'react';

const MODEL_URL = '/models';

const App = () => {
	const videoRef = useRef();
	const canvasRef = useRef(null);

	useEffect(() => {
		const loading = async () => {
			try {
				await Promise.all([
					faceapi.loadSsdMobilenetv1Model(MODEL_URL),
					faceapi.loadTinyFaceDetectorModel(MODEL_URL),
					faceapi.loadFaceLandmarkModel(MODEL_URL),
					faceapi.loadFaceExpressionModel(MODEL_URL),
					faceapi.loadAgeGenderModel(MODEL_URL),
					faceapi.loadFaceRecognitionModel(MODEL_URL),
				]).then(startVideo);
			} catch (error) {
				console.log(`error`, error);
			}
		};

		loading();
	}, []);

	const startVideo = () => {
		navigator.getUserMedia(
			{ video: {} },
			(stream) => (videoRef.current.srcObject = stream),
			(err) => console.error(err)
		);
	};

	useEffect(() => {
		let videoInstance = videoRef.current;
		if (videoRef.current && canvasRef.current) {
			videoRef.current.addEventListener('play', () => {
				const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
				faceapi.matchDimensions(canvasRef.current, displaySize);
				let i = 0;
				setInterval(async () => {
					//https://github.com/justadudewhohacks/face-api.js#models
					// new faceapi.SsdMobilenetv1Options({ minConfidence: 0.65 })
					//new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.7 })
					const detections = await faceapi
						.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }))
						.withFaceLandmarks()
						.withFaceExpressions()
						.withAgeAndGender()
						.withFaceDescriptors();

					const resizedDetections = faceapi.resizeResults(detections, displaySize);
					if (i % 20 === 0) console.log(`detections`, detections);

					canvasRef.current
						.getContext('2d')
						.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

					faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
					faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
					faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

					resizedDetections.forEach((result) => {
						const { age, gender, genderProbability } = result;
						new faceapi.draw.DrawTextField(
							[`${Math.round(age)} years`, `${gender} (${genderProbability.toFixed(2)})`],
							result.detection.box.bottomRight
						).draw(canvasRef.current);
					});

					i++;
				}, 100);
			});
		}
		return () => {
			videoInstance && videoInstance.removeEventListener('play', null);
		};
	}, []);

	return (
		<div>
			<canvas ref={canvasRef} style={{ position: 'absolute' }} />
			<video ref={videoRef} width="720" height="560" autoPlay muted></video>
		</div>
	);
};

export default App;
