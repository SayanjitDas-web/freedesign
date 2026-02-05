// --- STATE MANAGEMENT ---
let designs = JSON.parse(localStorage.getItem("myDesigns")) || [];
let currentDesign = null;
let selectedElementId = null;
let clipboard = null;
let selectedIds = [];

let historyStack = [];
let historyStep = -1;
const MAX_HISTORY = 50; // Prevent memory issues

let isResizing = false;
let currentHandle = null;
let resizeStart = { x: 0, y: 0, w: 0, h: 0, elX: 0, elY: 0, rotation: 0 };

// --- FONT STATE ---
const defaultFonts = [
  "Roboto",
  "Open Sans",
  "Lobster",
  "Pacifico",
  "Oswald",
  "Playfair Display",
  "Arial",
  "Courier New",
];

let availableFonts =
  JSON.parse(localStorage.getItem("myFonts")) || [...defaultFonts];

// --- DOM REFERENCES ---
const homeScreen = document.getElementById("home-screen");
const editorScreen = document.getElementById("editor-screen");
const canvas = document.getElementById("canvas");
const titleInput = document.getElementById("design-title");
const projectList = document.getElementById("project-list");
