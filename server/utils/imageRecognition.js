import fs from 'fs';
import path from 'path';

// Optional TensorFlow import - server will work without it
let tf = null;
let model = null;
let tfAvailable = false;
let tfLoadPromise = null;

// Lazy load TensorFlow - only try to load when first needed
async function loadTensorFlow() {
  if (tfLoadPromise) {
    return tfLoadPromise;
  }
  
  tfLoadPromise = (async () => {
    try {
      // Try to import TensorFlow - if it fails, we'll skip ML features
      const tfModule = await import('@tensorflow/tfjs-node');
      tf = tfModule.default || tfModule;
      tfAvailable = true;
      console.log('TensorFlow.js loaded successfully');
      return true;
    } catch (error) {
      console.warn('TensorFlow.js not available - ML image recognition will be disabled:', error.message);
      tfAvailable = false;
      return false;
    }
  })();
  
  return tfLoadPromise;
}

async function loadModel() {
  if (!tfAvailable || !tf) {
    return null;
  }
  
  if (!model) {
    try {
      model = await tf.node.loadSavedModel(
        'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1',
        ['serve'],
        'serving_default'
      );
      console.log('TensorFlow model loaded successfully');
    } catch (error) {
      console.error('Failed to load TensorFlow model:', error.message);
      return null;
    }
  }
  return model;
}

/**
 * Analyzes an image to detect plants and people
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{hasPerson: boolean, hasPlant: boolean, detections: Array}>}
 */
export async function analyzeImage(imagePath) {
  try {
    // Try to load TensorFlow if not already attempted
    if (!tfAvailable && tfLoadPromise === null) {
      await loadTensorFlow();
    }
    
    // Check if TensorFlow is available
    if (!tfAvailable || !tf) {
      return { 
        hasPerson: false, 
        hasPlant: false, 
        detections: [], 
        error: 'TensorFlow.js not available - ML features disabled',
        mlDisabled: true
      };
    }
    
    // Load the model if not already loaded
    const loadedModel = await loadModel();
    if (!loadedModel) {
      return { 
        hasPerson: false, 
        hasPlant: false, 
        detections: [], 
        error: 'TensorFlow model could not be loaded',
        mlDisabled: true
      };
    }
    
    // Read and decode the image
    const imageBuffer = fs.readFileSync(imagePath);
    const tfImage = tf.node.decodeImage(imageBuffer);
    
    // Prepare the image (convert to 3 channels if needed)
    const input = tf.expandDims(tfImage);
    
    // Run inference
    const predictions = await loadedModel.predict(input);
    
    // Process results
    const detections = await processDetections(predictions);
    
    // Check for plants and people
    const hasPerson = detections.some(d => d.class === 'person' && d.score > 0.6);
    const hasPlant = detections.some(d => 
      ['plant', 'tree', 'flower', 'potted plant'].includes(d.class) && d.score > 0.5
    );
    
    // Clean up tensors
    tf.dispose([tfImage, input, ...Object.values(predictions)]);
    
    return {
      hasPerson,
      hasPlant,
      detections: detections.filter(d => d.score > 0.5) // Only return confident detections
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return { hasPerson: false, hasPlant: false, detections: [], error: error.message };
  }
}

/**
 * Process the raw model predictions into usable detection objects
 */
async function processDetections(predictions) {
  // Extract detection boxes, scores, and classes
  const boxes = predictions.detection_boxes.arraySync()[0];
  const scores = predictions.detection_scores.arraySync()[0];
  const classes = predictions.detection_classes.arraySync()[0];
  
  // Map class indices to labels (COCO dataset classes)
  const labels = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
    'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
    'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
    'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
    'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
  ];
  
  // Convert to a more usable format
  const detections = [];
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > 0.3) { // Only include detections with confidence > 30%
      detections.push({
        box: boxes[i], // [y1, x1, y2, x2] format
        class: labels[classes[i] - 1], // Adjust for 0-indexing
        score: scores[i]
      });
    }
  }
  
  return detections;
}

// Initialize TensorFlow and model in the background (only if TensorFlow is available)
(async () => {
  try {
    const loaded = await loadTensorFlow();
    if (loaded && tfAvailable) {
      loadModel().catch(err => console.error('Failed to load TensorFlow model:', err));
    } else {
      console.log('TensorFlow.js not available - skipping ML model initialization');
    }
  } catch (err) {
    console.log('TensorFlow.js not available - skipping ML model initialization');
  }
})();

export default { analyzeImage };