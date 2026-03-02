export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  badge?: string;
  inStock: boolean;
}

export const productsData: Product[] = [
  {
    id: "1",
    name: "모란이 봉제인형 (30cm)",
    price: 32000,
    originalPrice: 38000,
    description:
      "모란도란의 주인공 모란이를 그대로 재현한 고급 봉제인형입니다. 부드러운 극세사 원단으로 제작되어 포근한 촉감을 자랑합니다. 크기는 약 30cm이며, 디테일한 자수 처리로 고급스러운 느낌을 더했습니다.",
    image: "🧸",
    category: "인형",
    badge: "BEST",
    inStock: true,
  },
  {
    id: "2",
    name: "도란이 미니 키링",
    price: 12000,
    description:
      "도란이의 귀여운 모습을 담은 미니 키링입니다. 가방이나 열쇠에 달아 어디서든 도란이와 함께하세요. 아크릴 소재로 가볍고 튼튼합니다.",
    image: "🔑",
    category: "악세서리",
    inStock: true,
  },
  {
    id: "3",
    name: "모란도란 텀블러 (450ml)",
    price: 22000,
    description:
      "모란도란 캐릭터가 프린트된 스테인리스 텀블러입니다. 보온/보냉 기능이 뛰어나며, 450ml 대용량으로 실용적입니다. BPA Free 소재로 안심하고 사용 가능합니다.",
    image: "☕",
    category: "생활용품",
    badge: "NEW",
    inStock: true,
  },
  {
    id: "4",
    name: "벚꽃 에디션 엽서 세트",
    price: 8000,
    description:
      "봄 한정 벚꽃 에디션 엽서 세트입니다. 모란이와 도란이의 봄맞이 일러스트 10종이 포함되어 있습니다. 고급 종이에 인쇄되어 컬렉션용으로도 좋습니다.",
    image: "💌",
    category: "문구",
    badge: "한정판",
    inStock: true,
  },
  {
    id: "5",
    name: "모란도란 스티커팩 (50매)",
    price: 5000,
    description:
      "모란도란 캐릭터 스티커 50매가 들어있는 대용량 스티커팩입니다. 다이어리, 노트북, 폰케이스 등 어디든 붙일 수 있는 다양한 디자인이 포함되어 있습니다.",
    image: "✨",
    category: "문구",
    inStock: true,
  },
  {
    id: "6",
    name: "모란이 후드티 (프리사이즈)",
    price: 45000,
    originalPrice: 55000,
    description:
      "모란이가 그려진 오버핏 후드티입니다. 프리사이즈로 남녀 모두 편하게 착용 가능합니다. 100% 면 소재로 부드러운 착용감을 제공합니다.",
    image: "👕",
    category: "의류",
    badge: "SALE",
    inStock: false,
  },
];
