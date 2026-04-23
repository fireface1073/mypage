const STORAGE_KEY = 'studio-dashboard-projects-v1';

// localStorage에서 프로젝트 목록을 가져옵니다.
export const loadProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('프로젝트 데이터를 불러오지 못했습니다.', error);
    return [];
  }
};

// 프로젝트 목록을 localStorage에 저장합니다.
export const saveProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('프로젝트 데이터를 저장하지 못했습니다.', error);
  }
};
