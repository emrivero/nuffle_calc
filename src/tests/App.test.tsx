import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
describe('interfaz', () => { it('muestra la identidad y el resumen', () => { render(<App />); expect(screen.getByRole('heading', { name: 'NuffleCalc' })).toBeInTheDocument(); expect(screen.getByText('Probabilidad de que la jugada salga')).toBeInTheDocument(); }); });
