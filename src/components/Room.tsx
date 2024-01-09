import { MutableRefObject } from "react";
import Floor from "../assets/tiles/floor.png";
import Wall from "../assets/tiles/wall.png";
import "./Room.css";

type RoomProps = {
	HEIGHT: MutableRefObject<number>;
	WIDTH: MutableRefObject<number>;
	children: React.ReactNode;
	visible: boolean;
	transitionEnd: () => void;
};

function Room(props: RoomProps) {
	return (
		<div
			className={`room ${props.visible ? "fade" : ""}`}
			style={{
				backgroundImage: `url(${Floor})`,
				width: props.WIDTH.current,
				height: props.HEIGHT.current,
			}}
			onTransitionEnd={(e: React.TransitionEvent<HTMLDivElement>) => {
				if (e.currentTarget && !e.currentTarget.classList.contains("fade")) {
					props.transitionEnd();
				}
			}}
		>
			<div
				className="room--wall"
				style={{
					height: 192,
					width: `100%`,
					backgroundImage: `url(${Wall})`,
					backgroundSize: `contain`,
				}}
			></div>
			{props.children}
		</div>
	);
}

export default Room;
