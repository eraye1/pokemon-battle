import { useEffect, useRef, useState } from "react";
import useGetSelectedPokemons from "../../hooks/useGetSelectedPokemons";
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
  const { userPokemon, enemyPokemon } = useGetSelectedPokemons();

  // Fetch moves for both Pokemon
  const { data: userMoves } = useGetPokemonMovesetByNameQuery(
    userPokemon ? {
      name: userPokemon.name,
      moves: userPokemon.moveNames,
    } : skipToken
  );

  const { data: enemyMoves } = useGetPokemonMovesetByNameQuery(
    enemyPokemon ? {
      name: enemyPokemon.name,
      moves: enemyPokemon.moveNames,
    } : skipToken
  );

  // Combine Pokemon data with their moves
  const userPokemonWithMoves = userPokemon && userMoves ? {
    ...userPokemon,
    moves: userMoves
  } : undefined;

  const enemyPokemonWithMoves = enemyPokemon && enemyMoves ? {
    ...enemyPokemon,
    moves: enemyMoves
  } : undefined;

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      (async () => {
        await wait(4000);
        setShowBattleScreen(true);
      })();
    }
  }, []);

  return (
    <StyledBattleDialog ref={dialogRef}>
      <IntroScreen user={userPokemon} enemy={enemyPokemon} />
      {showBattleScreen && userPokemonWithMoves && enemyPokemonWithMoves && (
        <BattleScreen
          user={userPokemonWithMoves}
          enemy={enemyPokemonWithMoves}
          onBattleEnd={onBattleEnd}
        />
      )}
    </StyledBattleDialog>
  );
};

export default BattleDialog;
