import { TransitionEvent, useEffect, useRef, useState } from "react";
import "./Start.css";
import MusicMenu from "../assets/audio/menu.mp3";

const menuMusic: HTMLAudioElement = new Audio(MusicMenu);
menuMusic.loop = true;
let interaction: boolean = false;

function Start(props: { startGame: () => void }) {
	const [showStart, setShowStart] = useState<Boolean>(true);
	const [text, setText] = useState<String>("");
	const textRef = useRef<HTMLDivElement>(null);

	const startBtnTransition = (e: TransitionEvent) => {
		if (!e.currentTarget.classList.contains("fade")) {
			setShowStart(false);
			setTimeout(() => {
				setText("Survive");
			}, 1000);
		}
	};

	const textTransition = (e: TransitionEvent) => {
		if (e.currentTarget.classList.contains("fade")) {
			if (textRef.current) textRef.current.classList.remove("fade");
		} else {
			props.startGame();
		}
	};

	useEffect(() => {
		if (!interaction) {
			document.addEventListener(
				"click",
				() => {
					interaction = true;

					menuMusic.play();
				},
				{ once: true }
			);
		} else {
			menuMusic.currentTime = 0;
			menuMusic.play();
		}

		setTimeout(() => {
			document.querySelector(".startBtn")?.classList.add("fade");
		}, 1000);

		return () => {
			menuMusic.pause();
		};
	}, []);

	return (
		<>
			{showStart ? (
				<div
					className="startBtn startText"
					onClick={(e) => {
						e.currentTarget.classList.remove("fade");
					}}
					onTransitionEnd={startBtnTransition}
				>
					START
				</div>
			) : undefined}
			<div ref={textRef} className={`startText ${text ? "fade" : ""}`} onTransitionEnd={textTransition}>
				{text}
			</div>
		</>
	);
}

export default Start;
