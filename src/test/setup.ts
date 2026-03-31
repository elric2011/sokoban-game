import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch for level loading
// @ts-ignore - mock fetch for testing
(globalThis as any).fetch = vi.fn();

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLCanvasElement.getContext for GameCanvas tests
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  strokeStyle: '',
  strokeRect: vi.fn(),
  lineWidth: 1,
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  transform: vi.fn(),
  createImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  clip: vi.fn(),
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  font: '',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  shadowBlur: 0,
  shadowColor: 'transparent',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
}));
