import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  name: '',
  status: '대기',
  dueDate: '',
  priority: '보통',
  memo: ''
};

function ProjectForm({ onSubmit, editingProject, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  // 수정 모드일 때 기존 데이터를 폼에 채워 넣습니다.
  useEffect(() => {
    if (editingProject) {
      setForm({
        name: editingProject.name,
        status: editingProject.status,
        dueDate: editingProject.dueDate,
        priority: editingProject.priority,
        memo: editingProject.memo
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingProject]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert('프로젝트 이름을 입력해 주세요.');
      return;
    }

    onSubmit(form);
    setForm(EMPTY_FORM);
  };

  return (
    <section className="card">
      <h2>{editingProject ? '프로젝트 수정' : '새 프로젝트 추가'}</h2>
      <form className="project-form" onSubmit={handleSubmit}>
        <label>
          프로젝트 이름
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="예: 보컬 믹싱 - 광고 A"
            required
          />
        </label>

        <div className="grid-2">
          <label>
            상태
            <select name="status" value={form.status} onChange={handleChange}>
              <option>대기</option>
              <option>작업중</option>
              <option>피드백 대기</option>
              <option>완료</option>
            </select>
          </label>

          <label>
            우선순위
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option>낮음</option>
              <option>보통</option>
              <option>높음</option>
            </select>
          </label>
        </div>

        <label>
          마감일
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
        </label>

        <label>
          메모
          <textarea
            name="memo"
            value={form.memo}
            onChange={handleChange}
            rows="3"
            placeholder="클라이언트 요청사항, 참고 링크, 체크리스트 등"
          />
        </label>

        <div className="row-actions">
          <button type="submit" className="btn btn-primary">
            {editingProject ? '수정 저장' : '프로젝트 추가'}
          </button>
          {editingProject && (
            <button type="button" className="btn" onClick={onCancelEdit}>
              취소
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default ProjectForm;
