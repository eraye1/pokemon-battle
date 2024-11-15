import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
from{
    opacity: 0;
}
to{
    opacity: 1;
}
`;

const physicalAttackUser = keyframes`
0%{
  transform: translateY(0%);

}
50%{
  transform: translateY(-10vh);
}

100%{
  transform: translateX(40vh) translateY(-20vh) rotate(15deg);
}
`;

const physicalAttackEnemy = keyframes`
0%{
  transform: translateY(0%);

}
50%{
  transform: translateY(-5vh);
}

100%{
  transform: translateX(-40vh) translateY(20vh) rotate(-15deg);
}
`;

export const StyledBattleScreenContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url("battle-background.webp");
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  animation: ${fadeIn} 1.5s ease-in-out forwards;

  &:after {
    content: "";
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
  }

  .user,
  .enemy {
    position: absolute;
    z-index: 999;
    img {
      width: 200%;
      height: auto;
    }

    &.damage {
      img {
        animation: ${fadeIn} 0.2s ease-in-out infinite;
      }
    }
    &.status {
      img {
        filter: invert(100%);
      }
    }
    &.loser {
      img {
        animation: ${fadeIn} reverse 1s ease-in-out forwards;
      }
    }
  }

  .user {
    left: 20%;
    bottom: 20%;

    &.physical {
      z-index: 9999;
      img {
        animation: ${physicalAttackUser} 0.8s ease-in-out;
      }
    }
    &.special {
      z-index: 9999;
      position: relative;
    }
  }
  .enemy {
    right: 32%;
    top: 25%;

    &.physical {
      z-index: 9999;
      img {
        animation: ${physicalAttackEnemy} 0.8s ease-in-out;
      }
    }
  }

  .enemy-trainer {
    position: absolute;
    right: 10%;
    top: 10%;
    z-index: 1;
    transform: scale(0.7);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    pointer-events: none;

    &.visible {
      opacity: 1;
    }

    img {
      max-height: 200px;
      object-fit: contain;
    }
  }

  @media (max-width: 750px) {
    .user,
    .enemy {
      img {
        width: 150%;
        height: auto;
      }
    }
    .enemy {
      right: 28%;
      top: 20%;
    }
  }
  @media (max-width: 550px) {
    .user,
    .enemy {
      img {
        width: 100%;
        height: auto;
      }
    }
    .enemy {
      right: 23%;
      top: 25%;
    }
  }
`;
