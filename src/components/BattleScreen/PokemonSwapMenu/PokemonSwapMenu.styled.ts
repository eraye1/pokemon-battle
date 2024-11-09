import styled from 'styled-components';

export const StyledPokemonSwapMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .menu {
    position: relative;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    min-width: 300px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h2 {
      text-align: center;
      margin-bottom: 1rem;
    }

    .pokemon-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pokemon-option {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 2px solid #ccc;
      border-radius: 8px;
      background: none;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: #4CAF50;
        background: #E8F5E9;
      }

      &.fainted {
        opacity: 0.5;
        cursor: not-allowed;
      }

      img {
        width: 60px;
        height: 60px;
        margin-right: 1rem;
      }

      .info {
        flex: 1;
        text-align: left;

        .name {
          display: block;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .health-bar {
          height: 8px;
          background: #ddd;
          border-radius: 4px;
          margin-bottom: 0.5rem;

          .health-fill {
            height: 100%;
            background: #4CAF50;
            border-radius: 4px;
            transition: width 0.3s;
          }
        }

        .health {
          display: block;
          font-size: 0.9rem;
          color: #666;
        }

        .status {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #ff9800;
          color: white;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      }
    }

    .close-button {
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #d32f2f;
      }
    }
  }
`; 