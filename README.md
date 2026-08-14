# SyncTube 서버

YouTube 함께 보기용 Chrome 확장 프로그램의 Socket.IO 서버입니다.

## 현재 기능

- 6자리 코드로 방 생성·참여·퇴장
- 호스트의 재생, 일시정지, 탐색 상태를 참가자에게 전파
- 호스트의 영상 전환을 참가자에게 전파
- 호스트 퇴장 시 방 종료 및 `ROOM_CLOSED` 알림
- 호스트 연결 종료 시 30초 후 방 삭제

방은 프로세스 메모리에만 저장됩니다. 서버를 재시작하면 모든 방이 사라집니다.

## 실행

```powershell
npm install
npm run start:dev
```

기본 포트는 `3000`입니다.

```powershell
npm run build
npm run start:prod
```

## 주요 Socket.IO 이벤트

| 클라이언트 → 서버 | 용도 |
| --- | --- |
| `CREATE_ROOM` | 방 생성 |
| `JOIN_ROOM` | 방 참여 |
| `LEAVE_ROOM` | 방 퇴장 |
| `HOST_EVENT` | 호스트 재생·정지·탐색 |
| `CHANGE_VIDEO` | 호스트 영상 변경 |

| 서버 → 클라이언트 | 용도 |
| --- | --- |
| `STATE_PATCH` | 재생 상태 변경 |
| `VIDEO_CHANGED` | 영상 변경 |
| `ROOM_CLOSED` | 방 종료 |

## 개발 상태

- 인증, 영속 저장소, 채팅은 아직 없습니다.
- 방 상태는 단일 서버 메모리에 존재하므로 수평 확장은 아직 지원하지 않습니다.
- 확장 프로그램은 인접 저장소 `../SyncTubeClient`에 있습니다.
