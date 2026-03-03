# Plan: Parrot Seed Game (해씨먹는 앵무새)

## 1. Overview

### Product Vision
모바일 웹 기반 기억력 게임으로, 5마리 앵무새 중 해바라기씨를 먹은 앵무새를 찾는 관찰력과 집중력을 요구하는 캐주얼 퍼즐 게임

### Target Users
- Primary: 모든 연령층 (특히 7-70세)
- Secondary: 두뇌 훈련과 기억력 향상을 원하는 사용자
- Device: 스마트폰, 태블릿 (터치 인터페이스)

## 2. Requirements

### Core Features
1. **5마리 앵무새 배치**
   - 화면에 일렬 또는 원형으로 배치된 5마리 앵무새
   - 각 앵무새는 구별 가능한 색상 또는 번호 표시
   - 동일한 기본 외형, 다른 식별 요소

2. **게임 진행 단계**
   - **Stage 1 - 먹이 주기 (3초)**
     - 무작위로 선택된 1마리가 해바라기씨를 먹음
     - 명확한 먹는 애니메이션 표시
     - 다른 앵무새들은 대기 상태

   - **Stage 2 - 섞기 단계 (15초)**
     - 모든 앵무새가 위치를 바꾸며 이동
     - 부드럽고 추적 가능한 움직임
     - 점진적으로 속도 증가 옵션

   - **Stage 3 - 정답 선택**
     - 플레이어가 해바라기씨를 먹은 앵무새 선택
     - 터치/클릭으로 선택
     - 정답/오답 즉시 피드백

3. **난이도 시스템**
   - Easy: 느린 속도, 단순한 이동 패턴
   - Normal: 중간 속도, 교차 이동 포함
   - Hard: 빠른 속도, 복잡한 패턴, 회전 포함

4. **점수 및 보상**
   - 연속 정답 시 콤보 보너스
   - 실패 시 라이프 차감 (3개 라이프)
   - 스테이지 클리어 보상

### Non-functional Requirements
- **Performance**: 60fps 부드러운 애니메이션
- **Responsive**: 다양한 화면 크기 대응
- **Loading**: 초기 로딩 2초 이내
- **Accessibility**: 색맹 사용자를 위한 패턴/번호 옵션

## 3. Success Criteria

### Acceptance Criteria
1. 앵무새 5마리가 명확하게 구분 가능
2. 해바라기씨 먹기 애니메이션이 명확함
3. 15초간 부드러운 셔플 애니메이션
4. 정답 선택 시 즉각적인 피드백
5. 난이도별 차별화된 게임플레이
6. 모바일 터치 인터페이스 최적화

### Performance Metrics
- FPS: 60fps 유지율 95% 이상
- Response Time: 터치 반응 < 100ms
- Memory Usage: < 80MB
- Battery Drain: Low impact

## 4. Constraints

### Technical Constraints
- HTML5 Canvas/WebGL 기반
- JavaScript/TypeScript
- No external plugins
- Mobile-first development
- Cross-browser compatibility

### Business Constraints
- Development timeline: 1-2 weeks
- Single developer resource
- Free-to-play model
- No monetization in v1.0

## 5. Risks

### Technical Risks
1. **애니메이션 추적 어려움**: 빠른 움직임 시 시선 추적 실패
   - Mitigation: 속도 조절 옵션, 궤적 표시 옵션

2. **모바일 성능**: 다중 애니메이션 시 프레임 드롭
   - Mitigation: 최적화된 렌더링, 품질 설정

### UX Risks
1. **난이도 균형**: 너무 쉽거나 어려운 난이도
   - Mitigation: 플레이테스트, 적응형 난이도

2. **반복성**: 단조로운 게임플레이
   - Mitigation: 다양한 이동 패턴, 보너스 라운드

## 6. Scope

### In Scope
- 5마리 앵무새 캐릭터 및 애니메이션
- 해바라기씨 먹기 시각 효과
- 15초 셔플 애니메이션 시스템
- 터치/클릭 입력 처리
- 점수 및 라이프 시스템
- 3개 난이도 레벨
- 기본 사운드 효과
- 로컬 최고 점수 저장

### Out of Scope (Future Releases)
- 멀티플레이어 모드
- 리더보드 및 소셜 기능
- 다양한 먹이 종류
- 커스터마이징 (앵무새 스킨)
- 일일 도전 과제
- 광고 또는 인앱 구매

## 7. Game Flow

### Main Flow
1. **시작 화면**
   - 게임 타이틀 "해씨먹는 앵무새"
   - 난이도 선택 (Easy/Normal/Hard)
   - Play 버튼

2. **게임 준비**
   - 5마리 앵무새 초기 배치
   - 3-2-1 카운트다운

3. **먹이 주기 단계 (3초)**
   - 랜덤 앵무새 선택
   - 해바라기씨 먹기 애니메이션
   - "잘 보세요!" 메시지

4. **셔플 단계 (15초)**
   - 타이머 표시
   - 앵무새들 위치 교환
   - 점진적 속도 변화

5. **선택 단계**
   - "어느 앵무새가 먹었나요?" 표시
   - 플레이어 선택 대기
   - 정답 확인

6. **결과 표시**
   - 정답: 점수 추가, 다음 라운드
   - 오답: 라이프 차감, 정답 표시

7. **게임 종료**
   - 라이프 소진 시 게임 오버
   - 최종 점수 표시
   - 재시작/메뉴 옵션

## 8. Technical Architecture (High Level)

### Core Components
- **Game Engine**: Pixi.js or Phaser 3
- **Animation System**: Tween.js for smooth movements
- **State Management**: Simple state machine
- **Input Handler**: Touch and mouse events
- **Audio System**: Web Audio API

### Data Structure
```javascript
{
  parrots: [
    {
      id: 0-4,
      position: {x, y},
      originalPosition: {x, y},
      hasEatenSeed: boolean,
      color: string,
      isMoving: boolean
    }
  ],
  gameState: {
    phase: "feeding|shuffling|selecting|result",
    selectedParrotId: number,
    correctParrotId: number,
    score: number,
    lives: number,
    level: number,
    difficulty: "easy|normal|hard",
    shuffleTime: 15,
    timeRemaining: number
  }
}
```

## 9. Milestones

### Phase 1: Core Mechanics (Days 1-3)
- [ ] Project setup with chosen framework
- [ ] 5 parrot entities with basic visuals
- [ ] Feeding animation implementation
- [ ] Basic positioning system

### Phase 2: Shuffle System (Days 4-6)
- [ ] Movement animation system
- [ ] Path generation for shuffling
- [ ] Collision avoidance
- [ ] Timer implementation

### Phase 3: Game Logic (Days 7-9)
- [ ] Selection mechanism
- [ ] Score and lives system
- [ ] Difficulty variations
- [ ] Game state management

### Phase 4: Polish (Days 10-12)
- [ ] Visual effects and particles
- [ ] Sound effects
- [ ] UI/UX improvements
- [ ] Mobile optimization

### Phase 5: Testing & Deploy (Days 13-14)
- [ ] Cross-device testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Deployment

## 10. Definition of Done

- [ ] All 5 parrots clearly visible and distinguishable
- [ ] Feeding animation plays correctly
- [ ] 15-second shuffle works smoothly at 60fps
- [ ] Touch controls responsive on mobile
- [ ] All 3 difficulty levels implemented
- [ ] Score and lives system functional
- [ ] No critical bugs
- [ ] Playable on mobile browsers
- [ ] Game loop complete (start → play → end → restart)
- [ ] Basic sound effects integrated
- [ ] Local high score persistence

---

**Created**: 2026-03-03
**Status**: Active Planning
**Next Step**: Design phase (`/pdca design parrot-seed-game`)