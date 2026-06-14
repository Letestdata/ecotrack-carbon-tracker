import { describe, it, expect } from 'vitest';
import { cn } from '../utils/cn';

describe('cn utility', () => {
  it('combines multiple class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('filters out falsy values', () => {
    expect(cn('class1', false && 'class2', null, undefined, 'class3')).toBe('class1 class3');
  });

  it('merges tailwind classes conflict-free', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
  });
});
