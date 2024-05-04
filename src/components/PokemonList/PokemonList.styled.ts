import styled from "styled-components";

export const StyledPokemonListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  ul {
    margin: 0;
    padding: 0;
    border-radius: 8px;
    overflow-y: auto;
    max-height: calc(100dvh - 16px - 160px - 12px - 12px - 58px - 16px);
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    /* width */
    &::-webkit-scrollbar {
      width: 1px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
      background-color: transparent;
      border-radius: 8px;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      background: white;
      border-radius: 8px;
    }

    li {
      list-style: none;
      text-align: center;
      margin-top: 1px;
      margin-left: 1px;
      max-width: calc(100% - 2px);
      border-radius: 8px;

      button {
        text-transform: capitalize;
        color: white;
        font-size: 14px;
        outline: 0;
        border: 0;
        background-color: transparent;
        padding: 8px;
        margin: 0;
        width: 100%;
        cursor: pointer;
      }

      &:hover {
        box-shadow: 0 0 0 1px white;
      }
    }
  }
`;
