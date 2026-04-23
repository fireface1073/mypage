const STATUS_ORDER = ['대기', '작업중', '피드백 대기', '완료'];

function ProjectItem({ project, onEdit, onDelete, onCycleStatus }) {
  const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(project.status) + 1) % STATUS_ORDER.length];

  return (
    <li className="project-item">
      <div className="project-top">
        <h4>{project.name}</h4>
        <span className={`priority priority-${project.priority}`}>{project.priority}</span>
      </div>

      <div className="meta">
        <button className="status-pill" onClick={() => onCycleStatus(project.id)} title={`다음 상태: ${nextStatus}`}>
          {project.status}
        </button>
        <span>마감: {project.dueDate || '미정'}</span>
      </div>

      {project.memo && <p className="memo">{project.memo}</p>}

      <div className="row-actions">
        <button className="btn" onClick={() => onEdit(project)}>
          수정
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(project.id)}>
          삭제
        </button>
      </div>
    </li>
  );
}

export default ProjectItem;
