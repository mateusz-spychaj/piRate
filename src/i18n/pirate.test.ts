import { describe, it, expect } from 'vitest';
import { generatePirateSummary, generateRepoPirateSummary } from './pirate';

describe('generatePirateSummary', () => {
  it('should return high score message for scores >= 80', () => {
    const msg = generatePirateSummary(90, 80, 85);
    expect(msg).toContain('Arrr');
    expect(msg).toContain('smooth');
  });

  it('should return medium-high message for scores >= 60', () => {
    const msg = generatePirateSummary(70, 60, 65);
    expect(msg).toContain('Shiver');
  });

  it('should return medium-low message for scores >= 40', () => {
    const msg = generatePirateSummary(50, 40, 45);
    expect(msg).toContain('Avast');
  });

  it('should return low score message for scores < 40', () => {
    const msg = generatePirateSummary(20, 30, 25);
    expect(msg).toContain('plank');
  });

  it('should use average of all three dimensions', () => {
    const high = generatePirateSummary(100, 100, 100);
    const low = generatePirateSummary(0, 0, 0);
    expect(high).not.toBe(low);
  });
});

describe('generateRepoPirateSummary', () => {
  it('should include PR count in the message', () => {
    const msg = generateRepoPirateSummary(90, 5);
    expect(msg).toContain('5');
  });

  it('should return different messages for different scores', () => {
    const high = generateRepoPirateSummary(90, 3);
    const low = generateRepoPirateSummary(20, 3);
    expect(high).not.toBe(low);
  });

  it('should classify scores correctly', () => {
    expect(generateRepoPirateSummary(90, 1)).toContain('treasure');
    expect(generateRepoPirateSummary(70, 1)).toContain('promise');
    expect(generateRepoPirateSummary(50, 1)).toContain('captain');
    expect(generateRepoPirateSummary(30, 1)).toContain('plank');
  });
});
