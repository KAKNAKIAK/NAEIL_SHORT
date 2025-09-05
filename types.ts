export interface StructuredStory {
  introduction: string; // 기
  development: string; // 승
  turn: string;        // 전
  conclusion: string;  // 결
}

export type StoryCut = string[];

export interface StoryCuts {
  introduction?: StoryCut;
  development?: StoryCut;
  turn?: StoryCut;
  conclusion?: StoryCut;
}
