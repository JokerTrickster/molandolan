export interface GalleryPost {
  id: string;
  userId: string;
  nickname: string;
  imageUrl: string;
  caption: string;
  likes: number;
  liked: boolean;
  commentCount: number;
  createdAt: string;
}

export interface GalleryComment {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: string;
}

export const galleryData: GalleryPost[] = [
  {
    id: "1",
    userId: "u1",
    nickname: "모란이팬",
    imageUrl: "🖼️",
    caption: "모란이 팬아트 그렸어요! 봄맞이 벚꽃 에디션 🌸",
    likes: 42,
    liked: false,
    commentCount: 5,
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    userId: "u2",
    nickname: "도란도란",
    imageUrl: "🎨",
    caption: "도란이와 함께하는 일상 만화 ✏️",
    likes: 38,
    liked: false,
    commentCount: 3,
    createdAt: "2026-02-28",
  },
  {
    id: "3",
    userId: "u3",
    nickname: "굿즈콜렉터",
    imageUrl: "📸",
    caption: "모란도란 굿즈 컬렉션 자랑합니다!",
    likes: 55,
    liked: false,
    commentCount: 8,
    createdAt: "2026-02-27",
  },
  {
    id: "4",
    userId: "u4",
    nickname: "앵무새러버",
    imageUrl: "🦜",
    caption: "해씨먹는 앵무새 게임 올클 인증! 🏆",
    likes: 29,
    liked: false,
    commentCount: 2,
    createdAt: "2026-02-26",
  },
  {
    id: "5",
    userId: "u1",
    nickname: "모란이팬",
    imageUrl: "✨",
    caption: "모란이 스티커로 꾸민 다이어리",
    likes: 61,
    liked: false,
    commentCount: 7,
    createdAt: "2026-02-25",
  },
  {
    id: "6",
    userId: "u5",
    nickname: "아트장인",
    imageUrl: "🎭",
    caption: "모란도란 캐릭터 점토 피규어 만들기",
    likes: 73,
    liked: false,
    commentCount: 12,
    createdAt: "2026-02-24",
  },
  {
    id: "7",
    userId: "u6",
    nickname: "감성사진",
    imageUrl: "🌿",
    caption: "모란도란 텀블러와 함께하는 카페 타임 ☕",
    likes: 45,
    liked: false,
    commentCount: 4,
    createdAt: "2026-02-23",
  },
  {
    id: "8",
    userId: "u7",
    nickname: "게이머짱",
    imageUrl: "🎮",
    caption: "카드 뒤집기 5라운드 올클 기록!",
    likes: 33,
    liked: false,
    commentCount: 6,
    createdAt: "2026-02-22",
  },
  {
    id: "9",
    userId: "u8",
    nickname: "봉제인형",
    imageUrl: "🧸",
    caption: "모란이 인형이랑 나들이 왔어요~",
    likes: 88,
    liked: false,
    commentCount: 15,
    createdAt: "2026-02-21",
  },
];

export const galleryComments: Record<string, GalleryComment[]> = {
  "1": [
    { id: "c1", userId: "u2", nickname: "도란도란", content: "너무 예쁘다!! 벚꽃 느낌 최고 🌸", createdAt: "2026-03-01" },
    { id: "c2", userId: "u3", nickname: "굿즈콜렉터", content: "그림체가 정말 좋네요", createdAt: "2026-03-01" },
  ],
  "3": [
    { id: "c3", userId: "u1", nickname: "모란이팬", content: "컬렉션 부럽다..!", createdAt: "2026-02-27" },
  ],
};
