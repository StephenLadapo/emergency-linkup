import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'public', 'models');

// Ensure models directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log(`Created directory: ${modelsDir}`);
}

// List of models to download
const models = [
  // Face detection models
  { name: 'tiny_face_detector_model-weights_manifest.json', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json' },
  { name: 'tiny_face_detector_model-shard1', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1' },
  
  // Face landmark models
  { name: 'face_landmark_68_model-weights_manifest.json', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json' },
  { name: 'face_landmark_68_model-shard1', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1' },
  
  // Face recognition models
  { name: 'face_recognition_model-weights_manifest.json', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json' },
  { name: 'face_recognition_model-shard1', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1' },
  { name: 'face_recognition_model-shard2', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2' },
  
  // Face expression models
  { name: 'face_expression_model-weights_manifest.json', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json' },
  { name: 'face_expression_model-shard1', url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1' }
];

// Download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download all models
async function downloadModels() {
  console.log('Starting download of face-api.js models...');
  
  for (const model of models) {
    const filePath = path.join(modelsDir, model.name);
    
    try {
      console.log(`Downloading ${model.name}...`);
      await downloadFile(model.url, filePath);
      console.log(`Downloaded ${model.name} successfully`);
    } catch (error) {
      console.error(`Error downloading ${model.name}:`, error.message);
    }
  }
  
  console.log('All models downloaded successfully!');
}

// Run the download
downloadModels().catch(console.error);