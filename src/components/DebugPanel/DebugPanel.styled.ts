import styled from 'styled-components';

export const StyledDebugPanel = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20px;
  font-family: monospace;
  overflow-y: auto;
  z-index: 1000;

  .debug-entry {
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 10px;
  }

  .voice-input {
    color: #98ff98;
  }

  .gpt-output {
    color: #87ceeb;
  }

  .timestamp {
    color: #aaa;
    font-size: 0.8em;
  }
`; 