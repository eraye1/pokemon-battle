import React, { useEffect, useRef, useState } from "react";
import useBattleSequence from "../../hooks/useBattleSequence";
import { Move, Player, Trainer } from "../../types";
import { minmaxMoveDecision } from "../../utils/moves";
import { StyledBattleScreenContainer } from "./BattleScreen.styled";
import Footer from "./Footer";
import HealthBar from "./HealthBar";
import {
  getFaintVoiceLine,
  getMoveFromVoiceCommand,
  getTrainerTaunt,
} from "../../utils/chatgpt";
import PokemonSwapMenu from "./PokemonSwapMenu/PokemonSwapMenu";
import { playTrainerVoice } from "../../utils/elevenlabs";

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
  const [userPokemonIndex, setUserPokemonIndex] = useState(
    initialUserPokemonIndex
  );
  const [enemyPokemonIndex, setEnemyPokemonIndex] = useState(
    initialEnemyPokemonIndex
  );

  // Track the state of all Pokemon in both teams
  const [userTeamState, setUserTeamState] = useState<PokemonBattleState[]>(
    userTrainer.team.map((pokemon) => ({
      health: pokemon.maxHealth,
      maxHealth: pokemon.maxHealth,
      sideEffect: undefined,
    }))
  );

  const [enemyTeamState, setEnemyTeamState] = useState<PokemonBattleState[]>(
    enemyTrainer.team.map((pokemon) => ({
      health: pokemon.maxHealth,
      maxHealth: pokemon.maxHealth,
      sideEffect: undefined,
    }))
  );

  // Get current active Pokemon
  const user = userTrainer.team[userPokemonIndex];
  const enemy = enemyTrainer.team[enemyPokemonIndex];

  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [enemyMove, setEnemyMove] = useState<Move | undefined>(
    minmaxMoveDecision(enemy.moves ?? [], enemy, user)
  );
  const [userMove, setUserMove] = useState<Move>();
  const userRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
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
  } = useBattleSequence({
    user,
    enemy,
    enemyMove,
    setEnemyMove,
    setUserMove,
    userMove,
    userElement: userRef.current,
    enemyElement: enemyRef.current,
    userTeamState,
    enemyTeamState,
    isEnemyMale: enemyTrainer.isMale,
  });

  // Update team state when health changes from battle sequence
  useEffect(() => {
    if (userHealth !== undefined) {
      const newTeamState = [...userTeamState];
      newTeamState[userPokemonIndex].health = userHealth;
      setUserTeamState(newTeamState);
    }
  }, [userHealth, userPokemonIndex]);

  useEffect(() => {
    if (enemyHealth !== undefined) {
      const newTeamState = [...enemyTeamState];
      newTeamState[enemyPokemonIndex].health = enemyHealth;
      setEnemyTeamState(newTeamState);
    }
  }, [enemyHealth, enemyPokemonIndex]);

  // Update team state when side effects change
  useEffect(() => {
    if (userSideEffect) {
      const newTeamState = [...userTeamState];
      newTeamState[userPokemonIndex].sideEffect = userSideEffect;
      setUserTeamState(newTeamState);
    }
  }, [userSideEffect, userPokemonIndex]);

  useEffect(() => {
    if (enemySideEffect) {
      const newTeamState = [...enemyTeamState];
      newTeamState[enemyPokemonIndex].sideEffect = enemySideEffect;
      setEnemyTeamState(newTeamState);
    }
  }, [enemySideEffect, enemyPokemonIndex]);

  // Add state to track if we're forcing a swap due to fainted Pokemon
  const [forcedSwap, setForcedSwap] = useState(false);

  // Check if current Pokemon has fainted
  useEffect(() => {
    if (userTeamState[userPokemonIndex].health <= 0 && !isBattleEnd) {
      const sequence = async () => {
        // Play faint cry
        if (user.cries?.latest) {
          const audio = new Audio(user.cries.latest);
          await audio.play();
        }

        const hasAvailablePokemon = userTeamState.some(
          (pokemon, index) => pokemon.health > 0 && index !== userPokemonIndex
        );

        if (hasAvailablePokemon) {
          setForcedSwap(true);
          setShowSwapMenu(true);
        }
      };

      sequence();
    }
  }, [userTeamState, userPokemonIndex, isBattleEnd]);

  const handleSwapPokemon = async (newIndex: number) => {
    // Allow swap if it's forced (Pokemon fainted) or if it's not during a turn
    if ((!forcedSwap && isTurnInProgress) || newIndex === userPokemonIndex) return;
    if (userTeamState[newIndex].health <= 0) return; // Can't swap to fainted Pokemon

    // Play the cry of the new Pokemon
    const newPokemon = userTrainer.team[newIndex];
    if (newPokemon.cries?.latest) {
      const audio = new Audio(newPokemon.cries.latest);
      await audio.play();
    }

    // Then update the active Pokemon index
    setUserPokemonIndex(newIndex);
    setShowSwapMenu(false);
    setForcedSwap(false);
    setUserHealth(userTeamState[newIndex].health);
  };

  useEffect(() => {
    if (closeModal) onBattleEnd();
  }, [closeModal, onBattleEnd]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.log("Speech recognition not supported");
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          console.log("Voice input:", transcript);

          // Only process voice command if it's the user's turn and swap menu is not open
          if (!isTurnInProgress && !isBattleEnd && user.moves) {
            const result = await getMoveFromVoiceCommand(
              transcript,
              user.name,
              user.moves
            );
            if (result && result.intends_switch_pokemon) {
              if (!result.intends_pokemon_to_switch_to) {
                setForcedSwap(false); // Don't force swap if it's voluntary
                setShowSwapMenu(true);
              } else {
                handleSwapPokemon(
                  userTrainer.team.findIndex(
                    (pokemon) =>
                      pokemon.name === result.intends_pokemon_to_switch_to
                  )
                );
              }
            } else if (
              result &&
              result.move &&
              result.move.name &&
              !showSwapMenu
            ) {
              console.log("ChatGPT selected move:", result.move.name);
              setUserMove(result.move);
            }
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [isTurnInProgress, isBattleEnd, user.moves, showSwapMenu]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Add effect to handle enemy Pokemon fainting
  useEffect(() => {
    if (enemyTeamState[enemyPokemonIndex].health <= 0 && !isBattleEnd) {
      const nextPokemonIndex = enemyTeamState.findIndex(
        (pokemon, index) => pokemon.health > 0 && index !== enemyPokemonIndex
      );

      if (nextPokemonIndex !== -1) {
        const sequence = async () => {
          // Play faint cry
          if (enemy.cries?.latest) {
            const audio = new Audio(enemy.cries.latest);
            await audio.play();
          }

          const voiceLine = await getFaintVoiceLine(enemy.name);
          playTrainerVoice(`${voiceLine}`, enemyTrainer.isMale);

          setText(`${enemy.name} fainted!`);
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const nextPokemon = enemyTrainer.team[nextPokemonIndex];
          setText(
            `${enemyTrainer.name} is about to send out ${nextPokemon.name}!`
          );
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Play new Pokemon cry
          if (nextPokemon.cries?.latest) {
            const audio = new Audio(nextPokemon.cries.latest);
            await audio.play();
          }

          setEnemyPokemonIndex(nextPokemonIndex);
          setEnemyHealth(enemyTeamState[nextPokemonIndex].health);
          setEnemyMove(
            minmaxMoveDecision(
              enemyTrainer.team[nextPokemonIndex].moves ?? [],
              enemyTrainer.team[nextPokemonIndex],
              user
            )
          );
        };

        sequence();
      }
    }
  }, [
    enemyTeamState,
    enemyPokemonIndex,
    isBattleEnd,
    enemy.name,
    enemyTrainer.name,
    enemyTrainer.team,
    user,
  ]);

  // Add a timer for taunts
  useEffect(() => {
    if (isBattleEnd) return;

    const generateTaunt = async () => {
      const battleState = {
        enemyPokemon: user,
        userPokemon: enemy,
        userHealth: userTeamState[userPokemonIndex].health,
        enemyHealth: enemyTeamState[enemyPokemonIndex].health,
        userMaxHealth: user.maxHealth,
        enemyMaxHealth: enemy.maxHealth,
        userSideEffect: userTeamState[userPokemonIndex].sideEffect,
        enemySideEffect: enemyTeamState[enemyPokemonIndex].sideEffect,
      };

      const taunt = await getTrainerTaunt(battleState, enemyTrainer.name);
      if (taunt) {
        setText(taunt);
        playTrainerVoice(taunt, enemyTrainer.isMale);
      }
    };

    // Generate a taunt every 30-45 seconds
    const interval = setInterval(() => {
      // Only taunt if not in the middle of a turn or showing other messages
      if (!isTurnInProgress && !showSwapMenu && text.includes("What will")) {
        generateTaunt();
      }
    }, Math.random() * 15000 + 30000);

    return () => clearInterval(interval);
  }, [
    isBattleEnd,
    user,
    enemy,
    userTeamState,
    enemyTeamState,
    userPokemonIndex,
    enemyPokemonIndex,
    isTurnInProgress,
    showSwapMenu,
    text,
    enemyTrainer.name,
    enemyTrainer.isMale,
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  return (
    <StyledBattleScreenContainer>
      <audio ref={audioRef} src="../../public/trainer_battle.mp3" loop />
      <div className={showSwapMenu ? "blurred" : ""}>
        <div className={`user ${user.name}`} id={Player.User} ref={userRef}>
          <img src={user.sprites.battle_back} alt="" />
        </div>
        <HealthBar
          player={Player.User}
          name={user.name}
          level={100}
          health={userTeamState[userPokemonIndex].health}
          maxHealth={userTeamState[userPokemonIndex].maxHealth}
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
      </div>
      {showSwapMenu && (
        <PokemonSwapMenu
          team={userTrainer.team}
          teamState={userTeamState}
          currentIndex={userPokemonIndex}
          onSelect={handleSwapPokemon}
          onClose={() => {
            // Only allow closing if it's not a forced swap
            if (!forcedSwap) {
              setShowSwapMenu(false);
            }
          }}
          forcedSwap={forcedSwap}
        />
      )}
    </StyledBattleScreenContainer>
  );
};
