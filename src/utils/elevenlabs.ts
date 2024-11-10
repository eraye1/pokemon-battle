const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const FEMALE_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MALE_VOICE_ID = "nPczCjzI2devNBz1zQrb";

type VoiceSettings = {
  stability: number;
  similarity_boost: number;
};

export async function playTrainerVoice(text: string, isEnemyMale: boolean = false): Promise<void> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${isEnemyMale ? MALE_VOICE_ID : FEMALE_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
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