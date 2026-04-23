import { useMemo, useState } from 'react';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import { loadProjects, saveProjects } from './utils/storage';

const STATUS_ORDER = ['대기', '작업중', '피드백 대기', '완료'];

function App() {
  // 최초 렌더링 시 localStorage에서 데이터 로딩
  const [projects, setProjects] = useState(() => loadProjects());
  const [editingId, setEditingId] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const editingProject = projects.find((project) => project.id === editingId) || null;

  const handleUpsertProject = (formData) => {
    let updatedProjects;

    if (editingId) {
      // 수정 로직
      updatedProjects = projects.map((project) =>
        project.id === editingId ? { ...project, ...formData, updatedAt: Date.now() } : project
      );
      setEditingId(null);
    } else {
      // 추가 로직
      const newProject = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      updatedProjects = [newProject, ...projects];
    }

    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const handleDeleteProject = (id) => {
    const shouldDelete = window.confirm('정말 이 프로젝트를 삭제할까요?');
    if (!shouldDelete) return;

    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleCycleStatus = (id) => {
    const updatedProjects = projects.map((project) => {
      if (project.id !== id) return project;

      const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(project.status) + 1) % STATUS_ORDER.length];
      return { ...project, status: nextStatus, updatedAt: Date.now() };
    });

    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  // 대시보드 계산은 useMemo로 캐시해 불필요한 재계산을 줄입니다.
  const { activeProjects, archiveProjects, todayTasks, groupedByStatus } = useMemo(() => {
    const active = projects.filter((project) => project.status !== '완료');
    const archive = projects.filter((project) => project.status === '완료');

    const tasks = active.filter((project) => project.status === '작업중' || project.dueDate === today);

    const grouped = STATUS_ORDER.reduce((acc, status) => {
      acc[status] = active.filter((project) => project.status === status);
      return acc;
    }, {});

    return {
      activeProjects: active,
      archiveProjects: archive,
      todayTasks: tasks,
      groupedByStatus: grouped
    };
  }, [projects, today]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎚️ 스튜디오 작업 대시보드</h1>
        <p>한 화면에서 프로젝트를 빠르게 정리하세요.</p>
      </header>

      <main className="layout">
        <div className="left-col">
          <ProjectForm
            onSubmit={handleUpsertProject}
            editingProject={editingProject}
            onCancelEdit={() => setEditingId(null)}
          />

          <ProjectList
            title="전체 진행 프로젝트"
            projects={activeProjects}
            emptyText="진행 중인 프로젝트가 없습니다."
            onEdit={(project) => setEditingId(project.id)}
            onDelete={handleDeleteProject}
            onCycleStatus={handleCycleStatus}
          />
        </div>

        <div className="right-col">
          <ProjectList
            title="오늘 해야 할 작업"
            projects={todayTasks}
            emptyText="오늘 집중할 작업이 없습니다."
            onEdit={(project) => setEditingId(project.id)}
            onDelete={handleDeleteProject}
            onCycleStatus={handleCycleStatus}
          />

          {STATUS_ORDER.filter((status) => status !== '완료').map((status) => (
            <ProjectList
              key={status}
              title={`상태: ${status}`}
              projects={groupedByStatus[status]}
              emptyText={`${status} 상태 프로젝트가 없습니다.`}
              onEdit={(project) => setEditingId(project.id)}
              onDelete={handleDeleteProject}
              onCycleStatus={handleCycleStatus}
            />
          ))}

          <ProjectList
            title="아카이브 (완료)"
            projects={archiveProjects}
            emptyText="아카이브된 프로젝트가 없습니다."
            onEdit={(project) => setEditingId(project.id)}
            onDelete={handleDeleteProject}
            onCycleStatus={handleCycleStatus}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
