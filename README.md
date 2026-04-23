# 스튜디오 작업 대시보드 (Studio Scheduler Dashboard)

오디오 스튜디오 엔지니어가 작업 프로젝트를 빠르게 정리할 수 있도록 만든 **아주 단순한 React + Vite 웹앱**입니다.

- 프로젝트 추가 / 수정 / 삭제
- 상태 클릭 한 번으로 변경 (대기 → 작업중 → 피드백 대기 → 완료)
- 오늘 해야 할 작업 자동 표시
- 완료 프로젝트 아카이브 분리
- `localStorage` 저장으로 새로고침 후에도 데이터 유지
- 다크모드 기본 + 모바일 대응

---

## 1) 프로젝트 폴더 구조

```bash
studio-scheduler-dashboard/
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ styles.css
   ├─ components/
   │  ├─ ProjectForm.jsx
   │  ├─ ProjectList.jsx
   │  └─ ProjectItem.jsx
   └─ utils/
      └─ storage.js
```

---

## 2) 설치 명령어

아래 명령어를 터미널에 그대로 입력하세요.

```bash
# 1. 프로젝트 폴더로 이동
cd studio-scheduler-dashboard

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

---

## 3) 완전 초보 기준 실행 방법

1. **Node.js 설치**
   - https://nodejs.org 에서 LTS 버전 설치
   - 설치 후 터미널에서 아래 확인:
   ```bash
   node -v
   npm -v
   ```

2. **프로젝트 다운로드**
   - GitHub에서 저장소를 클론하거나 ZIP 다운로드

3. **터미널에서 프로젝트 폴더 열기**
   ```bash
   cd studio-scheduler-dashboard
   ```

4. **의존성 설치**
   ```bash
   npm install
   ```

5. **실행**
   ```bash
   npm run dev
   ```

6. **브라우저에서 접속**
   - 보통 `http://localhost:5173`

7. **종료 방법**
   - 터미널에서 `Ctrl + C`

---

## 4) GitHub에 새 저장소로 올리는 방법

예시 저장소 이름: `studio-scheduler-dashboard`

```bash
# (프로젝트 루트에서)
git init
git add .
git commit -m "feat: initial studio scheduler dashboard"

git branch -M main
git remote add origin https://github.com/<YOUR_ID>/studio-scheduler-dashboard.git
git push -u origin main
```

`<YOUR_ID>`를 본인 GitHub 아이디로 바꿔주세요.

---

## 5) 향후 확장 아이디어 3가지

1. **검색/필터 기능 강화**
   - 프로젝트명 검색, 우선순위/상태 필터, 마감일 정렬

2. **백업/복원 기능**
   - JSON 내보내기/가져오기 버튼으로 로컬 데이터 백업

3. **캘린더 뷰 추가**
   - 월간 캘린더에서 마감일 기반으로 프로젝트 시각화

---

## 사용 팁

- 상태 버튼을 클릭하면 프로젝트 상태가 순환 변경됩니다.
- 완료 상태는 자동으로 아카이브 영역에 모입니다.
- 브라우저 저장소를 지우면 데이터가 사라질 수 있으니 중요한 내용은 주기적으로 백업하세요.
