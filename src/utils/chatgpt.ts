import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Move } from "../types";

const openai = new OpenAI(
  {apiKey: import.meta.env.VITE_OPENAI_SECRET as string, dangerouslyAllowBrowser: true},
);

const MoveSchema = z.object({
  name: z.string(),
  accuracy: z.number(),
  effect_chance: z.number(),
  effect: z.string().optional(),
  power: z.number(),
  pp: z.number(),
  type: z.string(),
  target: z.enum(["enemy", "user"]),
  damage_type: z.enum(["status", "physical", "special"]),
  id: z.number(),
});

const ResultSchema = z.object({
  thinking: z.string(),
  intends_move: z.boolean(),
  move: MoveSchema.optional(),
});

export async function getMoveFromVoiceCommand(
  voiceInput: string,
  activePokemon: string,
  availableMoves: Move[]
): Promise<Move | undefined> {
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `You are a Pokemon battle assistant. You will receive a voice command that a user (trainer) has spoken to their Pokemon.
            The current active Pokemon is ${activePokemon}.
            Select the most appropriate move based on the voice command. 

            First, think about what the user's input and intent likely is. Write a concise 1 sentence max summary of it.

            If the voice command does not appear to be intended as a command, for example if it is unrelated to the battle, set intends_move to false.
            Otherwise, be creative when creating the move object, but make sure it is a valid move object. Here is an example of a valid move object:

            Examples:
            - "Pikachu, use Thunderbolt!" -> This is a normal move that Pikachu would be expected to do. -> { name: "Thunderbolt", accuracy: 100, effect_chance: 0, power: 90, pp: 15, type: "electric", target: "enemy", damage_type: "special", id: 1 }
            - "Pikachu, use Wing Attack!" -> This is a real move, but one that Pikachu is likely very weak at, so we should reduce the strength. -> { name: "Wing Attack", accuracy: 90, effect_chance: 0, power: 10, pp: 35, type: "flying", target: "enemy", damage_type: "physical", id: 2 }
            - "Give them fentanyl!" -> Funny, maybe this would put the enemy to sleep. -> { name: "Fentanyl", accuracy: 100, effect_chance: 100, power: 0, pp: 5, type: "poison", target: "enemy", damage_type: "status", effect: "sleep", id: 3 }
            - "Pikachu, pull out your sword and shield!" -> Funny, swords seem mildly effective, and the shield should improve defense for the turn. -> { name: "Sword and Shield", accuracy: 100, effect_chance: 0, power: 40, pp: 10, type: "steel", target: "user", damage_type: "status", id: 3 }
            - "Shoot them with a gun!" -> A gun would probably be moderately effective. -> { name: "Gun", accuracy: 90, effect_chance: 0, power: 70, pp: 5, type: "normal", target: "enemy", damage_type: "physical", id: 4 }
            `,
        },
        {
          role: "user",
          content: voiceInput,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
      response_format: zodResponseFormat(ResultSchema, "event"),
    });

    const data = response.choices[0].message.parsed;

    console.log("ChatGPT response:", data);

    return data.intends_move ? data.move : undefined;
  } catch (error) {
    console.error("Error getting move from ChatGPT:", error);
    return undefined;
  }
}
