import React, { useEffect, useRef, useState } from "react";
import useBattleSequence from "../../hooks/useBattleSequence";
import { Move, Player, Pokemon, Trainer } from "../../types";
import { minmaxMoveDecision } from "../../utils/moves";
import { StyledBattleScreenContainer } from "./BattleScreen.styled";
import Footer from "./Footer";
import HealthBar from "./HealthBar";
import { getMoveFromVoiceCommand } from "../../utils/chatgpt";
import PokemonSwapMenu from "./PokemonSwapMenu/PokemonSwapMenu";

interface BattleScreenProps {
  onBattleEnd: () => void;
  userTrainer: Trainer;
  enemyTrainer: Trainer;
  initialUserPokemonIndex?: number;
  initialEnemyPokemonIndex?: number;
}

type PokemonBattleState = {
  health: number;
  maxHealth: number;
  sideEffect?: any;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({
  onBattleEnd,
  userTrainer,
  enemyTrainer,
  initialUserPokemonIndex = 0,
  initialEnemyPokemonIndex = 0,
}) => {
  // Track the current active Pokemon indices
  const [userPokemonIndex, setUserPokemonIndex] = useState(initialUserPokemonIndex);
  const [enemyPokemonIndex, setEnemyPokemonIndex] = useState(initialEnemyPokemonIndex);

  // Track the state of all Pokemon in both teams
  const [userTeamState, setUserTeamState] = useState<PokemonBattleState[]>(
    userTrainer.team.map(pokemon => ({
      health: pokemon.maxHealth,
      maxHealth: pokemon.maxHealth
    }))
  );

  const [enemyTeamState, setEnemyTeamState] = useState<PokemonBattleState[]>(
    enemyTrainer.team.map(pokemon => ({
      health: pokemon.maxHealth,
      maxHealth: pokemon.maxHealth
    }))
  );

  // Get current active Pokemon
  const user = userTrainer.team[userPokemonIndex];
  const enemy = enemyTrainer.team[enemyPokemonIndex];

  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [enemyMove, setEnemyMove] = useState<Move | undefined>();
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
    onHealthChange: (player, newHealth) => {
      if (player === Player.User) {
        const newTeamState = [...userTeamState];
        newTeamState[userPokemonIndex].health = newHealth;
        setUserTeamState(newTeamState);
      } else {
        const newTeamState = [...enemyTeamState];
        newTeamState[enemyPokemonIndex].health = newHealth;
        setEnemyTeamState(newTeamState);
      }
    },
    onStatusChange: (player, newStatus) => {
      if (player === Player.User) {
        const newTeamState = [...userTeamState];
        newTeamState[userPokemonIndex].sideEffect = newStatus;
        setUserTeamState(newTeamState);
      } else {
        const newTeamState = [...enemyTeamState];
        newTeamState[enemyPokemonIndex].sideEffect = newStatus;
        setEnemyTeamState(newTeamState);
      }
    }
  });

  const handleSwapPokemon = (newIndex: number) => {
    if (isTurnInProgress || newIndex === userPokemonIndex) return;
    
    setUserPokemonIndex(newIndex);
    setShowSwapMenu(false);
    
    // Enemy gets a free attack when you swap
    setEnemyMove(minmaxMoveDecision(enemy.moves ?? [], enemy, userTrainer.team[newIndex]));
  };

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
          if (!isTurnInProgress && !isBattleEnd) {
            const selectedMove = await getMoveFromVoiceCommand(transcript, user.name);
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
        health={userTeamState[userPokemonIndex].health}
        maxHealth={user.maxHealth}
        sideEffect={userTeamState[userPokemonIndex].sideEffect?.name}
      />
      <div className={`enemy ${enemy.name}`} id={Player.Enemy} ref={enemyRef}>
        <img src={enemy.sprites.battle_front} alt="" />
      </div>
      <HealthBar
        player={Player.Enemy}
        name={enemy.name}
        level={100}
        health={enemyTeamState[enemyPokemonIndex].health}
        maxHealth={enemy.maxHealth}
        sideEffect={enemyTeamState[enemyPokemonIndex].sideEffect?.name}
      />
      <Footer
        disabled={isTurnInProgress || isBattleEnd}
        displayText={text}
        moveSet={user.moves ?? []}
        onMoveSelect={(move) => setUserMove(move)}
        onSwapClick={() => setShowSwapMenu(true)}
      />
      {showSwapMenu && (
        <PokemonSwapMenu
          team={userTrainer.team}
          teamState={userTeamState}
          currentIndex={userPokemonIndex}
          onSelect={handleSwapPokemon}
          onClose={() => setShowSwapMenu(false)}
        />
      )}
    </StyledBattleScreenContainer>
  );
};
