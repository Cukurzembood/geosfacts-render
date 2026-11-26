import React from 'react';
import {Composition} from 'remotion';
import {BridgeShort, BRIDGE_FRAMES} from './videos/bridge/Bridge';
import {OurWorldTest, OUR_WORLD_FRAMES} from './videos/ourworld/OurWorld';
import {OurWorld050, OUR_WORLD_050_FRAMES} from './videos/ourworld/OurWorld050';

// BridgeShort: 1080x1920 vertical, 30 fps, 2025 frames = 67.5 s.
// The parallel workflow renders this composition in frame-range chunks
// across N GitHub Actions runners, then stitches the frames + audio.
// OurWorldTest: our own nerd stickman in our own "Kampus Sains" world,
// 1080x1920, 30 fps, 300 frames = 10 s (Phase 1 test clip).
// OurWorld050: full 57 s video from script 050 (Phase 2), same world +
// auditorium stage, mouth cutaway + brain control-room cards.
export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="BridgeShort"
				component={BridgeShort}
				durationInFrames={BRIDGE_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="OurWorldTest"
				component={OurWorldTest}
				durationInFrames={OUR_WORLD_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="OurWorld050"
				component={OurWorld050}
				durationInFrames={OUR_WORLD_050_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
