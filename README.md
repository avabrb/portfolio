# Ava Baraban — Portfolio Website

An interactive, responsive portfolio website showcasing projects across Computer Science, Transnational Asian Studies, sustainability, and ethical AI. The site features a premium, rich dark-mode aesthetic with custom animations and a dynamic, interactive flower physics simulation.

Live project pages included:
- **EasyRead**: Graph-guided LLM NLP pipeline for automated text simplification.
- **Fatal Attraction**: 3-Player asymmetric video game built in Godot and C#.
- **Human-AI Relations in China**: Award-winning governance and philosophical research.
- **Consular Corps of Houston**: Full-stack civic tech web portal.
- **Gridlocked: Taiwan's Energy**: Forthcoming research paper in Rice Asian Studies Review.

---

## Features

- **Dynamic Gravity Simulation**: Interactive flower scatter section. Click anywhere in the projects section to trigger falling gravity, bounding, and settling dynamics using custom vanilla JavaScript physics.
- **Micro-Animations**: Hover effect rotates flowers, pulls focus on projects, and wiggles text prompts.
- **Custom Visual Experience**: A custom ladybug cursor appears exclusively when interacting with the projects grid.
- **Optimized Performance**: Pre-rendered multi-page application bundled with Vite.

---

## Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES6+), CSS3 Custom Variables (Custom styling)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Deployment & Hosting**: Vite static compilation (`dist/`) ready for GitHub Pages, Vercel, Netlify, or Firebase Hosting.

---

## Directory Structure

```
portfolio/
├── .gitignore                # Excludes dependencies, builds, OS metadata
├── LICENSE                   # Open-source MIT license
├── README.md                 # Project documentation
├── package.json              # NPM package manifest
├── vite.config.js            # Vite bundler configurations
│
# Web pages
├── index.html                # Homepage & Hero
├── easyread.html             # EasyRead project details page
├── fatalattraction.html      # Fatal Attraction project details page
├── chinaai.html              # Human-AI Relations in China project details page
├── ccohwebsite.html          # Consular Corps of Houston project details page
├── taiwanenergy.html         # Taiwan's Energy project details page
│
├── src/                      # Application source code
│   ├── scripts/
│   │   └── physics.js        # Gravity and physics engine
│   └── styles/
│       └── main.css          # Core styles & layout configurations
│
└── public/                   # Static assets (served at "/" by Vite)
    ├── icons/                # SVG/Cursor assets
    ├── images/
    │   ├── flowers/          # Flower PNGs representing projects and decorations
    │   ├── profile/          # Profile images
    │   └── projects/         # Card/poster preview images
    └── media/                # Gameplay recordings and video assets
```

---

## Local Development

To run this project locally, make sure you have [Node.js](https://nodejs.org/) (version 18+) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
Starts a local development server with Hot Module Replacement (HMR).
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
Builds the production-ready static assets to the `dist/` directory.
```bash
npm run build
```

### 4. Preview Build
Locally preview the production build output.
```bash
npm run preview
```

---

## License

This project is open-source and available under the [MIT License](LICENSE).
