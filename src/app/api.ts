/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Move, Pokemon } from "../types";
import {
  capitalizeFirstLetter,
  getFourRandomMoves,
  replaceDashesWithSpaces,
} from "../utils/helper";
import { calculateMaxStat } from "../utils/battle";

// Define a service using a base URL and expected endpoints
export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2/" }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `pokemon/${name}`,
      transformResponse: (pokemon: any) => ({
        name: pokemon.name,
        sprites: {
          default: pokemon.sprites.other["official-artwork"].front_default,
          battle_back:
            pokemon.sprites.versions["generation-v"]["black-white"].animated
              .back_default,
          battle_front:
            pokemon.sprites.versions["generation-v"]["black-white"].animated
              .front_default,
        },
        type: pokemon.types[0].type.name,
        maxHealth: calculateMaxStat(pokemon.stats[0].base_stat),
        stats: {
          [pokemon.stats[0].stat.name]: pokemon.stats[0].base_stat,
          [pokemon.stats[1].stat.name]: pokemon.stats[1].base_stat,
          [pokemon.stats[2].stat.name]: pokemon.stats[2].base_stat,
          [pokemon.stats[3].stat.name]: pokemon.stats[3].base_stat,
          [pokemon.stats[4].stat.name]: pokemon.stats[4].base_stat,
          [pokemon.stats[5].stat.name]: pokemon.stats[5].base_stat,
        },
        moveNames: getFourRandomMoves(pokemon.moves),
      }),
    }),
    getPokemonMovesetByName: builder.query<
      Move[],
      { name: string; moves: string[] }
    >({
      async queryFn({ moves: moveNames }, _queryApi, _extraOptions, baseQuery) {
        const moves: Move[] = [];
        for (const moveName of moveNames) {
          const moveRes = await baseQuery(`move/${moveName}`);
          const moveData = moveRes.data as any;
          moves.push({
            name: capitalizeFirstLetter(replaceDashesWithSpaces(moveName)),
            accuracy: moveData.accuracy,
            effect_chance: moveData.effect_chance,
            power: moveData.power,
            pp: moveData.pp,
            type: moveData.type.name,
            damage_type: moveData.damage_class.name,
            target:
              moveData.target.name === "selected-pokemon" ? "enemy" : "user",
            id: moveData.id,
          });
        }

        return { data: moves };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPokemonByNameQuery, useGetPokemonMovesetByNameQuery } =
  pokemonApi;
