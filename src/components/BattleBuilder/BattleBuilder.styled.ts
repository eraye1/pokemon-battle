import styled from "styled-components";

export const StyledBattleBuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  
  h1 {
    text-align: center;
    margin-bottom: 1rem;
  }

  .container {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    overflow: hidden;
  }

  .hr {
    width: 2px;
    background: #ccc;
    margin: 0 1rem;
  }

  .battle-button {
    margin-top: 1rem;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 8px;
    background: #e3350d;
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #ff4422;
      transform: translateY(-2px);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
`;
