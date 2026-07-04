import { Project } from '../../types';

export const emptyTemplate: Project = {
  id: "empty-project",
  projectName: "New Hardware Project",
  description: "A blank template to design your custom hardware from scratch.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateName: "Empty Hardware Project",
  version: "1.0",
  activeView: "master",
  nodes: [],
  edges: [],
  bom: [],
  testing: [],
  powerBudget: [],
  pinMap: [],
  firmwareTasks: [],
  batteryCapacityMah: 100
};
