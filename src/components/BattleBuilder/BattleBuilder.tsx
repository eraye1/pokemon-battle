import React, { useState } from "react";
import { Player, Trainer } from "../../types";
import TrainerList from "../TrainerList/TrainerList";
import { StyledBattleBuilderContainer } from "./BattleBuilder.styled";

interface BattleBuilderProps {
  onBattleStart: (userTrainer: Trainer, enemyTrainer: Trainer) => void;
}

const BattleBuilder: React.FC<BattleBuilderProps> = ({ onBattleStart }) => {
  const [userSelectedTrainer, setUserSelectedTrainer] = useState<Trainer>();
  const [enemySelectedTrainer, setEnemySelectedTrainer] = useState<Trainer>();

  const handleBattleStart = () => {
    if (userSelectedTrainer && enemySelectedTrainer) {
      // Store trainers in localStorage instead of URL
      localStorage.setItem('userTrainer', JSON.stringify(userSelectedTrainer));
      localStorage.setItem('enemyTrainer', JSON.stringify(enemySelectedTrainer));
      
      onBattleStart(userSelectedTrainer, enemySelectedTrainer);
    }
  };

  return (
    <StyledBattleBuilderContainer>
      <h1>Pokémon Battle</h1>
      <div className="container">
        <TrainerList
          player={Player.User}
          onTrainerSelection={setUserSelectedTrainer}
          selectedOpponentId={enemySelectedTrainer?.id}
        />
        <div className="hr"></div>
        <TrainerList
          player={Player.Enemy}
          onTrainerSelection={setEnemySelectedTrainer}
          selectedOpponentId={userSelectedTrainer?.id}
        />
      </div>
      <button
        disabled={!userSelectedTrainer || !enemySelectedTrainer}
        onClick={handleBattleStart}
        className="battle-button"
      >
        Battle now!
      </button>
    </StyledBattleBuilderContainer>
  );
};

export default BattleBuilder;
