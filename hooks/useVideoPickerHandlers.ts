import { useVideoRecorder } from './useVideoRecorder';

export function useVideoPickerHandlers(setVideoUri: (uri: string | null) => void) {
  const { recordVideo, pickVideo } = useVideoRecorder();

  const handleRecord = async () => {
    const uri = await recordVideo();
    if (uri) setVideoUri(uri);
  };

  const handlePick = async () => {
    const uri = await pickVideo();
    if (uri) setVideoUri(uri);
  };

  return { handleRecord, handlePick };
}
