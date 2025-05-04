# Implementing Shopping Mall Map Editor in Your React Project

This guide explains how to integrate the Shopping Mall Map Editor into your existing React application.

## Prerequisites

- React 18.x or higher
- Next.js 13.x or higher (for App Router features)
- TypeScript 5.x or higher
- Tailwind CSS 3.x

## Installation

### 1. Install Required Dependencies

\`\`\`bash
npm install react-dnd react-dnd-html5-backend lucide-react tailwindcss postcss autoprefixer
# or
yarn add react-dnd react-dnd-html5-backend lucide-react tailwindcss postcss autoprefixer
\`\`\`

### 2. Copy Core Components

Copy the following directories from the source project:

- `components/map/`: Core map rendering components
- `components/panels/`: UI panels for element properties and settings
- `context/map-editor-context.tsx`: State management for the map editor
- `hooks/`: Custom hooks for grid and drag operations
- `types/`: TypeScript type definitions
- `utils/`: Utility functions for pathfinding and other operations

### 3. Configure Tailwind CSS

Ensure your `tailwind.config.js` includes the necessary configuration:

\`\`\`javascript
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add any custom colors or extensions here
    },
  },
  plugins: [],
}
\`\`\`

## Core Concepts

### Map Editor Context

The `MapEditorContext` is the central state management system. It provides:

- Element management (add, update, remove)
- Floor management
- Selection state
- Map settings
- UI state
- Zoom controls

\`\`\`typescript
// Example of using the MapEditorContext
import { useMapEditor } from '@/context/map-editor-context';

function MyComponent() {
  const { 
    elements, 
    addElement, 
    currentFloor,
    setCurrentFloor 
  } = useMapEditor();
  
  // Use these functions and state in your component
}
\`\`\`

### Map Elements

Each element on the map is represented by a `MapElement` object:

\`\`\`typescript
interface MapElement {
  id: string;
  type: string; // 'store', 'elevator', 'escalator', etc.
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  color: string;
  floor: number;
  walkable: boolean;
  // Additional properties based on type
}
\`\`\`

### Drag and Drop

The map editor uses React DnD for drag-and-drop functionality:

1. Elements can be dragged from panels onto the map
2. Existing elements can be moved within the map
3. Custom hooks handle grid snapping and boundary checks

## Integration Steps

### 1. Wrap Your Application with Providers

\`\`\`tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MapEditorProvider } from '@/context/map-editor-context';

function MyApp({ Component, pageProps }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <MapEditorProvider>
        <Component {...pageProps} />
      </MapEditorProvider>
    </DndProvider>
  );
}

export default MyApp;
\`\`\`

### 2. Add the Map Editor Component

\`\`\`tsx
import { MapEditor } from '@/components/map/map-editor';
import { LeftSidebar } from '@/components/layout/left-sidebar';
import { RightSidebar } from '@/components/layout/right-sidebar';

function MapEditorPage() {
  return (
    <div className="flex h-screen">
      <LeftSidebar />
      <div className="flex-1">
        <MapEditor />
      </div>
      <RightSidebar />
    </div>
  );
}

export default MapEditorPage;
\`\`\`

### 3. Customize Element Types and Properties

Modify the `types/index.ts` file to add custom element types or properties specific to your use case.

### 4. Implement Storage

By default, the map editor uses localStorage for persistence. To use a database:

1. Modify the `MapEditorProvider` to load/save data from your API
2. Implement API endpoints for CRUD operations on map data
3. Update the save/load functions in the context

\`\`\`typescript
// Example of database integration
useEffect(() => {
  // Load data from API instead of localStorage
  async function loadMapData() {
    const response = await fetch('/api/maps/1');
    const data = await response.json();
    setElements(data.elements);
    setMapSettings(data.settings);
  }
  
  loadMapData();
}, []);

// Save data to API when elements change
useEffect(() => {
  async function saveMapData() {
    await fetch('/api/maps/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements, settings: mapSettings })
    });
  }
  
  saveMapData();
}, [elements, mapSettings]);
\`\`\`

## Customization Options

### Styling

The map editor uses Tailwind CSS for styling. You can customize the appearance by:

1. Modifying the color scheme in your Tailwind config
2. Overriding component styles with custom CSS
3. Extending the theme with additional design tokens

### Adding New Element Types

1. Update the `types/index.ts` file to include your new element type
2. Add an icon for the new element type in `components/map/element-icon.tsx`
3. Create a properties panel for the new element type
4. Update the element panel to include your new element type

### Custom Pathfinding

The default pathfinding algorithm can be replaced or extended:

1. Modify `utils/pathfinding.ts` to implement your custom algorithm
2. Update the route generation logic in relevant components

## Best Practices

1. **Performance**: For large maps with many elements, implement virtualization
2. **Accessibility**: Ensure keyboard navigation works for all interactive elements
3. **Mobile Support**: Test touch interactions thoroughly on various devices
4. **Data Backup**: Implement regular saving and versioning for map data
5. **Error Handling**: Add robust error handling for all user interactions

## Troubleshooting

### Common Issues

1. **Elements not snapping to grid**: Check grid size settings and ensure snap-to-grid is enabled
2. **Pathfinding not working**: Verify walkable areas are properly connected
3. **Performance issues**: Reduce the number of elements or implement virtualization
4. **Touch events not working**: Ensure touch event handlers are properly configured

### Support

For additional help, please open an issue on the GitHub repository or contact the maintainers.
