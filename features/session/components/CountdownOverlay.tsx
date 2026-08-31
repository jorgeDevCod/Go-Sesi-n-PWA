"use client";

import { useEffect, useRef, useState } from "react";

export function CountdownOverlay({
  seconds,
  onComplete,
}: {
  seconds: number;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
    // Runs once on mount; a single persistent interval, unaffected by
    // parent re-renders.
  }, []);

  useEffect(() => {
    // Calling onComplete here-its own effect, after commit-rather than
    // from inside the setRemaining updater above is required: nesting a
    // cross-component setState call inside another component's state
    // updater is what React's "Cannot update a component while rendering a
    // different component" error is warning about.
    if (remaining === 0) {
      onCompleteRef.current();
    }
  }, [remaining]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <p className="text-lg text-muted-foreground">Prepárate...</p>
      <span className="text-6xl font-semibold tabular-nums text-foreground">
        {remaining}
      </span>
    </div>
  );
}
