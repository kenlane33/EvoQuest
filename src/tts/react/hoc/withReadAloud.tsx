'use client';

import type { ComponentType, ReactNode } from 'react';
import { ReadAloudProvider } from '../ReadAloudProvider';
import { PageReadAloudProvider } from '../page-read-aloud-context';
import { usePageReadAloud } from '../../hooks/use-page-read-aloud';

type WithReadAloudProvidersOptions = {
  enabled?: boolean;
  autoRead?: boolean;
  voice?: string;
  volume?: number;
  setVoice?: (voice: string) => void;
  setAutoRead?: (autoRead: boolean) => void;
  setEnabled?: (enabled: boolean) => void;
};

/**
 * HOC that wraps a component with ReadAloudProvider + PageReadAloudProvider.
 * Pass settings from your app store via options or use AppReadAloudProvider instead.
 */
export function withReadAloudProviders<P extends object>(
  Component: ComponentType<P>,
  options: WithReadAloudProvidersOptions = {},
) {
  const {
    enabled = true,
    autoRead = false,
    voice = 'azelma',
    volume = 0.6,
    setVoice = () => {},
    setAutoRead = () => {},
    setEnabled,
  } = options;

  function Wrapped(props: P) {
    return (
      <ReadAloudProvider
        enabled={enabled}
        autoRead={autoRead}
        voice={voice}
        volume={volume}
        setVoice={setVoice}
        setAutoRead={setAutoRead}
        setEnabled={setEnabled}
      >
        <PageReadAloudProvider>
          <Component {...props} />
        </PageReadAloudProvider>
      </ReadAloudProvider>
    );
  }

  Wrapped.displayName = `withReadAloudProviders(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
}

type WithPageReadAloudOptions = {
  autoRead?: boolean;
  autoReadKey?: string;
  getAutoReadKey?: (props: object) => string;
};

/**
 * HOC that registers a page's readable text with the global Read-it bar.
 * getText receives the wrapped component's props.
 */
export function withPageReadAloud<P extends object>(
  Component: ComponentType<P>,
  getText: (props: P) => string,
  options: WithPageReadAloudOptions = {},
) {
  function Wrapped(props: P) {
    const text = getText(props);
    const autoReadKey = options.getAutoReadKey?.(props) ?? options.autoReadKey ?? text.trim();
    usePageReadAloud(text, { autoRead: options.autoRead, autoReadKey });
    return <Component {...props} />;
  }

  Wrapped.displayName = `withPageReadAloud(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
}

/** Convenience wrapper combining both providers for app roots. */
export function ReadAloudRoot({
  children,
  enabled,
  autoRead,
  voice,
  volume,
  setVoice,
  setAutoRead,
  setEnabled,
}: {
  children: ReactNode;
  enabled: boolean;
  autoRead: boolean;
  voice: string;
  volume: number;
  setVoice: (voice: string) => void;
  setAutoRead: (autoRead: boolean) => void;
  setEnabled?: (enabled: boolean) => void;
}) {
  return (
    <ReadAloudProvider
      enabled={enabled}
      autoRead={autoRead}
      voice={voice}
      volume={volume}
      setVoice={setVoice}
      setAutoRead={setAutoRead}
      setEnabled={setEnabled}
    >
      <PageReadAloudProvider>{children}</PageReadAloudProvider>
    </ReadAloudProvider>
  );
}
