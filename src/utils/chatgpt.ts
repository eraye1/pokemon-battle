import { Move } from "../types";

export async function getMoveFromVoiceCommand(
  voiceInput: string,
  availableMoves: Move[]
): Promise<Move | undefined> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Pokemon battle assistant. You will receive a voice command and a list of available moves. 
            Select the most appropriate move based on the voice command. Available moves: ${JSON.stringify(availableMoves)}`
          },
          {
            role: "user",
            content: voiceInput
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    const data = await response.json();
    const moveChoice = data.choices[0].message.content.toLowerCase();
    
    // Find the move that best matches the AI's response
    return availableMoves.find(move => 
      moveChoice.includes(move.name.toLowerCase())
    );
  } catch (error) {
    console.error('Error getting move from ChatGPT:', error);
    return undefined;
  }
} 