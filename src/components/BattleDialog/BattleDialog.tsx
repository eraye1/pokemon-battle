import { useEffect, useRef, useState } from "react";
import useGetSelectedPokemons from "../../hooks/useGetSelectedPokemons";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetPokemonMovesetByNameQuery } from "../../app/api";
import { wait } from "../../utils/helper";
import { BattleScreen } from "../BattleScreen/BattleScreen";
import { IntroScreen } from "../IntroScreen/IntroScreen";
import { StyledBattleDialog } from "./BattleDialog.styled";

interface BattleDialogProps {
  onBattleEnd: () => void;
}

const BattleDialog: React.FC<BattleDialogProps> = ({ onBattleEnd }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showBattleScreen, setShowBattleScreen] = useState(false);
  const { userTrainer, enemyTrainer } = useGetSelectedPokemons();

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      (async () => {
        await wait(4000);
        setShowBattleScreen(true);
      })();
    }
  }, []);

  if (!userTrainer || !enemyTrainer) {
    return null;
  }

  return (
    <StyledBattleDialog ref={dialogRef}>
      <IntroScreen user={userTrainer.team[0]} enemy={enemyTrainer.team[0]} />
      {showBattleScreen && (
        <BattleScreen
          userTrainer={userTrainer}
          enemyTrainer={enemyTrainer}
          onBattleEnd={onBattleEnd}
        />
      )}
    </StyledBattleDialog>
  );
};

export default BattleDialog;
