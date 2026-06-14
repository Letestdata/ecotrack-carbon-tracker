import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '../context/AppContext';
import type { ActivityEntry, ChatMessage } from '../types';

const TestComponent = () => {
  const {
    state,
    navigate,
    updateProfile,
    addEntry,
    deleteEntry,
    addChatMessage,
    clearChat,
    totalMonthCo2e,
    todayCo2e,
    categoryBreakdown,
  } = useApp();

  const handleAddEntry = () => {
    const entry: ActivityEntry = {
      id: 'e1',
      category: 'transport',
      subcategory: 'car_petrol',
      value: 10,
      co2e: 1.92,
      unit: 'km',
      date: new Date().toISOString().slice(0, 10),
    };
    addEntry(entry);
  };

  const handleDeleteEntry = () => {
    const today = new Date().toISOString().slice(0, 10);
    deleteEntry(today, 'e1');
  };

  const handleAddChat = () => {
    const msg: ChatMessage = {
      id: 'm1',
      role: 'user',
      content: 'hello bot',
      timestamp: '12:00',
    };
    addChatMessage(msg);
  };

  return (
    <div>
      <span data-testid="page">{state.currentPage}</span>
      <span data-testid="name">{state.profile.name}</span>
      <span data-testid="total">{totalMonthCo2e}</span>
      <span data-testid="today">{todayCo2e}</span>
      <span data-testid="breakdown">{JSON.stringify(categoryBreakdown)}</span>
      <span data-testid="chat">{state.chatHistory.length}</span>

      <button onClick={() => navigate('insights')}>Go to Insights</button>
      <button onClick={() => updateProfile({ name: 'Bob' })}>Update Name</button>
      <button onClick={handleAddEntry}>Add Entry</button>
      <button onClick={handleDeleteEntry}>Delete Entry</button>
      <button onClick={handleAddChat}>Add Chat</button>
      <button onClick={clearChat}>Clear Chat</button>
    </div>
  );
};

describe('AppProvider and useApp integration', () => {
  it('runs all actions, updates localStorage, and triggers side effects', () => {
    localStorage.setItem(
      'ecotrack_state_v2',
      JSON.stringify({
        profile: { name: 'Saved User', location: 'EU', householdSize: 3, monthlyBudgetGoal: 300 },
        logs: [],
        chatHistory: [],
        currentPage: 'dashboard',
        earnedAchievements: [],
      })
    );

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Saved User');

    act(() => {
      screen.getByText('Go to Insights').click();
    });
    expect(screen.getByTestId('page').textContent).toBe('insights');

    act(() => {
      screen.getByText('Update Name').click();
    });
    expect(screen.getByTestId('name').textContent).toBe('Bob');

    act(() => {
      screen.getByText('Add Entry').click();
    });
    expect(screen.getByTestId('total').textContent).toBe('1.92');
    expect(screen.getByTestId('today').textContent).toBe('1.92');
    expect(screen.getByTestId('breakdown').textContent).toContain('"transport":1.92');

    act(() => {
      screen.getByText('Add Chat').click();
    });
    expect(screen.getByTestId('chat').textContent).toBe('1');

    act(() => {
      screen.getByText('Delete Entry').click();
    });
    expect(screen.getByTestId('total').textContent).toBe('0');

    act(() => {
      screen.getByText('Clear Chat').click();
    });
    expect(screen.getByTestId('chat').textContent).toBe('0');
  });

  it('handles localStorage errors gracefully during LOAD_STATE', () => {
    const spy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('quota error');
    });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Eco User');

    spy.mockRestore();
  });

  it('gracefully handles localStorage quota errors during state persistence updates', () => {
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Update Name').click();
    });

    expect(screen.getByTestId('name').textContent).toBe('Bob');

    spy.mockRestore();
  });

  it('throws error if useApp is called outside AppProvider', () => {
    const FailingComponent = () => {
      useApp();
      return null;
    };

    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => render(<FailingComponent />)).toThrow(
      'useApp must be used inside <AppProvider>'
    );

    console.error = originalConsoleError;
  });
});
