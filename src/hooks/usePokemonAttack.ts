import { useState } from "react";
import { TEXT_ANIMATION_DURATION } from "../constants";
import {
  Condition,
  ConditionName,
  Move,
  Pokemon,
  UnknownEffect,
} from "../types";
import { calculateMoveImpact, isSuccessful } from "../utils/battle";
import { wait } from "../utils/helper";
import useMoveAnimation from "./useMoveAnimation";
import { generateSoundEffect } from "../utils/eleven";

const usePokemonAttack = (
  userElement: HTMLElement | null,
  enemyElement: HTMLElement | null,
  setText: (text: string) => void,
  handleMoveDisableSideEffect: (
    activeSideEffect: Condition,
    name: string
  ) => Promise<boolean>,
  handleSideEffect: (
    sideEffect: Exclude<Condition, UnknownEffect>,
    name: string
  ) => Promise<void>,
  adjustHealth: (
    playerName: string,
    amount: number,
    isGaining?: boolean
  ) => Promise<void>
) => {
  const [isAttackInProgress, setIsAttackInProgress] = useState(false);
  const animateCharacter = useMoveAnimation(userElement, enemyElement);

  const handleEffectivenessMessage = (effectiveness: number, name: string) => {
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
  };

  const handleSoundEffect = async (move: Move) => {
    try {
      const audioStream = await generateSoundEffect(move.name);
      const readableStream = audioStream.readableStream;
      
      // Check if stream is locked before proceeding
      if (readableStream.locked) {
        console.log('Stream is locked, waiting for previous reader to finish');
        // Either wait for previous reader or handle the locked state
        return;
      }
      
      // Create a reader and store it
      const reader = readableStream.getReader();
      
      try {
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        await audio.play();
        
        // Clean up
        URL.revokeObjectURL(url);
      } finally {
        // Always release the lock when done
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error handling sound effect:', error);
    }
  };
  
  const handleAttack = async (
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
      await handleSoundEffect(move);
      await animateCharacter(
        target,
        damage.type === "status" ? "status" : "damage",
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
  };

  return { handleAttack, isAttackInProgress };
};

export default usePokemonAttack;
