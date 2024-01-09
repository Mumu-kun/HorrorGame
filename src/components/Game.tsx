import { useState, useEffect, useRef, MutableRefObject, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import Ghost from "./Ghost";
import Room from "./Room";
import Idle from "../assets/sprites/Idle.png";
import "./Game.css";
import MusicGame from "../assets/audio/game.mp3";
import MusicDeath from "../assets/audio/deathMusic.mp3";
import MusicWon from "../assets/audio/won.mp3";
import SFXType from "../assets/audio/type.ogg";

const gameMusic: HTMLAudioElement = new Audio(MusicGame);
const deathMusic: HTMLAudioElement = new Audio(MusicDeath);
const wonMusic: HTMLAudioElement = new Audio(MusicWon);
wonMusic.loop = true;
wonMusic.volume = 0.5;
const typeSFX: HTMLAudioElement = new Audio(SFXType);

export type GhostData = {
	posX: number;
	posY: number;
	speed: number;
	id: string;
	facingRight: boolean;
	isCat: boolean;
};

function generateGhostData(HEIGHT: MutableRefObject<number>, WIDTH: MutableRefObject<number>): GhostData {
	const WALLHEIGHT = 200;
	const rand = Math.random() * ((HEIGHT.current - WALLHEIGHT) * 2 + WIDTH.current);

	const ghostData: GhostData = {
		posX: 0,
		posY: 0,
		speed: 1000 + Math.random() * 2000,
		id: uuidv4(),
		facingRight: true,
		isCat: Math.random() < 0.5,
	};

	if (rand <= WIDTH.current) {
		ghostData.posX = rand;
		ghostData.posY = HEIGHT.current;

		if (ghostData.posX * 2 >= WIDTH.current) {
			ghostData.facingRight = false;
		}
	} else {
		const reducedRand = rand - WIDTH.current;
		const randY = reducedRand <= HEIGHT.current ? reducedRand : reducedRand - HEIGHT.current;

		ghostData.posX = reducedRand <= HEIGHT.current ? 0 : WIDTH.current;
		ghostData.posY = WALLHEIGHT + randY;

		ghostData.facingRight = reducedRand <= HEIGHT.current;
	}

	return ghostData;
}

function stextUpdate(
	setStext: React.Dispatch<SetStateAction<string>>,
	setWish: React.Dispatch<SetStateAction<boolean>>
) {
	let count = 1;
	let countAdd = -8;
	const typeInterval = setInterval(() => {
		const text = "Boo!";
		const textAdd = "";
		if (count <= text.length) {
			typeSFX.currentTime = 0;
			typeSFX.play();
			setStext(text.substring(0, count));
			count++;
		} else if (count == text.length + 1) {
			setWish(true);
			count++;
		} else if (countAdd <= 0) {
			countAdd++;
		} else if (countAdd <= textAdd.length) {
			setStext(text + textAdd.substring(0, countAdd));
			countAdd++;
		} else {
			clearInterval(typeInterval);
		}
	}, 100);
}

function Game(props: { endGame: () => void }) {
	const ghostGeneratorLoop = useRef<number>(0);

	const [ghosts, setGhosts] = useState<GhostData[]>([]);
	const [deathScreen, setDeathScreen] = useState<boolean>(false);
	const [gameWon, setGameWon] = useState<boolean>(false);
	const [roomVisible, setRoomVisible] = useState<boolean>(false);
	const [wish, setWish] = useState<boolean>(false);

	const [stext, setStext] = useState<string>("");

	const root = document.getElementById("root");
	const WIDTH = useRef(root ? root.offsetWidth * 0.8 : 0);
	const HEIGHT = useRef(root ? root.offsetHeight * 0.8 : 0);

	const deleteGhost = (id: string): void => {
		setGhosts((prev) => {
			return prev.filter((ghostData) => ghostData.id !== id);
		});
	};

	const updateGhost = (id: string, posX: number, posY: number): void => {
		setGhosts((prev) => {
			return prev.map((ghostData) => {
				if (ghostData.id === id) {
					return { ...ghostData, posX, posY };
				}
				return ghostData;
			});
		});
	};

	const addGhost = (): void => {
		setGhosts((prev) => {
			return [...prev, generateGhostData(HEIGHT, WIDTH)];
		});
	};

	useEffect((): (() => void) => {
		setRoomVisible(true);
		gameMusic.load();
		deathMusic.load();
		wonMusic.load();
		typeSFX.load();

		gameMusic.play();

		ghostGeneratorLoop.current = window.setInterval(() => {
			if ((Math.random() * 100) >> 0 < 80) {
				addGhost();
			}
		}, 500);

		return (): void => {
			clearInterval(ghostGeneratorLoop.current);
		};
	}, []);

	useEffect(() => {
		if (deathScreen) {
			gameMusic.pause();
			deathMusic.play();

			setTimeout(() => {
				props.endGame();
			}, 500);
		}
	}, [deathScreen]);

	return (
		<>
			{deathScreen && <div className="death-screen"></div>}

			{!gameWon ? (
				<div className="timer">
					<div
						className="timer--progress"
						onAnimationEnd={() => {
							clearInterval(ghostGeneratorLoop.current);
							setRoomVisible(false);
						}}
					></div>
				</div>
			) : (
				<div className={`s-text`}>{stext}</div>
			)}

			<Room
				WIDTH={WIDTH}
				HEIGHT={HEIGHT}
				visible={roomVisible}
				transitionEnd={(): void => {
					setGameWon(true);
					setTimeout(() => {
						setRoomVisible(true);
						stextUpdate(setStext, setWish);

						gameMusic.pause();
						wonMusic.play();
					}, 1000);
				}}
			>
				<div
					className="girl"
					style={{
						background: `url(${Idle}) left`,

						transform: `translate(${WIDTH.current / 2}px, ${192}px) translate(-50%, -50%) scale(3)`,
						animation: `idle 1s steps(2) infinite`,
					}}
				></div>
				{ghosts.map((ghostData: GhostData) => (
					<Ghost
						key={ghostData.id}
						{...ghostData}
						WIDTH={WIDTH}
						HEIGHT={HEIGHT}
						revealCat={gameWon}
						wish={wish}
						deleteGhost={(): void => {
							deleteGhost(ghostData.id);
						}}
						updateGhost={(posX: number, posY: number): void => {
							updateGhost(ghostData.id, posX, posY);
						}}
						deathScreen={(): void => {
							setDeathScreen(true);
						}}
					/>
				))}
			</Room>
		</>
	);
}

export default Game;
