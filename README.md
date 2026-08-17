# SyncTube 서버

SyncTube는 여러 사람이 같은 YouTube 영상을 함께 볼 수 있도록 재생 상태를 동기화하는 Chrome 확장 프로그램입니다. 이 저장소는 방 관리와 실시간 동기화를 담당하는 NestJS + Socket.IO 서버입니다.

[Chrome 웹 스토어에서 SyncTube 설치하기](https://chromewebstore.google.com/detail/synctube/ffgkboflkmabaomcdkcapblgjknfkkjf?hl=ko&gl=DE)

## 주요 기능

- 6자리 코드로 방 생성, 참여, 퇴장 및 호스트의 방 삭제
- 호스트의 재생, 일시정지, 탐색 상태를 모든 참가자에게 실시간 전파
- 호스트의 YouTube 영상 변경을 참가자에게 전파
- 호스트가 퇴장하면 방을 종료하고 `ROOM_CLOSED` 이벤트 전송
- 호스트 연결이 끊긴 뒤 30초 안에 복구되지 않으면 방 자동 삭제

방 정보는 서버 프로세스 메모리에만 저장됩니다. 서버를 재시작하면 모든 방이 삭제됩니다.

## 프로젝트 구조

```text
src/
├── main.ts                    # NestJS 앱 시작 및 전역 유효성 검사 설정
├── app.module.ts              # 루트 모듈
└── room/                      # 실시간 방 도메인
    ├── room.gateway.ts        # Socket.IO 이벤트 수신 및 브로드캐스트
    ├── room.service.ts        # 방 생성·참여·동기화·종료 규칙
    ├── room.repository.ts     # 메모리 기반 방 저장소
    ├── entity/room.entity.ts  # 방과 재생 상태 모델
    ├── dto/                   # 이벤트 요청 데이터 검증 DTO
    ├── pipes/                 # 방 코드 및 WebSocket 입력 검증
    ├── interceptors/          # WebSocket 응답 형식 처리
    └── vo/                    # 6자리 방 코드 값 객체
```

Chrome 확장 프로그램 클라이언트는 인접 저장소 [`../SyncTubeClient`](../SyncTubeClient)에 있습니다.

## 실행

```powershell
npm install
npm run start:dev
```

기본 포트는 `3000`이며, `PORT` 환경 변수로 변경할 수 있습니다.

프로덕션 빌드는 다음과 같이 실행합니다.

```powershell
npm run build
npm run start:prod
```

확장 프로그램의 접속 출처를 제한하려면 `CORS_ORIGINS`에 쉼표로 구분한 origin 목록을 설정합니다.

```powershell
$env:CORS_ORIGINS = 'chrome-extension://<extension-id>'
```

## 주요 Socket.IO 이벤트

| 클라이언트 → 서버 | 용도 |
| --- | --- |
| `CREATE_ROOM` | 방 생성 |
| `JOIN_ROOM` | 방 참여 및 현재 영상·재생 상태 수신 |
| `LEAVE_ROOM` | 방 퇴장 |
| `DELETE_ROOM` | 호스트가 방 삭제 |
| `HOST_EVENT` | 호스트의 재생·일시정지·탐색 상태 갱신 |
| `CHANGE_VIDEO` | 호스트의 영상 변경 |

| 서버 → 클라이언트 | 용도 |
| --- | --- |
| `STATE_PATCH` | 재생 상태 변경 |
| `VIDEO_CHANGED` | 영상 변경 및 새 재생 상태 |
| `ROOM_CLOSED` | 방 종료 |

## 개발 상태

- 인증, 영속 저장소, 채팅 기능은 아직 없습니다.
- 단일 서버 메모리를 사용하므로 수평 확장은 아직 지원하지 않습니다.
