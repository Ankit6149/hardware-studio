import { Project } from '../types';

export const exportProjectJson = (project: Project) => {
  if (typeof window === 'undefined') return;
  
  try {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const fileName = `${project.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_blueprint.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export JSON:", error);
  }
};
