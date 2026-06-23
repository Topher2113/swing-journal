/// <reference types="jest" />
import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import VerifyEmailScreen from '@/app/(auth)/verify-email';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('@/constants/theme').darkColors,
    mode: 'dark',
    isDark: true,
    setMode: jest.fn(),
  }),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ email: 'dancer@example.com' }),
}));

// jest.fn() so individual tests can override with mockReturnValueOnce
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({ linkError: null, clearLinkError: jest.fn() })),
}));

// Ionicons uses native fonts that crash in Jest — swap for a plain Text node
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: (props: { name: string; testID?: string }) =>
      require('react').createElement(Text, { testID: props.testID }, props.name),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SearchBar', () => {
  it('renders the placeholder text in the text input', async () => {
    await render(<SearchBar value="" onChange={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search…')).toBeOnTheScreen();
  });

  it('reflects typed text in the input display value', async () => {
    // Stateful wrapper so the controlled TextInput re-renders with the new value
    function SearchBarWithState() {
      const [val, setVal] = React.useState('');
      return <SearchBar value={val} onChange={setVal} placeholder="Find a move…" />;
    }

    const user = userEvent.setup();
    await render(<SearchBarWithState />);

    await user.type(screen.getByPlaceholderText('Find a move…'), 'salsa');

    expect(screen.getByDisplayValue('salsa')).toBeOnTheScreen();
  });

  it('calls onChange with an empty string when the clear button is pressed', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<SearchBar value="spin" onChange={onChange} />);

    await user.press(screen.getByLabelText('Clear search'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});

describe('SegmentedControl', () => {
  it('calls onChange with the correct option value when the user presses a segment', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(
      <SegmentedControl options={['Moves', 'Songs', 'Line Dances']} value="Moves" onChange={onChange} />,
    );

    await user.press(screen.getByText('Songs'));

    expect(onChange).toHaveBeenCalledWith('Songs');
  });

  it('still fires onChange when the user presses the already-active segment', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(
      <SegmentedControl options={['Moves', 'Songs', 'Line Dances']} value="Moves" onChange={onChange} />,
    );

    await user.press(screen.getByText('Moves'));

    expect(onChange).toHaveBeenCalledWith('Moves');
  });
});

describe('SectionHeader', () => {
  it('renders the section title and hides the "See all" button when no callback is provided', async () => {
    await render(<SectionHeader title="Recent Moves" />);

    expect(screen.getByText('Recent Moves')).toBeOnTheScreen();
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

describe('SaveButton', () => {
  it('displays the label when idle and switches to "Saving…" while saving', async () => {
    const onPress = jest.fn();
    await render(<SaveButton label="Save Move" saving={false} onPress={onPress} />);

    expect(screen.getByRole('button')).toBeOnTheScreen();
    expect(screen.getByText('Save Move')).toBeOnTheScreen();

    await screen.rerender(<SaveButton label="Save Move" saving={true} onPress={onPress} />);

    expect(screen.getByText('Saving…')).toBeOnTheScreen();
  });

  it('fires onPress when the button is enabled', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<SaveButton label="Save Move" saving={false} onPress={onPress} />);

    await user.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when the disabled prop is set', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<SaveButton label="Save Move" saving={false} disabled onPress={onPress} />);

    await user.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('VerifyEmailScreen', () => {
  // Fake timers stop the 60-second cooldown interval from leaking between tests
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows a success message after the user requests an email resend', async () => {
    const user = userEvent.setup();
    await render(<VerifyEmailScreen />);

    await user.press(screen.getByText('Resend Email'));

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

    expect(screen.queryByText(/Too many resend attempts/)).toBeNull();

    await user.press(screen.getByText('Resend Email'));

    await waitFor(() => {
      expect(
        screen.getByText('Too many resend attempts. Please wait a few minutes before trying again.'),
      ).toBeOnTheScreen();
    });
  });

  it('displays a linkError from AuthContext on mount without user action', async () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      linkError: 'Your link has expired.',
      clearLinkError: jest.fn(),
    });
    await render(<VerifyEmailScreen />);

    expect(await screen.findByText('Your link has expired.')).toBeOnTheScreen();
  });

  it('navigates back to sign-in when the "Back to sign in" button is pressed', async () => {
    const { router } = require('expo-router');
    const user = userEvent.setup();
    await render(<VerifyEmailScreen />);

    await user.press(screen.getByText('Back to sign in'));

    expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('shows a generic error when the resend call fails for a non-rate-limit reason', async () => {
    (supabase.auth.resend as any).mockResolvedValueOnce({
      error: new Error('network error'),
    });
    const user = userEvent.setup();
    await render(<VerifyEmailScreen />);

    await user.press(screen.getByText('Resend Email'));

    expect(
      await screen.findByText('Could not resend. Check your connection and try again.'),
    ).toBeOnTheScreen();
  });
});
