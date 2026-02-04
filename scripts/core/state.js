// --- STATE MANAGEMENT ---
let designs = JSON.parse(localStorage.getItem("myDesigns")) || [];
let currentDesign = null;
let selectedElementId = null;
let clipboard = null;
let selectedIds = [];

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
