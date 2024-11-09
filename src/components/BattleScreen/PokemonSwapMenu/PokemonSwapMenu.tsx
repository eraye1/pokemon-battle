import React from 'react';
import { Pokemon } from '../../../types';
import { StyledPokemonSwapMenu } from './PokemonSwapMenu.styled';

interface PokemonSwapMenuProps {
  team: Pokemon[];
  teamState: Array<{ health: number; maxHealth: number; sideEffect?: any }>;
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  forcedSwap?: boolean;
}

const PokemonSwapMenu: React.FC<PokemonSwapMenuProps> = ({
  team,
  teamState,
  currentIndex,
  onSelect,
  onClose,
  forcedSwap = false,
}) => {
  return (
    <StyledPokemonSwapMenu>
      <div className="overlay" onClick={forcedSwap ? undefined : onClose} />
      <div className="menu">
        <h2>{forcedSwap ? "Choose Next Pokemon" : "Switch Pokemon"}</h2>
        <div className="pokemon-list">
          {team.map((pokemon, index) => {
            const isFainted = teamState[index].health <= 0;
            return (
              <button
                key={index}
                className={`pokemon-option ${index === currentIndex ? 'active' : ''} ${
                  isFainted ? 'fainted' : ''
                }`}
                onClick={() => !isFainted && onSelect(index)}
                disabled={index === currentIndex || isFainted}
              >
                <img src={pokemon.sprites.default} alt={pokemon.name} />
                <div className="info">
                  <span className="name">{pokemon.name}</span>
                  <div className="health-bar">
                    <div
                      className="health-fill"
                      style={{
                        width: `${(teamState[index].health / teamState[index].maxHealth) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="health">
                    {teamState[index].health} / {teamState[index].maxHealth}
                  </span>
                  {isFainted && <span className="status">Fainted</span>}
                  {!isFainted && teamState[index].sideEffect && (
                    <span className="status">{teamState[index].sideEffect.name}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {!forcedSwap && (
          <button className="close-button" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>
    </StyledPokemonSwapMenu>
  );
};

export default PokemonSwapMenu; 