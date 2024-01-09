import { useState } from "react";
import "./App.css";
import Game from "./components/Game";
import Start from "./components/Start";

function App() {
	const [gameRunning, setGameRunning] = useState<boolean>(false);

	const startGame = (): void => {
		setGameRunning(true);
	};

	const endGame = (): void => {
		setGameRunning(false);
	};

	return <>{gameRunning ? <Game endGame={endGame} /> : <Start startGame={startGame} />}</>;
}

export default App;
