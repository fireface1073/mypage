import ProjectItem from './ProjectItem';

function ProjectList({ title, projects, emptyText, ...actions }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      {projects.length === 0 ? (
        <p className="empty">{emptyText}</p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} {...actions} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProjectList;
