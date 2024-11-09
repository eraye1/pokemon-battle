import styled from "styled-components";

export const StyledTrainerList = styled.div`
  padding: 1rem;
  max-height: 80vh;
  overflow-y: auto;
  flex: 1;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;

    &:hover {
      background: #555;
    }
  }

  .trainer-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .trainer-card {
    background: #fff;
    border: 2px solid #ccc;
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    &:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.selected {
      border-color: #e3350d;
      background: #fff5f5;
      box-shadow: 0 0 0 2px #e3350d;
      transform: translateY(-2px);

      h3 {
        color: #e3350d;
      }
    }

    .trainer-sprite {
      width: 120px;
      height: 120px;
      object-fit: contain;
      margin: 0 auto;
      display: block;
    }

    h3 {
      margin: 0.5rem 0;
      text-align: center;
    }

    p {
      font-size: 0.9rem;
      color: #666;
      text-align: center;
      margin-bottom: 1rem;
    }

    .pokemon-team {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      width: 100%;

      .team-pokemon {
        width: 60px;
        height: 60px;
        object-fit: contain;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
`; 