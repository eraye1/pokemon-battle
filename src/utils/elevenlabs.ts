const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "cgSgspJ2msm6clMCkdW9";

type VoiceSettings = {
  stability: number;
  similarity_boost: number;
};

export async function playTrainerVoice(text: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          } as VoiceSettings,
        }),
      }
    );

    if (!response.ok) throw new Error('Failed to generate speech');

    const audioBlob = await response.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.volume = 1.0;
    await audio.play();
  } catch (error) {
    console.error('Error playing trainer voice:', error);
  }
}

export default {
  playTrainerVoice,
}; 