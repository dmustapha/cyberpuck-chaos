/**
 * Game API Client
 *
 * Frontend API client that communicates with the backend REST API
 * for managing games and balances.
 */

// =============================================================================
// Types
// =============================================================================

export interface Game {
  id: string;
  creator: string;
  opponent: string | null;
  stake: string;
  roomCode: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  winner: string | null;
  player1Score: number;
  player2Score: number;
  createdAt: string;
}

export interface Balance {
  available: string;
  locked: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface CreateGameResponse {
  gameId: string;
}

export interface SuccessResponse {
  success: boolean;
}

export interface JoinGameResponse {
  success: boolean;
  gameId: string;
  game: Game;
}

// =============================================================================
// API Error
// =============================================================================

export class GameAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'GameAPIError';
  }
}

// =============================================================================
// API Client
// =============================================================================

class GameAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Parse response body
      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage =
          (data && typeof data === 'object' && 'error' in data)
            ? String((data as { error: unknown }).error)
            : (data && typeof data === 'object' && 'message' in data)
              ? String((data as { message: unknown }).message)
              : `Request failed with status ${response.status}`;

        throw new GameAPIError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error) {
      // Re-throw GameAPIError as-is
      if (error instanceof GameAPIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new GameAPIError(
          'Network error: Unable to connect to the API server',
          0,
          { originalError: error.message }
        );
      }

      // Handle other errors
      throw new GameAPIError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        0,
        error
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Health & Status
  // ---------------------------------------------------------------------------

  /**
   * Check API health status
   */
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  // ---------------------------------------------------------------------------
  // Games
  // ---------------------------------------------------------------------------

  /**
   * Create a new game
   */
  async createGame(stake: string, roomCode: string): Promise<CreateGameResponse> {
    return this.request<CreateGameResponse>('/api/games', {
      method: 'POST',
      body: JSON.stringify({ stake, roomCode }),
    });
  }

  /**
   * Get all open games (waiting for opponent)
   */
  async getOpenGames(): Promise<Game[]> {
    return this.request<Game[]>('/api/games');
  }

  /**
   * Get a specific game by ID
   */
  async getGame(gameId: string): Promise<Game | null> {
    try {
      return await this.request<Game>(`/api/games/${encodeURIComponent(gameId)}`);
    } catch (error) {
      if (error instanceof GameAPIError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Join an existing game (accepts gameId or roomCode)
   */
  async joinGame(gameIdOrRoomCode: string): Promise<JoinGameResponse> {
    return this.request<JoinGameResponse>(
      `/api/games/${encodeURIComponent(gameIdOrRoomCode)}/join`,
      { method: 'POST' }
    );
  }

  /**
   * Submit game result
   */
  async submitResult(
    gameId: string,
    player1Score: number,
    player2Score: number
  ): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      `/api/games/${encodeURIComponent(gameId)}/result`,
      {
        method: 'POST',
        body: JSON.stringify({ player1Score, player2Score }),
      }
    );
  }

  /**
   * Cancel a game (only by creator, before opponent joins)
   */
  async cancelGame(gameId: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      `/api/games/${encodeURIComponent(gameId)}/cancel`,
      { method: 'POST' }
    );
  }

  // ---------------------------------------------------------------------------
  // Balance
  // ---------------------------------------------------------------------------

  /**
   * Get balance for a chain
   */
  async getBalance(chainId: string): Promise<Balance> {
    return this.request<Balance>(
      `/api/balance/${encodeURIComponent(chainId)}`
    );
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const gameAPI = new GameAPI();
export default gameAPI;
