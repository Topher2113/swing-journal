import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function useVideoRecorder() {
  const recordVideo = useCallback(async (): Promise<string | null> => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (!cam.granted) {
      Alert.alert('Permission required', 'Camera access is needed to record a clip.');
      return null;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        videoMaxDuration: 30,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
      });
      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch {
      Alert.alert(
        'Camera unavailable',
        'This device does not support video recording. Use "From library" instead.'
      );
      return null;
    }
  }, []);

  const pickVideo = useCallback(async (): Promise<string | null> => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!lib.granted) {
      Alert.alert('Permission required', 'Photo library access is needed to choose a clip.');
      return null;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        videoMaxDuration: 30,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
      });
      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch {
      Alert.alert('Library unavailable', 'Could not open the photo library on this device.');
      return null;
    }
  }, []);

  return { recordVideo, pickVideo };
}
