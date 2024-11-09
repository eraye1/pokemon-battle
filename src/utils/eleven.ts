import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
    apiKey: import.meta.env.VITE_ELEVEN_API_KEY as string,
});

export async function generateSoundEffect(
    moveName: string,
) {
    console.time('generateSoundEffect');
    
    const audio = await elevenlabs.textToSoundEffects.convert({
        text: `A pokemon used the move ${moveName} !`,
        durationSeconds: 3,
    });
    
    console.timeEnd('generateSoundEffect');
    console.log(audio);
    
    return audio;
}