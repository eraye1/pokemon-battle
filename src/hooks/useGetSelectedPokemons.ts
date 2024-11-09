import { Trainer } from "../types";

const useGetSelectedPokemons = () => {
  const query = new URLSearchParams(location.search);
  const userTrainer = query.get("userTrainer");
  const enemyTrainer = query.get("enemyTrainer");

  // Parse the trainer data from the URL
  const userTrainerData: Trainer | null = userTrainer ? JSON.parse(decodeURIComponent(userTrainer)) : null;
  const enemyTrainerData: Trainer | null = enemyTrainer ? JSON.parse(decodeURIComponent(enemyTrainer)) : null;

  return {
    userTrainer: userTrainerData,
    enemyTrainer: enemyTrainerData
  };
};

export default useGetSelectedPokemons;
