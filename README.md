# SyncTube 서버

SyncTube의 실시간 동기화를 담당하는 NestJS + Socket.IO 서버입니다. 방 생성부터 참여자 간 재생 상태 전파, 방 종료까지의 흐름을 관리합니다.

[Chrome 웹 스토어에서 SyncTube 설치하기](https://chromewebstore.google.com/detail/synctube/ffgkboflkmabaomcdkcapblgjknfkkjf?hl=ko&gl=DE)

## 핵심 기능

- 6자리 방 코드 생성과 참여자 관리
- 호스트의 재생, 일시정지, 탐색 상태를 Socket.IO로 실시간 전파
- 영상 변경 시 참여자의 영상과 재생 기준점 동기화
- 호스트 퇴장 및 연결 종료에 따른 방 정리와 `ROOM_CLOSED` 알림
- DTO, Pipe를 통한 WebSocket 요청 검증

## 기술 구성

- NestJS 11, TypeScript
- Socket.IO 기반 양방향 실시간 통신
- `class-validator` 및 `class-transformer` 기반 입력 검증
- 도메인 단위 모듈과 값 객체를 활용한 방 상태 관리

## 구조

```text
src/
├── main.ts                    # 애플리케이션 시작 및 전역 유효성 검사 설정
├── app.module.ts              # 루트 모듈
└── room/                      # 실시간 방 도메인
    ├── room.gateway.ts        # Socket.IO 이벤트 수신 및 브로드캐스트
    ├── room.service.ts        # 방·재생 상태의 비즈니스 규칙
    ├── room.repository.ts     # 방 상태 저장소
    ├── entity/room.entity.ts  # 방과 재생 상태 모델
    ├── dto/                   # 이벤트 요청 DTO
    ├── pipes/                 # WebSocket 입력 검증
    ├── interceptors/          # WebSocket 응답 처리
    └── vo/                    # 방 코드 값 객체
```

Chrome 확장 프로그램 클라이언트는 [`../SyncTubeClient`](../SyncTubeClient) 저장소에 구현되어 있습니다.

## 실행

```powershell
npm install
npm run start:dev
```

기본 포트는 `3000`이며 `PORT` 환경 변수로 변경할 수 있습니다.

```powershell
npm run build
npm run start:prod
```

## 주요 Socket.IO 이벤트

| 클라이언트 → 서버 | 용도 |
| --- | --- |
| `CREATE_ROOM` | 방 생성 |
| `JOIN_ROOM` | 방 참여 및 현재 재생 상태 조회 |
| `LEAVE_ROOM` | 방 퇴장 |
| `HOST_EVENT` | 재생·일시정지·탐색 상태 갱신 |
| `CHANGE_VIDEO` | 영상 변경 |

| 서버 → 클라이언트 | 용도 |
| --- | --- |
| `STATE_PATCH` | 재생 상태 변경 |
| `VIDEO_CHANGED` | 영상 변경 및 새 재생 상태 |
| `ROOM_CLOSED` | 방 종료 |
