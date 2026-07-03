import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiFetch } from '../api';

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const [activeCall, setActiveCall] = useState(null); // { communityId, communityName, token, url, room }

  const joinCall = useCallback(async (communityId, communityName) => {
    const data = await apiFetch('/api/livekit/token', {
      method: 'POST',
      body: JSON.stringify({ community_id: communityId }),
    });
    apiFetch('/api/livekit/session-start', {
      method: 'POST',
      body: JSON.stringify({ community_id: communityId }),
    }).catch(() => {});
    setActiveCall({ communityId, communityName, ...data });
  }, []);

  const leaveCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return (
    <CallContext.Provider value={{ activeCall, joinCall, leaveCall }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext) || { activeCall: null, joinCall: async () => {}, leaveCall: () => {} };
}
