# Shopping Mall Map Editor

A powerful interactive tool for creating, editing, and managing shopping mall maps with multi-floor support, routing capabilities, and a guest preview mode.

![Shopping Mall Map Editor](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=400&width=800)

## Features

- **Interactive Map Editor**: Drag-and-drop interface for placing stores, facilities, and other elements
- **Multi-Floor Support**: Create and manage multiple floors with seamless navigation
- **Building Footprint**: Define the mall's shape with an editable building footprint
- **Pathfinding**: Automatic route generation between any two points on the map
- **Guest Preview Mode**: Share a public view with interactive wayfinding for mall visitors
- **Event Management**: Create and manage mall events with location tagging
- **Shop Information**: Detailed store information management system
- **Responsive Design**: Works on desktop and mobile devices with touch support
- **Real-time Updates**: Changes are saved automatically and reflected immediately

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/shopping-mall-map-editor.git
cd shopping-mall-map-editor
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Creating a New Mall Map

1. Log in to the application
2. Configure the map settings (size, grid, etc.)
3. Define the building footprint
4. Add floors as needed
5. Place elements (stores, facilities, etc.) on each floor
6. Configure element properties
7. Add walking paths for navigation
8. Preview the map in guest mode

### Element Types

- **Store**: Retail spaces with customizable properties
- **Elevator**: Connects multiple floors vertically
- **Escalator**: Connects adjacent floors
- **Room**: Generic spaces like restrooms, offices, etc.
- **Pathway**: Walkable areas for navigation
- **Door**: Entry/exit points on the building perimeter
- **Floor**: Base walkable areas
- **Event**: Temporary locations for mall events

### Navigation

- Use the floor selector to switch between floors
- Zoom controls allow for detailed editing
- Pan the map by dragging in empty areas
- Select elements to edit their properties
- Use CTRL+Wheel to zoom in/out
- Pinch to zoom on touch devices

## Architecture

The application is built with a component-based architecture using React and Next.js:

- **Context API**: Manages global state for map elements and settings
- **React DnD**: Handles drag-and-drop functionality
- **Local Storage**: Persists map data between sessions
- **Tailwind CSS**: Provides responsive styling
- **Pathfinding Algorithm**: Generates optimal routes between points

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React DnD**: Drag and drop for React
- **Lucide React**: Icon library
- **shadcn/ui**: UI component library

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by real-world shopping mall navigation systems
- Built with modern web technologies for optimal performance and user experience
