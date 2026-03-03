# Plan: Dragon Feeding Game (떡먹는 용만이)

## 1. Overview

### Product Vision
모바일 웹에서 즐길 수 있는 캐주얼 플래시 게임으로, 용이 떡을 먹고 5마리의 앵무새와 상호작용하는 색상 매칭 퍼즐 게임

### Target Users
- Primary: 모바일 웹 사용자 (10-40세)
- Secondary: 캐주얼 게임을 즐기는 전 연령층
- Device: 스마트폰, 태블릿 (터치 인터페이스)

## 2. Requirements

### Core Features
1. **용 캐릭터**
   - 화면 중앙의 메인 캐릭터
   - 떡을 먹는 애니메이션
   - 표정 변화 (성공/실패 시)

2. **5마리 앵무새**
   - 각기 다른 색상 (빨강, 파랑, 노랑, 초록, 보라)
   - 화면 주변에 배치
   - 먹이를 요구하는 말풍선 표시

3. **게임 메커니즘**
   - 떡 먹기: 터치/클릭으로 떡 수집
   - 색상 변환: 먹은 떡이 용의 색상을 변화
   - 매칭: 앵무새가 요구하는 색상과 일치시키기
   - 점수 시스템: 성공적인 매칭 시 점수 획득

### Non-functional Requirements
- **Performance**: 60fps 애니메이션
- **Responsive**: 다양한 모바일 화면 크기 지원
- **Loading**: 초기 로딩 3초 이내
- **Offline**: 오프라인 플레이 가능

## 3. Success Criteria

### Acceptance Criteria
1. 용이 떡을 먹고 색상이 변하는 기능 구현
2. 5마리 앵무새와의 색상 매칭 게임플레이
3. 점수 시스템과 레벨 진행
4. 모바일 터치 인터페이스 최적화
5. 부드러운 애니메이션과 사운드 효과

### Performance Metrics
- FPS: 60fps 유지율 95% 이상
- Load Time: < 3초
- Memory Usage: < 100MB
- Battery Drain: Low impact

## 4. Constraints

### Technical Constraints
- HTML5 Canvas/WebGL 기반
- JavaScript/TypeScript
- No external plugins (Flash 대체)
- Mobile-first development

### Business Constraints
- Development timeline: 2-3 weeks
- Single developer resource
- Open source friendly license

## 5. Risks

### Technical Risks
1. **모바일 성능**: 다양한 디바이스에서의 성능 차이
   - Mitigation: Progressive enhancement, 성능 프로파일링

2. **터치 반응성**: 정확한 터치 인식
   - Mitigation: 터치 영역 최적화, 피드백 강화

### Business Risks
1. **User Engagement**: 단순한 메커니즘으로 인한 지루함
   - Mitigation: 레벨 시스템, 도전 과제 추가

## 6. Scope

### In Scope
- Core gameplay (떡 먹기, 색상 변환, 매칭)
- 5개 앵무새 캐릭터
- 점수 시스템
- 기본 사운드 효과
- 모바일 터치 인터페이스

### Out of Scope (Future Releases)
- 멀티플레이어
- 소셜 기능 (리더보드, 공유)
- In-app purchases
- 복잡한 스토리 모드
- 다국어 지원 (초기 버전은 한국어만)

## 7. Game Flow

### Main Loop
1. **시작 화면**
   - 게임 타이틀
   - Play 버튼
   - 간단한 튜토리얼 안내

2. **게임 플레이**
   - 떡 생성 (랜덤 위치)
   - 용이 떡 먹기 (터치로 이동)
   - 색상 변환 애니메이션
   - 앵무새 요구사항 표시
   - 매칭 확인 및 점수 부여

3. **레벨 진행**
   - 시간 제한 또는 목표 점수
   - 난이도 증가 (속도, 복잡도)
   - 보너스 아이템

4. **게임 종료**
   - 최종 점수 표시
   - 재시작 옵션
   - 최고 기록 저장 (로컬)

## 8. Technical Architecture (High Level)

### Frontend Stack
- **Framework**: React or Vanilla JS with Canvas
- **Animation**: RequestAnimationFrame API
- **State Management**: Simple state machine
- **Asset Loading**: Preloader with progress

### Game Engine Components
- **Renderer**: Canvas 2D or WebGL
- **Physics**: Simple collision detection
- **Input Handler**: Touch/Mouse events
- **Audio Manager**: Web Audio API
- **Scene Manager**: Game states control

### Data Structure
```javascript
{
  dragon: {
    position: {x, y},
    currentColor: "red",
    state: "idle|eating|happy|sad"
  },
  parrots: [
    {
      id: 1,
      color: "red",
      requestedFood: "blue",
      position: {x, y},
      satisfied: false
    }
    // ... 4 more parrots
  ],
  riceCakes: [
    {
      id: 1,
      color: "yellow",
      position: {x, y}
    }
  ],
  gameState: {
    score: 0,
    level: 1,
    timeRemaining: 60
  }
}
```

## 9. Milestones

### Phase 1: Foundation (Week 1)
- [ ] Project setup and build configuration
- [ ] Basic game loop and scene management
- [ ] Dragon character with basic animations
- [ ] Touch input handling

### Phase 2: Core Gameplay (Week 2)
- [ ] Rice cake spawning and collection
- [ ] Color transformation mechanics
- [ ] Parrot characters and requirements
- [ ] Matching logic and scoring

### Phase 3: Polish & Release (Week 3)
- [ ] Sound effects and visual polish
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing on various devices
- [ ] Deployment to web server

## 10. Definition of Done

- [ ] All core features implemented and tested
- [ ] Performance targets met on target devices
- [ ] No critical bugs in gameplay
- [ ] Touch controls responsive and intuitive
- [ ] Game playable offline
- [ ] Code documented and maintainable
- [ ] Deployed to production URL
- [ ] Basic analytics integrated

---

**Created**: 2026-03-03
**Status**: Active Planning
**Next Step**: Design phase (`/pdca design dragon-feeding-game`)