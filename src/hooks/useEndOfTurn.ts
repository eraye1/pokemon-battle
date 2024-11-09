import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectHealthAnimationDuration } from "../app/uiSlice";
import { Condition, Move, Pokemon, Trainer } from "../types";
import { wait } from "../utils/helper";
import { minmaxMoveDecision } from "../utils/moves";

const useEndOfTurn = (
  enemy: Pokemon,
  user: Pokemon,
  userElement: HTMLElement | null,
  enemyElement: HTMLElement | null,
  userHealth: number,
  enemyHealth: number,
  setUserMove: (move?: Move) => void,
  setEnemyMove: (move?: Move) => void,
  setText: (text: string) => void,
  setIsTurnInProgress: (x: boolean) => void,
  setIsAttackPhaseEnded: (x: boolean) => void,
  isAttackPhaseEnded: boolean,
  handleEndOfTurnSideEffect: (
    activeSideEffect: Condition,
    name: string
  ) => Promise<void>,
  userTeamState: PokemonBattleState[],
  enemyTeamState: PokemonBattleState[],
  userSideEffect?: Condition,
  enemySideEffect?: Condition
) => {
  const [turn, setTurn] = useState(1);
  const [closeModal, setCloseModal] = useState(false);
  const [isBattleEnd, setIsBattleEnd] = useState(false);
  const healthAnimationDuration = useSelector(selectHealthAnimationDuration);

  const handleTurnEnd = useCallback(() => {
    setTurn((prevTurn) => prevTurn + 1);
    setEnemyMove(minmaxMoveDecision(enemy.moves ?? [], enemy, user));
    setUserMove(undefined);
    setIsTurnInProgress(false);
    setIsAttackPhaseEnded(false);
  }, [
    enemy,
    setEnemyMove,
    setIsAttackPhaseEnded,
    setIsTurnInProgress,
    setUserMove,
    user,
  ]);

  useEffect(() => {
    if (!isBattleEnd) setText(`What will ${user.name} do?`);
  }, [turn, isBattleEnd, user.name, setText]);

  useEffect(() => {
    (async () => {
      if (isAttackPhaseEnded) {
        if (userSideEffect)
          await handleEndOfTurnSideEffect(userSideEffect, user.name);
        if (enemySideEffect)
          await handleEndOfTurnSideEffect(enemySideEffect, enemy.name);
        handleTurnEnd();
      }
    })();
  }, [
    enemy.name,
    enemySideEffect,
    handleEndOfTurnSideEffect,
    handleTurnEnd,
    isAttackPhaseEnded,
    user.name,
    userSideEffect,
  ]);

  useEffect(() => {
    (async () => {
      // Check if all Pokemon in either team are fainted
      const allUserPokemonFainted = userTeamState.every(pokemon => pokemon.health <= 0);
      const allEnemyPokemonFainted = enemyTeamState.every(pokemon => pokemon.health <= 0);

      if (!allUserPokemonFainted && !allEnemyPokemonFainted) return;

      setIsBattleEnd(true);
      await wait(healthAnimationDuration + 500);

      if (allUserPokemonFainted) {
        userElement?.classList.add("loser");
        setText(`All your Pokemon have fainted! You lost the battle!`);
      } else if (allEnemyPokemonFainted) {
        enemyElement?.classList.add("loser");
        setText(`All opponent's Pokemon have fainted! You won the battle!`);
      }

      await wait(3000);
      setCloseModal(true);
    })();
  }, [
    enemyElement,
    enemyTeamState,
    userElement,
    userTeamState,
    setText,
    healthAnimationDuration,
  ]);

  return { closeModal, isBattleEnd };
};

export default useEndOfTurn;
