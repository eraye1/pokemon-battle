import React from 'react';
import { StyledDebugPanel } from './DebugPanel.styled';

export type DebugEntry = {
  timestamp: Date;
  voiceInput?: string;
  gptOutput?: any;
};

interface DebugPanelProps {
  entries: DebugEntry[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ entries }) => {
  return (
    <StyledDebugPanel>
      {entries.map((entry, index) => (
        <div key={index} className="debug-entry">
          <div className="timestamp">
            {entry.timestamp.toLocaleTimeString()}
          </div>
          {entry.voiceInput && (
            <div className="voice-input">
              🎤 {entry.voiceInput}
            </div>
          )}
          {entry.gptOutput && (
            <div className="gpt-output">
              🤖 {JSON.stringify(entry.gptOutput, null, 2)}
            </div>
          )}
        </div>
      ))}
    </StyledDebugPanel>
  );
};

export default DebugPanel; 