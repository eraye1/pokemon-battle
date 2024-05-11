import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectHealthAnimationDuration,
  setHealthAnimationDuration,
} from "../app/uiSlice";
import {
  CHANCE_TO_ATTACK_IN_CONFUSION,
  TEXT_ANIMATION_DURATION,
} from "../constants";
import {
  Condition,
  ConditionName,
  Move,
  Pokemon,
  UnknownEffect,
} from "../types";
import {
  calculateAttacker,
  calculateHealthAnimationDuration,
  calculateMoveImpact,
  isSuccessful,
} from "../utils/battle";
import { wait } from "../utils/helper";
import { minmaxMoveDecision } from "../utils/moves";
import { adjustPokemonStat } from "../utils/stats";
import useMoveAnimation from "./useMoveAnimation";

const useBattleSequence = ({
  user,
  enemy,
  enemyMove,
  setEnemyMove,
  setUserMove,
  userMove,
  userElement,
  enemyElement,
}: {
  user: Pokemon;
  enemy: Pokemon;
  enemyMove?: Move;
  setEnemyMove: (move: Move | undefined) => void;
  userMove?: Move;
  setUserMove: (move: Move | undefined) => void;
  userElement: HTMLElement | null;
  enemyElement: HTMLElement | null;
}) => {
  const [userHealth, setUserHealth] = useState(user.maxHealth);
  const [enemyHealth, setEnemyHealth] = useState(enemy.maxHealth);
  const [userSideEffect, setUserSideEffect] = useState<Condition>();
  const [enemySideEffect, setEnemySideEffect] = useState<Condition>();
  const [text, setText] = useState("");
  const [isTurnInProgress, setIsTurnInProgress] = useState(false);
  const [isAttackInProgress, setIsAttackInProgress] = useState(false);
  const [isAttackPhaseEnded, setIsAttackPhaseEnded] = useState(false);
  const [turnState, setTurnState] = useState<"first-half" | "second-half">(
    "first-half"
  );
  const [turn, setTurn] = useState(1);
  const [isBattleEnd, setIsBattleEnd] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const dispatch = useDispatch();
  const healthAnimationDuration = useSelector(selectHealthAnimationDuration);

  const animateCharacter = useMoveAnimation(userElement, enemyElement);

  const adjustHealth = useCallback(
    async (playerName: string, amount: number, isGaining?: boolean) => {
      const animationDuration = calculateHealthAnimationDuration(amount);
      dispatch(setHealthAnimationDuration(animationDuration));

      const targetHealthUpdater =
        playerName === enemy.name ? setEnemyHealth : setUserHealth;
      const targetMaxHealth =
        playerName === user.name ? user.maxHealth : enemy.maxHealth;
      const operator = isGaining ? "+" : "-";

      targetHealthUpdater((prevHealth) => {
        const result = prevHealth + (operator === "+" ? amount : -amount);
        return Math.min(Math.max(result, 0), targetMaxHealth);
      });

      await wait(animationDuration + 500);
    },
    [dispatch, enemy.maxHealth, enemy.name, user.maxHealth, user.name]
  );

  const handleEffectivenessMessage = useCallback(
    (effectiveness: number, name: string) => {
      switch (effectiveness) {
        case 0:
          setText(`It doesn't affect ${name}!`);
          break;
        case 0.5:
          setText("It's not very effective...");
          break;
        case 2:
          setText("It's super effective!");
          break;
        case 4:
          setText("It's super effective!");
          break;
        default:
          return;
      }
    },
    []
  );

  const handleSideEffect = useCallback(
    async (sideEffect: Exclude<Condition, UnknownEffect>, name: string) => {
      const isAlreadyEffected =
        (name === user.name && userSideEffect) ||
        (name === enemy.name && enemySideEffect);

      if (!isSuccessful(sideEffect.chanceToHit)) return;
      if (isAlreadyEffected) return setText(`But it failed...`);

      name === user.name
        ? setUserSideEffect(sideEffect)
        : setEnemySideEffect(sideEffect);

      switch (sideEffect.name) {
        case ConditionName.CONFUSION:
          setText(`${name} became confused!`);
          break;
        case ConditionName.BURN:
          setText(`${name} was burned!`);
          dispatch(adjustPokemonStat(name, "attack", sideEffect.attack));
          break;
        case ConditionName.FREEZE:
          setText(`${name} was frozen solid!`);
          break;
        case ConditionName.SLEEP:
          setText(`${name} fell asleep!`);
          break;
        case ConditionName.PARALYSIS:
          setText(`${name} is paralyzed! It can't move!`);
          dispatch(adjustPokemonStat(name, "speed", sideEffect.speed));
          dispatch(adjustPokemonStat(name, "accuracy", sideEffect.accuracy));
          break;
        default:
          break;
      }

      await wait(TEXT_ANIMATION_DURATION);
    },
    [dispatch, enemy.name, enemySideEffect, user.name, userSideEffect]
  );

  const handleMoveDisableSideEffect = useCallback(
    async (activeSideEffect: Condition, name: string) => {
      console.log(activeSideEffect);
      let canMove = true;

      const setSideEffect = async (sideEffectText: string) => {
        setText(sideEffectText);
        canMove = false;
        await wait(TEXT_ANIMATION_DURATION);
      };

      const removeSideEffect = async (sideEffectRemovalText: string) => {
        setText(sideEffectRemovalText);
        name === user.name
          ? setUserSideEffect(undefined)
          : setEnemySideEffect(undefined);
        canMove = true;
        await wait(TEXT_ANIMATION_DURATION);
      };

      switch (activeSideEffect.name) {
        case ConditionName.FREEZE:
          if (!isSuccessful(activeSideEffect.chanceToReset))
            await setSideEffect(`${name} is frozen solid!`);
          else await removeSideEffect(`${name} is not longer frozen!`);
          break;
        case ConditionName.SLEEP:
          if (!isSuccessful(activeSideEffect.chanceToReset))
            await setSideEffect(`${name} is fast asleep...`);
          else await removeSideEffect(`${name} woke up!`);
          break;
        case ConditionName.CONFUSION:
          await setSideEffect(`${name} is confused!`);
          if (!isSuccessful(activeSideEffect.chanceToReset)) {
            if (!isSuccessful(CHANCE_TO_ATTACK_IN_CONFUSION)) {
              setText(`It hurt itself in it's confusion!`);
              await wait(TEXT_ANIMATION_DURATION);
              await animateCharacter(
                user.name === name ? user : enemy,
                "damage"
              );
              await adjustHealth(name, 100 / 2 + 1);
              canMove = false;
            } else {
              canMove = true;
            }
          } else await removeSideEffect(`${name} snapped out of confusion!`);
          break;
        default:
          break;
      }
      return canMove;
    },
    [adjustHealth, animateCharacter, enemy, user]
  );

  const handleEndOfTurnSideEffect = useCallback(
    async (activeSideEffect: Condition, name: string) => {
      switch (activeSideEffect.name) {
        case ConditionName.BURN:
          setText(`${name} is hurt by it's burn!`);
          await wait(TEXT_ANIMATION_DURATION);
          await animateCharacter(user.name === name ? user : enemy, "damage");
          await adjustHealth(
            name,
            activeSideEffect.extraDamage *
              (user.name === name ? user.maxHealth : enemy.maxHealth)
          );
          break;
        case ConditionName.POISON:
          setText(`${name} is hurt by poison!`);
          await wait(TEXT_ANIMATION_DURATION);
          await animateCharacter(user.name === name ? user : enemy, "damage");
          await adjustHealth(
            name,
            activeSideEffect.extraDamage *
              (user.name === name ? user.maxHealth : enemy.maxHealth)
          );
          break;
        default:
          break;
      }
    },
    [adjustHealth, animateCharacter, enemy, user]
  );

  const attack = useCallback(
    async (
      attacker: Pokemon,
      defender: Pokemon,
      move: Move,
      activeSideEffect?: Condition
    ) => {
      setIsAttackInProgress(true);
      let canMove = true;
      if (activeSideEffect)
        canMove = await handleMoveDisableSideEffect(
          activeSideEffect,
          attacker.name
        );
      if (!canMove) {
        setIsAttackInProgress(false);
        return;
      }
      setText(`${attacker.name} used ${move?.name}!`);
      await wait(TEXT_ANIMATION_DURATION);
      const { damage, target, sideEffect } = calculateMoveImpact(
        move,
        attacker,
        defender
      );

      const isAttackSuccessful = isSuccessful(attacker.stats.accuracy);

      if (!target || !isAttackSuccessful) {
        setText("But it failed...");
        await wait(TEXT_ANIMATION_DURATION);
      } else if (damage.effectiveness)
        await animateCharacter(
          target,
          damage.type === "special" ? "special" : "damage",
          true,
          damage.type,
          move.type
        );

      if (damage.value || (!damage.value && !damage.effectiveness)) {
        handleEffectivenessMessage(damage.effectiveness, defender.name);
        await adjustHealth(defender.name, damage.value);
      }
      if (sideEffect?.name !== ConditionName.UNKNOWN && sideEffect !== null)
        await handleSideEffect(sideEffect, defender.name);
      if (damage.recoilDamage) {
        setText(`${attacker.name} was hurt by the recoil!`);
        await wait(TEXT_ANIMATION_DURATION);
        await adjustHealth(attacker.name, damage.recoilDamage);
      }
      if (damage.healthToDrain) {
        setText(`${defender.name} had it's energy drained!`);
        await wait(TEXT_ANIMATION_DURATION);
        await adjustHealth(attacker.name, damage.healthToDrain, true);
      }
      setIsAttackInProgress(false);
    },
    [
      adjustHealth,
      animateCharacter,
      handleEffectivenessMessage,
      handleMoveDisableSideEffect,
      handleSideEffect,
    ]
  );

  const handleTurnEnd = useCallback(() => {
    setTurn((prevTurn) => prevTurn + 1);
    setEnemyMove(minmaxMoveDecision(enemy.moves ?? [], enemy, user));
    setUserMove(undefined);
    setIsTurnInProgress(false);
    setIsAttackPhaseEnded(false);
  }, [enemy, setEnemyMove, setUserMove, user]);

  useEffect(() => {
    if (!isBattleEnd) setText(`What will ${user.name} do?`);
  }, [turn, isBattleEnd, user.name]);

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
      if (
        enemyMove &&
        userMove &&
        enemyElement &&
        userElement &&
        !isBattleEnd &&
        !isAttackInProgress &&
        !isAttackPhaseEnded
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

        turnState === "first-half"
          ? await attack(firstPlayer, secondPlayer, firstMove, firstSideEffect)
          : await attack(
              secondPlayer,
              firstPlayer,
              secondMove,
              secondSideEffect
            );

        setTurnState((prevState) => {
          switch (prevState) {
            case "first-half":
              return "second-half";
            case "second-half":
              setIsAttackPhaseEnded(true);
              return "first-half";
          }
        });
      }
    })();
  }, [
    attack,
    enemy,
    enemyElement,
    enemyMove,
    enemySideEffect,
    isAttackInProgress,
    isAttackPhaseEnded,
    isBattleEnd,
    turnState,
    user,
    userElement,
    userMove,
    userSideEffect,
  ]);

  useEffect(() => {
    (async () => {
      if (userHealth && enemyHealth) return;
      setIsBattleEnd(true);
      await wait(healthAnimationDuration + 500);
      if (userHealth === 0) {
        userElement?.classList.add("loser");
        setText(`You lost the battle!`);
      } else if (enemyHealth === 0) {
        enemyElement?.classList.add("loser");
        setText(`You won the battle!`);
      }
      await wait(3000);
      setCloseModal(true);
    })();
  }, [
    enemyElement,
    healthAnimationDuration,
    enemyHealth,
    handleTurnEnd,
    userElement,
    userHealth,
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
  };
};

export default useBattleSequence;
