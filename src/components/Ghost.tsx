import "./Ghost.css";
import GhostL from "../assets/sprites/ghost_l.png";
import GhostR from "../assets/sprites/ghost_r.png";
import GhostX from "../assets/sprites/ghost_x.png";
import CatSit from "../assets/sprites/cat_sit.png";
import CatIdle from "../assets/sprites/cat_idle.png";
import Hit from "../assets/audio/hit.ogg";
import Meow from "../assets/audio/meow.wav";
import { GhostData } from "./Game";
import { useRef, MutableRefObject, useState, useEffect } from "react";

const TEXTS = [
	"Happy Birthday!",
	"mew",
	"Prettiest!",
	"Electrocute",
	"রূপসী নারী",
	"Stay Mischievous",
	"Eyes I can get lost in",
	"U make me feel warm inside",
	"RADIANT!!",
	"Thanks for lighting up my days",
];
function getRandText(): string {
	const rand = Math.random() * 100;
	if (rand <= 98) {
		return TEXTS[Math.floor(Math.random() * TEXTS.length)];
	} else {
		return "love you";
	}
}

type GhostProps = {
	HEIGHT: MutableRefObject<number>;
	WIDTH: MutableRefObject<number>;
	revealCat: boolean;
	wish: boolean;
	deleteGhost: () => void;
	updateGhost: (posX: number, posY: number) => void;
	deathScreen: () => void;
} & GhostData;

function Ghost(props: GhostProps) {
	const ghostRef = useRef<HTMLDivElement>(null);
	const [catted, setCatted] = useState<boolean>(false);
	const audioRef = useRef<HTMLAudioElement>(new Audio(Hit));

	function handleClickGhost() {
		if (ghostRef.current) {
			audioRef.current.load();
			audioRef.current.play();

			ghostRef.current.style.backgroundImage = `url("${GhostX}`;

			const mat = new WebKitCSSMatrix(window.getComputedStyle(ghostRef.current).transform);
			ghostRef.current.style.animation = `deathAnimation 200ms steps(3) 1 forwards`;
			ghostRef.current.style.pointerEvents = `none`;

			props.updateGhost(mat.m41, mat.m42);
			ghostRef.current.style.zIndex = `${Math.floor(mat.m42)}`;
		}
	}

	function handleClickCat() {
		if (ghostRef.current) {
			audioRef.current.load();
			audioRef.current.play();

			ghostRef.current.setAttribute("before-content", getRandText());
			ghostRef.current.style.setProperty("--before-y", "-15px");
			ghostRef.current.style.setProperty("--before-opacity", "1");
		}

		setTimeout(() => {
			if (ghostRef.current) {
				ghostRef.current.style.setProperty("--before-y", "0px");
				ghostRef.current.style.setProperty("--before-opacity", "0");
			}
		}, 750);
	}

	function handleAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
		switch (e.animationName) {
			case "movement":
				props.deathScreen();
				break;
			case "catSit":
				if (ghostRef.current) {
					ghostRef.current.style.backgroundImage = `url("${CatIdle}")`;
					ghostRef.current.style.animation = `catIdle 1s steps(5) infinite`;
				}
				break;

			default:
				break;
		}
	}

	useEffect(() => {
		if (props.revealCat) {
			handleClickGhost();
			audioRef.current.src = Meow;
			audioRef.current.load();

			setTimeout(() => {
				setCatted(true);
				if (ghostRef.current && props.isCat) {
					ghostRef.current.style.backgroundImage = `url("${CatSit}")`;
					ghostRef.current.style.backgroundPosition = `left center`;
					ghostRef.current.style.animation = `catSit 1s steps(3) 1 forwards`;
					ghostRef.current.style.pointerEvents = "unset";
				}
			}, 500);
		}
	}, [props.revealCat]);

	useEffect(() => {
		if (props.wish) {
			setTimeout(() => {
				audioRef.current.volume = 0.1;
				audioRef.current.play();
				audioRef.current.volume = 1;

				if (ghostRef.current && props.isCat) {
					ghostRef.current.setAttribute("before-content", "Happy Birthday!");
					ghostRef.current.style.setProperty("--before-y", "-15px");
					ghostRef.current.style.setProperty("--before-opacity", "1");
				}

				setTimeout(() => {
					if (ghostRef.current && props.isCat) {
						ghostRef.current.style.setProperty("--before-y", "0");
						ghostRef.current.style.setProperty("--before-opacity", "0");
					}
				}, 2000);
			}, Math.random() * 2000);
		}
	}, [props.wish]);

	return (
		<div
			className="ghost"
			ref={ghostRef}
			onAnimationEnd={handleAnimationEnd}
			onMouseDown={catted ? handleClickCat : handleClickGhost}
			style={
				{
					"--centerX": `${props.WIDTH.current / 2}px`,
					"--centerY": `${192}px`,
					transform: `translate(${props.posX}px, ${props.posY}px) scale(3)`,
					background: `url("${props.facingRight ? GhostR : GhostL}") top`,
					animation: `spriteAnimation 1s steps(4) infinite forwards, movement ${props.speed}ms cubic-bezier(0.2, 0, 1, 1) forwards`,
				} as React.CSSProperties
			}
		></div>
	);
}

export default Ghost;
