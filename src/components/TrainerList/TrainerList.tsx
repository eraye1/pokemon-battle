import React, { useState } from "react";
import { Player, Pokemon, Trainer } from "../../types";
import { StyledTrainerList } from "./TrainerList.styled";
import { useGetPokemonByNameQuery, useGetPokemonMovesetByNameQuery } from "../../app/api";
import { skipToken } from "@reduxjs/toolkit/query";

interface TrainerListProps {
  player: Player;
  onTrainerSelection: (trainer: Trainer) => void;
  selectedOpponentId?: string;
}

const TRAINERS_CONFIG = [
  {
    id: "ash",
    name: "Ash Ketchum",
    sprite: "/trainers/ash.png",
    description: "Pokemon Master from Pallet Town",
    teamNames: ["pikachu", "charizard", "bulbasaur", "squirtle"],
    isMale: true,
  },
  {
    id: "misty",
    name: "Misty",
    sprite: "/trainers/misty.png",
    description: "Cerulean City Gym Leader",
    teamNames: ["starmie", "gyarados", "psyduck", "staryu"],
    isMale: false,
  },
  {
    id: "brock",
    name: "Brock",
    sprite: "/trainers/brock.png",
    description: "Pewter City Gym Leader",
    teamNames: ["onix", "geodude", "vulpix", "steelix"],
    isMale: true,
  },
  {
    id: "zach",
    name: "Zach Cohen",
    sprite: "/trainers/zach.png",
    description: "A16Z Gym Leader",
    isMale: true,
    teamNames: ["zapdos", "moltres", "articuno", "dragonite"]
  }
];

export const TrainerList: React.FC<TrainerListProps> = ({
  player,
  onTrainerSelection,
  selectedOpponentId,
}) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>();

  // Call hooks for each Pokemon in each trainer's team
  const trainers = TRAINERS_CONFIG.map(trainer => {
    const team = trainer.teamNames.map(name => {
      const { data: pokemon, isLoading: isPokemonLoading } = useGetPokemonByNameQuery(name);
      
      // Only fetch moves if we have the Pokemon data
      const { data: moves, isLoading: isMovesLoading } = useGetPokemonMovesetByNameQuery(
        pokemon ? {
          name: pokemon.name,
          moves: pokemon.moveNames,
        } : skipToken
      );

      return { 
        pokemon, 
        moves,
        isLoading: isPokemonLoading || isMovesLoading 
      };
    });
    return { ...trainer, team };
  });

  // Check if any Pokemon data is still loading
  const isLoading = trainers.some(trainer => 
    trainer.team.some(({ isLoading }) => isLoading)
  );

  if (isLoading) {
    return <div>Loading trainers...</div>;
  }

  // Transform the data into the correct format once everything is loaded
  const processedTrainers: Trainer[] = trainers.map(trainer => ({
    ...trainer,
    team: trainer.team
      .map(({ pokemon, moves }) => pokemon && moves ? {
        ...pokemon,
        moves
      } : undefined)
      .filter((pokemon): pokemon is Pokemon => pokemon !== undefined)
  }));

  return (
    <StyledTrainerList>
      <h2>{player === Player.User ? "Select Your Trainer" : "Select Opponent"}</h2>
      <div className="trainer-grid">
        {processedTrainers.map((trainer) => (
          <button
            key={trainer.id}
            className={`trainer-card ${
              selectedOpponentId === trainer.id ? "disabled" : ""
            } ${selectedTrainerId === trainer.id ? "selected" : ""}`}
            onClick={() => {
              setSelectedTrainerId(trainer.id);
              onTrainerSelection(trainer);
            }}
            disabled={selectedOpponentId === trainer.id}
          >
            <img src={trainer.sprite} alt={trainer.name} className="trainer-sprite" />
            <h3>{trainer.name}</h3>
            <p>{trainer.description}</p>
            <div className="pokemon-team">
              {trainer.team.map((pokemon, index) => (
                <img
                  key={index}
                  src={pokemon.sprites.default}
                  alt={pokemon.name}
                  className="team-pokemon"
                  title={pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </StyledTrainerList>
  );
};

export default TrainerList; 