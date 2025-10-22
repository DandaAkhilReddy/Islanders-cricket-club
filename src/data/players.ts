import type { Player } from '../types';

// Empty array - all players will be added through admin panel
export const initialPlayers: Omit<Player, 'id'>[] = [];
