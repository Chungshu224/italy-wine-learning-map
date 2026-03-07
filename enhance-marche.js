import fs from 'fs';

const filePath = 'public/courses/level2/L2M2L1.json';
console.log('📖 Reading original file...');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('✏ī¸ Adding new slides...');

// OLD: Find and save the ending part  
const endMarker = `<section class='slide'><h2>🎓 重點回顧</h2>`;
const styleMarker = `</style>`;

// Content sections to add (will be added below)
const newSlides = []; 
const newCSS = ``;

// ... Insert slides content below ...

console.log('💡 Script ready - building content...');
