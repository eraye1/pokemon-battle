import { useEffect, useState } from "react";
import { Move, Pokemon } from "../types";
import { calculateAttacker } from "../utils/battle";
import useAdjustHealth from "./useAdjustHealth";
import useEndOfTurn from "./useEndOfTurn";
import usePokemonAttack from "./usePokemonAttack";
import useSideEffects from "./useSideEffects";
import { playTrainerVoice } from "../utils/elevenlabs";

interface BattleSequenceProps {
  user: Pokemon;
  enemy: Pokemon;
  enemyMove?: Move;
  setEnemyMove: (move: Move | undefined) => void;
  userMove?: Move;
  setUserMove: (move: Move | undefined) => void;
  userElement: HTMLElement | null;
  enemyElement: HTMLElement | null;
  userTeamState: PokemonBattleState[];
  enemyTeamState: PokemonBattleState[];
}

const useBattleSequence = ({
  user,
  enemy,
  enemyMove,
  setEnemyMove,
  setUserMove,
  userMove,
  userElement,
  enemyElement,
  userTeamState,
  enemyTeamState,
}: BattleSequenceProps) => {
  const [text, setText] = useState("");
  const [isTurnInProgress, setIsTurnInProgress] = useState(false);

  const [isAttackPhaseEnded, setIsAttackPhaseEnded] = useState(false);
  const [turnState, setTurnState] = useState<"first-half" | "second-half">(
    "first-half"
  );

  const { adjustHealth, userHealth, enemyHealth, setUserHealth, setEnemyHealth } = useAdjustHealth(
    user,
    enemy
  );

  const {
    userSideEffect,
    handleSideEffect,
    enemySideEffect,
    handleMoveDisableSideEffect,
    handleEndOfTurnSideEffect,
  } = useSideEffects(
    user,
    enemy,
    setText,
    userElement,
    enemyElement,
    adjustHealth
  );

  const { handleAttack, isAttackInProgress } = usePokemonAttack(
    userElement,
    enemyElement,
    setText,
    handleMoveDisableSideEffect,
    handleSideEffect,
    adjustHealth
  );

  const { isBattleEnd, closeModal } = useEndOfTurn(
    enemy,
    user,
    userElement,
    enemyElement,
    userHealth,
    enemyHealth,
    setUserMove,
    setEnemyMove,
    setText,
    setIsTurnInProgress,
    setIsAttackPhaseEnded,
    isAttackPhaseEnded,
    handleEndOfTurnSideEffect,
    userTeamState,
    enemyTeamState,
    userSideEffect,
    enemySideEffect,
  );

  useEffect(() => {
    (async () => {
      if (
        enemyMove &&
        userMove &&
        enemyElement &&
        userElement &&
        !isBattleEnd &&
        !isAttackInProgress &&
        !isAttackPhaseEnded &&
        userHealth > 0 &&
        enemyHealth > 0
      ) {
        setIsTurnInProgress(true);
        const {
          firstPlayer,
          secondPlayer,
          firstMove,
          secondMove,
          firstSideEffect,
          secondSideEffect,
        } = calculateAttacker(
          user,
          enemy,
          userMove,
          enemyMove,
          userSideEffect,
          enemySideEffect
        );

        if (firstPlayer === user ? userHealth > 0 : enemyHealth > 0) {
          await handleAttack(
            firstPlayer,
            secondPlayer,
            firstMove,
            firstSideEffect
          );

          await new Promise(resolve => setTimeout(resolve, 100));

          const currentFirstHealth = firstPlayer === user ? userHealth : enemyHealth;
          const currentSecondHealth = secondPlayer === user ? userHealth : enemyHealth;

          if (currentFirstHealth > 0 && currentSecondHealth > 0) {
            setTurnState("second-half");
            await handleAttack(
              secondPlayer,
              firstPlayer,
              secondMove,
              secondSideEffect
            );
          }
        }

        setTurnState("first-half");
        setIsAttackPhaseEnded(true);
      }
    })();
  }, [
    handleAttack,
    enemy,
    enemyElement,
    enemyMove,
    enemySideEffect,
    isAttackInProgress,
    isAttackPhaseEnded,
    turnState,
    user,
    userElement,
    userMove,
    userSideEffect,
    isBattleEnd,
    userHealth,
    enemyHealth,
  ]);

  return {
    userHealth,
    enemyHealth,
    userSideEffect,
    enemySideEffect,
    text,
    isTurnInProgress,
    isBattleEnd,
    closeModal,
    setUserHealth,
    setEnemyHealth,
    setText,
  };
};

export default useBattleSequence;
