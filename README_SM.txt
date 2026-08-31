SM테라피 홈페이지 제작본

기본 정보
- 상호: SM테라피
- 주소: 경기도 수원시 팔달구 인계동 인계로108번길 39-4
- 전화: 010-3819-5884
- 텔레그램: @sssssnaver (https://t.me/sssssnaver)

구조
- index.html: 메인 홈페이지
- admin.html: 관리자 페이지
- app.js / admin.js: 홈페이지 및 관리자 기능
- data.js: 기본 관리사 목록 (현재 비워둠)
- firebase-config.js: SM테라피 전용 Firebase 설정 필요

중요
- 기존 하늘테라피 Firebase와 데이터가 섞이지 않도록 firebase-config.js를 SM 전용 프로젝트용 placeholder로 분리했습니다.
- SM 전용 Firebase Realtime Database 프로젝트를 만든 뒤 firebase-config.js 값을 넣으면 관리자 저장/실시간 반영 기능을 사용할 수 있습니다.
- 현재 홈페이지 자체는 Firebase 없이도 입력된 기본 매장정보로 정상 표시됩니다.

임시 관리자 로그인
- 아이디: smtherapy
- 비밀번호: 5884@
- 배포 전 admin.js에서 원하는 값으로 변경 권장
