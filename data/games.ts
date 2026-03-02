export interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "쉬움" | "보통" | "어려움";
  playTime: string;
  color: string;
}

export const gamesData: GameInfo[] = [
  {
    id: "memory",
    title: "카드 뒤집기",
    description: "같은 그림의 카드 짝을 맞춰보세요! 기억력을 테스트하는 클래식 게임입니다.",
    icon: "🃏",
    difficulty: "쉬움",
    playTime: "2~5분",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "whack-a-mole",
    title: "두더지 잡기",
    description: "나타나는 두더지를 빠르게 터치하세요! 반사신경을 테스트해보세요.",
    icon: "🔨",
    difficulty: "보통",
    playTime: "1~3분",
    color: "from-amber-500 to-orange-600",
  },
];
