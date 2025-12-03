# ThreeJS 3D Model Rotator

An interactive 3D model viewer built with React, TypeScript, and Three.js. Display your 3D models with customizable hotspots, smooth camera animations, and an intuitive UI overlay.

## Features

- 🎨 **Fully Configurable** - Control everything via a JSON configuration file
- 🎯 **Interactive Hotspots** - Add clickable points of interest on your 3D model
- 📹 **Smooth Camera Animations** - Elegant transitions when focusing on hotspots
- 🎵 **Background Music** - Optional ambient audio support
- 🖼️ **Multiple Model Formats** - Supports GLTF, GLB, and FBX files
- 🎮 **Orbit Controls** - Rotate, zoom, and pan around your model
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Performance Optimized** - Efficient WebGL context management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ThreeJS-3D-Model-Rotator.git
cd ThreeJS-3D-Model-Rotator
```

2. Install dependencies:
```bash
npm install
```

3. Place your 3D model in the `public/models/` directory

4. Configure your app by editing `public/app-config/appConfig.json`

5. Start the development server:
```bash
npm run dev
```

## Configuration Guide

All customization is done through the `public/app-config/appConfig.json` file. Here's a complete breakdown of all available options:

### Basic Structure

```json
{
  "context": { ... },
  "theme": { ... },
  "assets": { ... },
  "settings": { ... }
}
```

---

### 1. Context Section

Defines the basic information about your model viewer.

```json
"context": {
  "title": "Your Model Title",
  "description": "A brief description of what users are viewing"
}
```

**Options:**
- `title` (string): The main title displayed in the UI
- `description` (string): A description of your 3D model or experience

---

### 2. Theme Section

Customize the visual appearance and colors.

```json
"theme": {
  "backgroundColor": "#1a1a1a",
  "hotspotColor": "#3b82f6",
  "hotspotHoverColor": "#60a5fa",
  "popupBackgroundColor": "#ffffff",
  "popupTextColor": "#1f2937"
}
```

**Options:**
- `backgroundColor` (hex color): The background color of the 3D scene
- `hotspotColor` (hex color): Default color for hotspot markers
- `hotspotHoverColor` (hex color, optional): Color when hovering over hotspots
- `popupBackgroundColor` (hex color): Background color for hotspot info popups
- `popupTextColor` (hex color, optional): Text color inside popups

---

### 3. Assets Section

Configure your 3D model and media files.

```json
"assets": {
  "modelUrl": "./models/your-model.glb",
  "modelType": "gltf",
  "modelScale": 1.5,
  "cameraDistance": 3,
  "musicTrack": "./audio/background-music.mp3"
}
```

**Options:**
- `modelUrl` (string, **required**): Path to your 3D model file (relative to `public/`)
- `modelType` (string, **required**): Type of model - `"gltf"`, `"glb"`, or `"fbx"`
- `modelScale` (number): Scale multiplier for your model (1.0 = original size)
- `cameraDistance` (number): How far the camera starts from the model
- `musicTrack` (string, optional): Path to background music file

**Supported Model Formats:**
- `.glb` - Binary GLTF (recommended)
- `.gltf` - GLTF with separate files
- `.fbx` - Autodesk FBX format

---

### 4. Settings Section

Control behavior, interactions, and hotspots.

```json
"settings": {
  "autoRotate": true,
  "rotateSpeed": 0.5,
  "enableControls": true,
  "showUIControls": true,
  "numberHotspots": true,
  "hotspots": [ ... ]
}
```

**Options:**
- `autoRotate` (boolean): Whether the model automatically rotates
- `rotateSpeed` (number): Speed of auto-rotation (0.5 = slow, 2.0 = fast)
- `enableControls` (boolean, optional): Enable/disable user camera controls
- `showUIControls` (boolean, optional): Show/hide the UI overlay buttons
- `numberHotspots` (boolean, optional): Display numbers on hotspots
- `hotspots` (array): Array of hotspot objects (see below)

---

### 5. Hotspots

Hotspots are interactive points on your 3D model that users can click to learn more.

#### Hotspot Structure

```json
{
  "id": "unique-id",
  "position": { "x": 0.2, "y": 0.5, "z": 0.8 },
  "shape": "sphere",
  "size": 0.1,
  "color": "#3b82f6",
  "pulsate": true,
  "content": {
    "title": "Hotspot Title",
    "description": "Detailed information about this point of interest."
  }
}
```

#### Hotspot Properties

- `id` (string, optional): Unique identifier for the hotspot
- `position` (object, **required**): 3D coordinates in model space
  - `x` (number): X-axis position
  - `y` (number): Y-axis position
  - `z` (number): Z-axis position
- `shape` (string, **required**): Visual shape - `"sphere"`, `"box"`, or `"cone"`
- `size` (number, **required**): Size of the hotspot marker (0.05 - 0.2 recommended)
- `color` (hex color, **required**): Color of this specific hotspot
- `pulsate` (boolean, **required**): Whether the hotspot should pulse/animate
- `content` (object, **required**): Information displayed in popup
  - `title` (string): Popup title
  - `description` (string): Popup description/details

#### Finding Hotspot Positions

To find the right coordinates for your hotspots:

1. Use the browser console to log model dimensions
2. Experiment with values between -1.0 and 1.0
3. Adjust based on your model's scale and orientation
4. Reload the page to see changes immediately

**Example: Adding Multiple Hotspots**

```json
"hotspots": [
  {
    "id": "front-panel",
    "position": { "x": 0.0, "y": 0.3, "z": 0.8 },
    "shape": "sphere",
    "size": 0.08,
    "color": "#3b82f6",
    "pulsate": true,
    "content": {
      "title": "Front Panel",
      "description": "The main control interface."
    }
  },
  {
    "id": "side-vent",
    "position": { "x": -0.6, "y": 0.2, "z": 0.3 },
    "shape": "box",
    "size": 0.1,
    "color": "#ef4444",
    "pulsate": false,
    "content": {
      "title": "Cooling Vent",
      "description": "Ensures proper airflow."
    }
  }
]
```

---

## Complete Example Configuration

Here's a complete `appConfig.json` example:

```json
{
  "context": {
    "title": "PlayStation 2 Interactive Model",
    "description": "Explore the best-selling console of all time"
  },
  "theme": {
    "backgroundColor": "#1a1a1a",
    "hotspotColor": "#3b82f6",
    "hotspotHoverColor": "#60a5fa",
    "popupBackgroundColor": "#ffffff",
    "popupTextColor": "#1f2937"
  },
  "assets": {
    "modelUrl": "./models/playstation_2.glb",
    "modelType": "gltf",
    "modelScale": 1.5,
    "cameraDistance": 3,
    "musicTrack": "./audio/ps2-startup.mp3"
  },
  "settings": {
    "autoRotate": true,
    "rotateSpeed": 0.5,
    "enableControls": true,
    "showUIControls": true,
    "numberHotspots": true,
    "hotspots": [
      {
        "id": "power-button",
        "position": { "x": 0.2, "y": 0.5, "z": 0.8 },
        "shape": "sphere",
        "size": 0.1,
        "color": "#3b82f6",
        "pulsate": true,
        "content": {
          "title": "Power Button",
          "description": "The iconic blue LED power indicator."
        }
      }
    ]
  }
}
```

---

## Project Structure

```
ThreeJS-3D-Model-Rotator/
├── public/
│   ├── app-config/
│   │   └── appConfig.json      # Main configuration file
│   ├── models/                 # Place your 3D models here
│   └── audio/                  # Background music files
├── src/
│   ├── components/
│   │   ├── CameraAnimation.tsx # Camera movement logic
│   │   ├── ConfigLoader.tsx    # Loads configuration
│   │   ├── Controls.tsx        # OrbitControls setup
│   │   ├── ErrorHandler.tsx    # Error display
│   │   ├── HotspotManager.tsx  # Hotspot creation
│   │   ├── ModelLoader.tsx     # 3D model loading
│   │   ├── Renderer.tsx        # Three.js renderer setup
│   │   └── UIOverlay.tsx       # UI controls
│   ├── types/
│   │   └── types.ts            # TypeScript interfaces
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Entry point
└── README.md
```

---

## How It Works

### Initialization Flow

1. **Config Loading** - `ConfigLoader.tsx` fetches `appConfig.json`
2. **Renderer Setup** - `Renderer.tsx` creates the Three.js scene, camera, and lighting
3. **Model Loading** - `ModelLoader.tsx` loads and scales your 3D model
4. **Controls** - `Controls.tsx` sets up OrbitControls for user interaction
5. **Hotspots** - `HotspotManager.tsx` creates interactive markers based on config
6. **Animation** - `CameraAnimation.tsx` handles smooth camera transitions

### User Interactions

- **Click & Drag** - Rotate the model around
- **Scroll** - Zoom in and out
- **Right Click & Drag** - Pan the camera
- **Click Hotspot** - Smooth camera animation + info popup
- **UI Buttons** - Reset camera, toggle fullscreen, control music

---

## UI Controls

When `showUIControls` is enabled, users can access:

- **🖼️ Fullscreen** - Toggle fullscreen mode
- **🔄 Reset Camera** - Return to initial view
- **🎵 Music Toggle** - Play/pause background music (if configured)

---

## Tips for Best Results

### Model Preparation

- **Optimize Your Model**: Keep polygon count reasonable (< 100k triangles)
- **Use GLB Format**: It's compressed and loads faster than GLTF
- **Center Your Model**: Position the model at origin (0,0,0) in your 3D software
- **Set Proper Scale**: Use `modelScale` in config if model is too large/small

### Hotspot Placement

- **Strategic Positioning**: Place hotspots on important features
- **Avoid Clustering**: Space hotspots out for better visibility
- **Test Different Angles**: Rotate model to ensure hotspots are accessible
- **Use Pulsation Sparingly**: Too many pulsating hotspots can be distracting

### Performance

- **Limit Hotspots**: 5-10 hotspots is ideal for performance
- **Optimize Textures**: Use compressed textures (JPG over PNG when possible)
- **Test on Mobile**: Check performance on slower devices

---

## Camera Controls Reference

| Action | Mouse | Touch |
|--------|-------|-------|
| Rotate | Left Click + Drag | One Finger Drag |
| Zoom | Scroll Wheel | Pinch |
| Pan | Right Click + Drag | Two Finger Drag |

---

## Troubleshooting

### Model Not Loading

- Check that `modelUrl` path is correct
- Verify model file exists in `public/models/`
- Ensure `modelType` matches your file extension
- Check browser console for error messages

### Hotspots Not Appearing

- Verify hotspot positions are within model bounds
- Check that `size` is appropriate (try 0.1)
- Ensure colors contrast with background
- Look for hotspots behind the model

### Popup Not Showing

- Wait for camera animation to complete (1.5 seconds)
- Check that hotspot has valid `content` object
- Try clicking directly on the hotspot center

### Performance Issues

- Reduce model polygon count
- Decrease number of hotspots
- Disable `pulsate` on some hotspots
- Lower `modelScale` value

---

## Credits

Built with:
- [React](https://react.dev/)
- [Three.js](https://threejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

---