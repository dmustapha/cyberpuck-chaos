import { Composition, registerRoot } from 'remotion';
import { CinematicIntro } from '../components/landing/CinematicIntro';

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CinematicIntro"
        component={CinematicIntro}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
