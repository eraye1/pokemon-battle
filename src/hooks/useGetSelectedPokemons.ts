import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetPokemonByNameQuery,
  useGetPokemonMovesetByNameQuery,
} from "../app/api";
import { Pokemon, Trainer } from "../types";

const useGetSelectedPokemons = () => {
  const query = new URLSearchParams(location.search);
  const userTrainer = query.get("userTrainer");
  const enemyTrainer = query.get("enemyTrainer");

  // Parse the trainer data from the URL
  const userTrainerData: Trainer | null = userTrainer ? JSON.parse(decodeURIComponent(userTrainer)) : null;
  const enemyTrainerData: Trainer | null = enemyTrainer ? JSON.parse(decodeURIComponent(enemyTrainer)) : null;

  // Get the first Pokemon from each trainer's team
  const userPokemon = userTrainerData?.team[0];
  const enemyPokemon = enemyTrainerData?.team[0];

  return {
    userPokemon,
    enemyPokemon,
  };
};

export default useGetSelectedPokemons;
