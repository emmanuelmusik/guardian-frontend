import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { useCall } from '../context/CallContext.jsx';

// This route's only job is to make sure a call is active for this
// community (e.g. on a fresh page load or direct link). The actual
// call UI is rendered by the persistent <FloatingCall />, mounted at
// the app level — that's what lets it survive navigating elsewhere.
export default function CommunityCall() {
  const { id } = useParams();
  const { activeCall, joinCall } = useCall();

  useEffect(() => {
    if (!activeCall || activeCall.communityId !== id) {
      apiFetch(`/api/communities/${id}`)
        .then((c) => joinCall(id, c.name))
        .catch(() => {});
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
