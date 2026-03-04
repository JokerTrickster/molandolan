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
    id: "parrot-seed",
    title: "해씨먹는 앵무새",
    description:
      "해바라기씨를 먹은 앵무새를 찾아라! 셔플 후 정답 앵무새를 맞추는 5라운드 게임입니다.",
    icon: "🦜",
    difficulty: "보통",
    playTime: "3~5분",
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "memory",
    title: "카드 뒤집기",
    description:
      "같은 그림의 카드 짝을 맞춰보세요! 라운드마다 카드 공개 시간이 줄어드는 5라운드 기억력 게임입니다.",
    icon: "🃏",
    difficulty: "쉬움",
    playTime: "3~5분",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "hidden-parrot",
    title: "숨은 앵무새 찾기",
    description:
      "그림 속에 숨어있는 앵무새를 찾아보세요! 라운드가 올라갈수록 시간이 짧아지는 5라운드 게임입니다.",
    icon: "🔍",
    difficulty: "보통",
    playTime: "3~5분",
    color: "from-amber-500 to-orange-600",
  },
];
