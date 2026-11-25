import React from 'react';
import {Composition} from 'remotion';
import {BridgeShort, BRIDGE_FRAMES} from './videos/bridge/Bridge';

// BridgeShort: 1080x1920 vertical, 30 fps, 2025 frames = 67.5 s.
// The parallel workflow renders this composition in frame-range chunks
// across N GitHub Actions runners, then stitches the frames + audio.
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
		</>
	);
};
