import { RankEntry, GameType } from '@/types';
import { AuthService } from './AuthService';

interface SubmitScoreData {
  clearTimeMs?: number;
  score?: number;
}

interface TopRankingsResponse {
  rankings: RankEntry[];
}

interface MyRankingResponse {
  rank: number;
  entry: RankEntry;
}

interface SubmitResponse {
  rank: number;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private authService: AuthService;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const token = this.authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  public async getTopRankings(gameType: GameType, limit: number = 5): Promise<RankEntry[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/rankings/${gameType}?limit=${limit}`,
        { headers: this.getHeaders() }
      );

      if (!res.ok) {
        console.error(`Failed to fetch rankings: ${res.status}`);
        return [];
      }

      const data: TopRankingsResponse = await res.json();
      return data.rankings;
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
      return [];
    }
  }

  public async getMyRanking(gameType: GameType): Promise<MyRankingResponse | null> {
    if (!this.authService.isLoggedIn()) return null;

    try {
      const res = await fetch(
        `${this.baseUrl}/api/rankings/${gameType}/me`,
        { headers: this.getHeaders() }
      );

      if (!res.ok) return null;

      return await res.json();
    } catch (err) {
      console.error('Failed to fetch my ranking:', err);
      return null;
    }
  }

  public async submitScore(gameType: GameType, data: SubmitScoreData): Promise<number | null> {
    if (!this.authService.isLoggedIn()) return null;

    try {
      const res = await fetch(
        `${this.baseUrl}/api/rankings/${gameType}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data)
        }
      );

      if (!res.ok) {
        console.error(`Failed to submit score: ${res.status}`);
        return null;
      }

      const result: SubmitResponse = await res.json();
      return result.rank;
    } catch (err) {
      console.error('Failed to submit score:', err);
      return null;
    }
  }
}
