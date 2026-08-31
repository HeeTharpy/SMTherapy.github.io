// SM테라피 전용 Firebase 설정 파일
// 중요: 하늘테라피 Firebase 프로젝트와 분리해서 새 프로젝트를 만든 뒤 아래 값을 교체하세요.
const firebaseConfig = {
  apiKey: "AIzaSyAlS8Uv7XtpsNPAnzfAp14_FN4OLh-b0FY",
  authDomain: "smtherapy-434a4.firebaseapp.com",
  databaseURL: "https://smtherapy-434a4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smtherapy-434a4",
  storageBucket: "smtherapy-434a4.firebasestorage.app",
  messagingSenderId: "330461098726",
  appId: "1:330461098726:web:4818fd6bf77d745af0c127"
};

const isConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith("REPLACE_WITH_"));
if (isConfigured && window.firebase) {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
} else {
  console.warn("SM테라피 Firebase가 아직 설정되지 않았습니다. 홈페이지는 기본 정보로 표시되며 관리자 저장 기능은 Firebase 설정 후 사용할 수 있습니다.");
}
