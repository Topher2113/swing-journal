/// <reference types="jest" />
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import VerifyEmailScreen from '@/app/(auth)/verify-email';
import { supabase } from '@/lib/supabase';

// ── Module mocks ──────────────────────────────────────────────────────────────

// ThemeContext: every component calls useTheme(); return dark palette so styles resolve.
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('@/constants/theme').darkColors,
    mode: 'dark',
    isDark: true,
    setMode: jest.fn(),
  }),
}));

// expo-router: VerifyEmailScreen reads the email param and calls router.replace.
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ email: 'dancer@example.com' }),
}));

// AuthContext: VerifyEmailScreen reads linkError to surface deep-link failures.
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ linkError: null, clearLinkError: jest.fn() }),
}));

// Vector icons: Ionicons renders native font glyphs which crash in Jest.
// Replace with a plain Text element so RNTL can still find surrounding elements.
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: (props: { name: string; testID?: string }) =>
      require('react').createElement(Text, { testID: props.testID }, props.name),
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ── SearchBar ─────────────────────────────────────────────────────────────────

describe('SearchBar', () => {
  it('renders the placeholder text in the text input', async () => {
    await render(<SearchBar value="" onChange={jest.fn()} />);

    // getByPlaceholderText — verify the input is findable by its placeholder
    expect(screen.getByPlaceholderText('Search…')).toBeOnTheScreen();
  });

  it('reflects typed text in the input display value', async () => {
    // Wrap in a stateful parent so the controlled TextInput re-renders with the new value
    function SearchBarWithState() {
      const [val, setVal] = React.useState('');
      return <SearchBar value={val} onChange={setVal} placeholder="Find a move…" />;
    }

    const user = userEvent.setup();
    await render(<SearchBarWithState />);

    await user.type(screen.getByPlaceholderText('Find a move…'), 'salsa');

    // getByDisplayValue — the input now shows what the user typed
    expect(screen.getByDisplayValue('salsa')).toBeOnTheScreen();
  });

  it('calls onChange with an empty string when the clear button is pressed', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<SearchBar value="spin" onChange={onChange} />);

    // getByLabelText — targets the clear Pressable via accessibilityLabel="Clear search"
    await user.press(screen.getByLabelText('Clear search'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});

// ── SegmentedControl ──────────────────────────────────────────────────────────

describe('SegmentedControl', () => {
  it('calls onChange with the correct option value when the user presses a segment', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(
      <SegmentedControl
        options={['Moves', 'Songs', 'Line Dances']}
        value="Moves"
        onChange={onChange}
      />,
    );

    // getByText — all option labels are visible text
    await user.press(screen.getByText('Songs'));

    expect(onChange).toHaveBeenCalledWith('Songs');
  });
});

// ── SectionHeader ─────────────────────────────────────────────────────────────

describe('SectionHeader', () => {
  it('renders the section title and hides the "See all" button when no callback is provided', async () => {
    await render(<SectionHeader title="Recent Moves" />);

    expect(screen.getByText('Recent Moves')).toBeOnTheScreen();

    // queryByText — returns null rather than throwing when the element is absent
    expect(screen.queryByText('See all →')).toBeNull();
  });

  it('calls onSeeAll when the "See all" button is pressed', async () => {
    const onSeeAll = jest.fn();
    const user = userEvent.setup();
    await render(<SectionHeader title="Practice These" onSeeAll={onSeeAll} />);

    await user.press(screen.getByText('See all →'));

    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });
});

// ── SaveButton ────────────────────────────────────────────────────────────────

describe('SaveButton', () => {
  it('displays the label when idle and switches to "Saving…" while an operation is in progress', async () => {
    const onPress = jest.fn();
    await render(<SaveButton label="Save Move" saving={false} onPress={onPress} />);

    // getByRole — Pressable exposes role="button" via the prop added during cleanup
    expect(screen.getByRole('button')).toBeOnTheScreen();
    expect(screen.getByText('Save Move')).toBeOnTheScreen();

    await screen.rerender(<SaveButton label="Save Move" saving={true} onPress={onPress} />);

    expect(screen.getByText('Saving…')).toBeOnTheScreen();
  });
});

// ── VerifyEmailScreen (async component) ───────────────────────────────────────
// VerifyEmailScreen calls supabase.auth.resend — an async network operation — when
// the user presses "Resend Email". These tests cover the async success and error paths.

describe('VerifyEmailScreen', () => {
  // Fake timers prevent the 60-second cooldown interval from firing after each test.
  // RNTL's waitFor and findBy* both handle fake timers automatically.
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows a success message after the user requests an email resend', async () => {
    // Default supabase mock resolves with { error: null } — no override needed.
    const user = userEvent.setup();
    await render(<VerifyEmailScreen />);

    await user.press(screen.getByText('Resend Email'));

    // findByText — async query that resolves once state updates after the Promise settles
    expect(
      await screen.findByText('Email resent! Check your inbox and spam folder.'),
    ).toBeOnTheScreen();
  });

  it('shows a rate-limit error when the resend call returns an error', async () => {
    (supabase.auth.resend as any).mockResolvedValueOnce({
      error: new Error('rate limit exceeded'),
    });
    const user = userEvent.setup();
    await render(<VerifyEmailScreen />);

    // queryByText — confirm error is absent before any action
    expect(screen.queryByText(/Too many resend attempts/)).toBeNull();

    await user.press(screen.getByText('Resend Email'));

    // waitFor — explicitly polls until the async resend resolves and the error state is set
    await waitFor(() => {
      expect(
        screen.getByText(
          'Too many resend attempts. Please wait a few minutes before trying again.',
        ),
      ).toBeOnTheScreen();
    });
  });
});
