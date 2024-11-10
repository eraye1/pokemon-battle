import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Move } from "../types";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_SECRET as string,
  dangerouslyAllowBrowser: true,
});

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
  intends_switch_pokemon: z.boolean(),
  intends_pokemon_to_switch_to: z.string().optional(),
  move: MoveSchema.optional(),
});

const FaintVoiceLineSchema = z.object({
  voice_line: z.string(),
});

const TauntSchema = z.object({
  taunt: z.string(),
});

type Result = z.infer<typeof ResultSchema>;
type FaintVoiceLine = z.infer<typeof FaintVoiceLineSchema>;
type BattleState = {
  userPokemon: Pokemon;
  enemyPokemon: Pokemon;
  userHealth: number;
  enemyHealth: number;
  userMaxHealth: number;
  enemyMaxHealth: number;
  userSideEffect?: any;
  enemySideEffect?: any;
};

export async function getMoveFromVoiceCommand(
  voiceInput: string,
  activePokemon: string,
  availableMoves: Move[]
): Promise<Result | undefined> {
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

            If the voice command is intended to switch to a different Pokemon, set intends_switch_pokemon to true and set intends_pokemon_to_switch_to to the name of the Pokemon they intend to switch to.
            If the voice command does not appear to be intended as a command, for example if it is unrelated to the battle, set intends_move to false.
            Otherwise, be creative when creating the move object, but make sure it is a valid move object. Here is an example of a valid move object:

            Examples:
            - "Pikachu, use Thunderbolt!" -> This is a normal move that Pikachu would be expected to do. -> { name: "Thunderbolt", accuracy: 100, effect_chance: 0, power: 90, pp: 15, type: "electric", target: "enemy", damage_type: "special", id: 1 }
            - "Pikachu, use Wing Attack!" -> This is a real move, but one that Pikachu is likely very weak at, so we should reduce the strength. -> { name: "Wing Attack", accuracy: 90, effect_chance: 0, power: 10, pp: 35, type: "flying", target: "enemy", damage_type: "physical", id: 2 }
            - "Give them fentanyl!" -> Funny, maybe this would put the enemy to sleep. -> { name: "Fentanyl", accuracy: 100, effect_chance: 100, power: 0, pp: 5, type: "poison", target: "enemy", damage_type: "status", effect: "sleep", id: 3 }
            - "Pikachu, pull out your sword and shield!" -> Funny, swords seem mildly effective, and the shield should improve defense for the turn. -> { name: "Sword and Shield", accuracy: 100, effect_chance: 0, power: 40, pp: 10, type: "steel", target: "user", damage_type: "status", id: 3 }
            - "Shoot them with a gun!" -> A gun would probably be moderately effective. -> { name: "Gun", accuracy: 90, effect_chance: 0, power: 70, pp: 5, type: "normal", target: "enemy", damage_type: "physical", id: 4 }
            - "Pikachu, come back" -> The trainer intends to switch pokemon.
            
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

    return data ? data : undefined;
  } catch (error) {
    console.error("Error getting move from ChatGPT:", error);
    return undefined;
  }
}

const EmojiSchema = z.object({
  emoji: z.string(),
});

export async function getEmojiFromMoveName(
  moveName: string
): Promise<string | undefined> {
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Pokemon battle assistant. You will receive a move name and should provide the emoji that best represents the attack. 
You may use two emojis if necessary.

Examples:
- "Thunderbolt" -> ⚡
- "Wing Attack" -> 🦅
- "Fentanyl" -> 💉
- "Sword and Shield" -> ⚔️🛡️
- "Gun" -> 🔫
- "Fire Blast" -> 🔥
- "Ice Beam" -> ❄️
- "Scald" -> 💧 🔥
        `,
        },
        {
          role: "user",
          content: moveName,
        },
      ],
      temperature: 0.7,
      max_tokens: 16,
      response_format: zodResponseFormat(EmojiSchema, "emoji"),
    });

    const data = response.choices[0].message.parsed;

    console.log("ChatGPT emoji response:", data);

    return data ? data.emoji : undefined;
  } catch (error) {
    console.error("Error getting emoji from ChatGPT:", error);
    return undefined;
  }
}

export async function getFaintVoiceLine(
  pokemonName: string
): Promise<string | undefined> {
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Pokemon battle assistant. You are generating a trainer voice line for what they would say when their Pokemon faints. 
        `,
        },
        {
          role: "user",
          content: pokemonName,
        },
      ],
      temperature: 0.7,
      max_tokens: 80,
      response_format: zodResponseFormat(FaintVoiceLineSchema, "voice_line"),
    });

    const data = response.choices[0].message.parsed;

    console.log("ChatGPT faint voice line response:", data);

    return data ? data.voice_line : "you tried your best.";
  } catch (error) {
    console.error("Error getting faint voice line from ChatGPT:", error);
    return undefined;
  }
}

export async function getTrainerTaunt(
  battleState: BattleState,
  enemyTrainerName: string
): Promise<string | undefined> {
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are ${enemyTrainerName}, a Pokemon trainer in a battle. Generate a short, witty taunt (max 15 words) based on the current battle state.
            
            Consider:
            - If you're winning/losing
            - Current Pokemon health percentages
            - Status effects
            - Make references to Pokemon types and characteristics
            
            Examples:
            - "Your Charizard's flame is barely a spark now!"
            - "Is that all your Pikachu can muster?"
            - "Paralyzed? Looks like your Pokemon needs a massage!"
            - "My Pokemon's just warming up!"`,
        },
        {
          role: "user",
          content: JSON.stringify(battleState),
        },
      ],
      temperature: 0.9,
      max_tokens: 60,
      response_format: zodResponseFormat(TauntSchema, "taunt"),
    });

    const data = response.choices[0].message.parsed;
    return data ? data.taunt : undefined;
  } catch (error) {
    console.error("Error getting taunt from ChatGPT:", error);
    return undefined;
  }
}