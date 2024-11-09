import React, { useEffect, useRef, useState } from "react";
import useBattleSequence from "../../hooks/useBattleSequence";
import { Move, Player, Pokemon } from "../../types";
import { minmaxMoveDecision } from "../../utils/moves";
import { StyledBattleScreenContainer } from "./BattleScreen.styled";
import Footer from "./Footer";
import HealthBar from "./HealthBar";
import { getMoveFromVoiceCommand } from "../../utils/chatgpt";

interface BattleScreenProps {
  onBattleEnd: () => void;
  user: Pokemon;
  enemy: Pokemon;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  onBattleEnd,
  user,
  enemy,
}) => {
  const [enemyMove, setEnemyMove] = useState<Move | undefined>(
    minmaxMoveDecision(enemy.moves ?? [], enemy, user)
  );
  console.log(user, enemy);
  const [userMove, setUserMove] = useState<Move>();
  const userRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const {
    userHealth,
    enemyHealth,
    userSideEffect,
    enemySideEffect,
    text,
    isTurnInProgress,
    isBattleEnd,
    closeModal,
  } = useBattleSequence({
    user,
    enemy,
    setEnemyMove,
    userMove,
    setUserMove,
    enemyMove,
    userElement: userRef.current,
    enemyElement: enemyRef.current,
  });

  useEffect(() => {
    if (closeModal) onBattleEnd();
  }, [closeModal, onBattleEnd]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          console.log('Voice input:', transcript);

          // Only process voice command if it's the user's turn
          if (!isTurnInProgress && !isBattleEnd && user.moves) {
            const selectedMove = await getMoveFromVoiceCommand(transcript, user.name, user.moves);
            if (selectedMove) {
              console.log('ChatGPT selected move:', selectedMove.name);
              setUserMove(selectedMove);
            }
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [isTurnInProgress, isBattleEnd, user.moves]);

  return (
    <StyledBattleScreenContainer>
      <div className={`user ${user.name}`} id={Player.User} ref={userRef}>
        <img src={user.sprites.battle_back} alt="" />
      </div>
      <HealthBar
        player={Player.User}
        name={user.name}
        level={100}
        health={userHealth}
        maxHealth={user.maxHealth}
        sideEffect={userSideEffect?.name}
      />
      <div className={`enemy ${enemy.name}`} id={Player.Enemy} ref={enemyRef}>
        <img src={enemy.sprites.battle_front} alt="" />
      </div>
      <HealthBar
        player={Player.Enemy}
        name={enemy.name}
        level={100}
        health={enemyHealth}
        maxHealth={enemy.maxHealth}
        sideEffect={enemySideEffect?.name}
      />
      <Footer
        disabled={isTurnInProgress || isBattleEnd}
        displayText={text}
        moveSet={user.moves ?? []}
        onMoveSelect={(move) => setUserMove(move)}
      />
    </StyledBattleScreenContainer>
  );
};
