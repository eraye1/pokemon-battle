import { Trainer } from "../types";

const useGetSelectedPokemons = () => {
  // Get trainer data from localStorage instead of URL
  const userTrainerJson = localStorage.getItem('userTrainer');
  const enemyTrainerJson = localStorage.getItem('enemyTrainer');

  const userTrainerData: Trainer | null = userTrainerJson ? JSON.parse(userTrainerJson) : null;
  const enemyTrainerData: Trainer | null = enemyTrainerJson ? JSON.parse(enemyTrainerJson) : null;

  return {
    userTrainer: userTrainerData,
    enemyTrainer: enemyTrainerData
  };
};

export default useGetSelectedPokemons;
