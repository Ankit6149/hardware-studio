# Hardware Studio by System Alpha

An offline-first, professional desktop workspace for engineering early-stage hardware concepts. Turn hardware ideas into comprehensive architectural designs, estimate power envelopes, map MCU signals, compile firmware tasks, track bill of materials (BOM), verify prototype readiness, and export standard dossiers.

---

## 🚀 Key Features

* **Interactive Blueprint Canvas**: Connect, drag, drop, and link functional block architectures. Includes specific sub-view perspectives: Outer Design, Internal Stackup, Electronics Schematic, Power distribution, and Firmware networks.
* **SVG Product Visualizer**: Side-by-side visualization of physical dimensions. Maps active component selections to SVG casing layers (e.g. Ring Shell vs. Internal Stackup layers).
* **Multi-Project Workspace**: Create, copy, rename, delete, and import local hardware projects directly from your browser.
* **Component Library accordion**: Structured template library containing over 10 engineering categories (including sensor packages, displays, MCU chipsets, power converters, mechanical elements, manufacturing requirements, and safety compliance).
* **Automated Engineering Sheets**:
  - **BOM Table**: Tracks unit costs, component sourcing stages, part numbers, and suppliers.
  - **Power Budget**: Duty cycle active/sleep simulator calculating battery runtime envelopes.
  - **Pin Router**: Maps signals to physical micro-pins with duplicate routing check validation.
  - **Firmware Plan**: Organizes coding drivers and exports a boilerplate Arduino C++ header structure.
* **Readiness Evaluation**: Computes a weighted, real-time readiness index score (0-100%) tracking critical design blockers, warnings, and next actions.
* **Project Exporters**: Download full canvas schemas as JSON, or download compiled markdown engineering dossiers with formatted reports.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (React, TypeScript, App Router)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Flow Editor**: [React Flow](https://reactflow.dev/) (xyflow)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 💻 Getting Started

First, install the local dependencies and start the development server:

```bash
# Install packages
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser to explore.

### Validation & Build Checks

To verify that the project is completely typed, linted, and optimized for production:

```bash
# Run lint checks
npm run lint

# Build production client bundle
npm run build
```
