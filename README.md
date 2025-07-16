# ParkingParkAI - Tel Aviv Smart Parking Map 🅿️

An intell## Installation

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- Modern web browser with JavaScript enabled

### Setup Instructions

1. **Clone the repository:**
    ```bash
    git clone https://github.com/matanew1/ParkingParkAI.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd ParkingParkAI
    ```

3. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

4. **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

5. **Open your browser:**
    Navigate to `http://localhost:5173` to view the application

### Build for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory, ready for deployment.

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint code analysisarking management system for Tel Aviv that provides live parking availability, interactive maps, and seamless navigation integration. Built with modern web technologies for optimal performance and user experience across all devices.

## Features

### 🗺️ **Interactive Map**
- **Real-Time Parking Data**: Live parking availability from Tel Aviv's GIS API for both public and private parking spots
- **Interactive Leaflet Map**: Smooth, responsive map with zoom controls and location services
- **Smart Marker Clustering**: Optimized marker grouping for better performance at different zoom levels
- **Custom Parking Markers**: Color-coded markers indicating parking status (Available, Limited, Full, Closed)
- **Viewport Filtering**: Dynamic loading of parking spots based on current map view for optimal performance

### 📍 **Location & Navigation**
- **GPS Location Services**: Get current user location with high accuracy
- **Waze Integration**: Direct navigation to parking spots via Waze app (mobile) or web
- **Route Planning**: Display routes to selected parking destinations
- **Location Marker**: Visual indicator of user's current position on the map

### 🔍 **Search & Filter**
- **Real-Time Search**: Instant search through parking spots by name, address, or status
- **Virtualized List**: High-performance rendering of large parking datasets
- **Status-Based Filtering**: Filter parking spots by availability status
- **Smart Debouncing**: Optimized search with reduced API calls

### 🎨 **User Interface**
- **Dark/Light Theme**: Toggle between dark and light modes with smooth transitions
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Material-UI Components**: Modern, accessible UI components
- **Animated Interactions**: Smooth animations using Framer Motion
- **Progressive Web App**: Works offline with cached data

### 📱 **Mobile Optimization**
- **Touch-Friendly Interface**: Optimized for mobile touch interactions
- **Adaptive Layouts**: Different layouts for mobile, tablet, and desktop
- **Mobile-First Design**: Prioritized mobile user experience
- **Gesture Support**: Intuitive map gestures for mobile devices

### ⚡ **Performance Features**
- **Multi-Level Caching**: Memory cache, spatial cache, and localStorage backup
- **Rate Limiting**: Prevents API overload with intelligent request throttling
- **Lazy Loading**: Components loaded on demand for faster initial load times
- **Viewport-Based Rendering**: Only render visible parking spots for better performance
- **Error Boundaries**: Graceful error handling and recovery

### 🛠️ **Technical Features**
- **TypeScript**: Full type safety and enhanced development experience
- **Coordinate Conversion**: Automatic conversion from Israel TM Grid to WGS84
- **Data Validation**: Comprehensive coordinate and data validation
- **Auto-Refresh**: Automatic data updates every 5 minutes
- **Offline Support**: Cached data for offline functionality
- **CORS Handling**: Proxy setup for development and direct API calls in production

### 📊 **Data Management**
- **Multiple Data Sources**: Integration with Tel Aviv's public and private parking APIs
- **Real-Time Status**: Live parking availability and pricing information
- **Data Persistence**: localStorage backup for offline access
- **Smart Caching**: Intelligent cache invalidation and refresh strategies

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/matanew1/ParkingParkAI.git
    ```
2. Navigate to the project directory:
    ```bash
    cd ParkingParkAI
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the application:
    ```bash
    npm run dev
    ```

## Usage

### Getting Started
1. Open the application in your browser at `http://localhost:5173`
2. Allow location permissions when prompted for the best experience
3. Browse the interactive map to view real-time parking availability
4. Use the search functionality to find specific parking locations
5. Click on parking markers to view detailed information and pricing
6. Navigate to parking spots using the integrated Waze navigation

### Key Features Guide

#### **Map Navigation**
- **Zoom**: Use mouse wheel or touch gestures to zoom in/out
- **Pan**: Click and drag to move around the map
- **Reset**: Use the reset button to return to default view
- **Location**: Click the location button to center on your current position

#### **Parking Information**
- **Green markers**: Available parking spots
- **Yellow markers**: Limited availability
- **Red markers**: Full or closed parking
- **Click markers**: View detailed information including pricing and address

#### **Search & Filter**
- **Search bar**: Type parking lot names, addresses, or keywords
- **Real-time results**: Results update as you type
- **Status filtering**: Filter by availability status

#### **Navigation**
- **Waze Integration**: Tap the Waze button on any parking spot for turn-by-turn navigation
- **Mobile**: Opens Waze app directly
- **Desktop**: Opens Waze web interface

#### **Theme & Accessibility**
- **Dark/Light Mode**: Toggle between themes using the theme button
- **Responsive**: Automatically adapts to your device size
- **Accessibility**: Full keyboard navigation and screen reader support

## Technologies Used

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Material-UI (MUI)** - Comprehensive React component library
- **Framer Motion** - Smooth animations and transitions
- **Leaflet & React-Leaflet** - Interactive maps with clustering support
- **Tanstack React Virtual** - Virtualized lists for optimal performance

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI Theming** - Dark/light theme support
- **CSS Animations** - Custom animations and transitions
- **Responsive Design** - Mobile-first approach

### Data & APIs
- **Tel Aviv GIS API** - Real-time parking data from municipal sources
- **Valhalla Routing API** - Open-source routing and navigation
- **Axios** - HTTP client for API requests
- **Proj4** - Coordinate system transformations (Israel TM Grid to WGS84)

### Performance & Optimization
- **Viewport Filtering** - Dynamic content loading based on map view
- **Multi-level Caching** - Memory, spatial, and localStorage caching
- **React Virtual** - Efficient rendering of large datasets
- **Marker Clustering** - Optimized marker grouping for maps
- **Debouncing & Throttling** - Request optimization

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **PostCSS & Autoprefixer** - CSS processing and browser compatibility
- **TypeScript Compiler** - Type checking and compilation

### Geospatial Features
- **Leaflet Maps** - Interactive mapping library
- **Coordinate Validation** - Israeli coordinate system validation
- **GPS Integration** - Browser geolocation API
- **Route Planning** - Navigation and routing capabilities

## Project Structure

```
ParkingParkAI/
├── public/                 # Static assets
│   ├── me.png             # App icons
│   ├── me.svg
│   └── waze-icon.svg      # Waze navigation icon
├── src/
│   ├── components/        # React components
│   │   ├── Map/          # Map-related components
│   │   │   ├── OptimizedParkingMap.tsx    # Main map component
│   │   │   ├── OptimizedMarker.tsx        # Individual parking markers
│   │   │   ├── LocationMarker.tsx         # User location marker
│   │   │   └── utils/                     # Map utilities
│   │   ├── Sidebar/      # Sidebar components
│   │   │   ├── index.tsx                  # Main sidebar
│   │   │   ├── VirtualizedParkingList.tsx # Optimized parking list
│   │   │   ├── ParkingSearch.tsx          # Search functionality
│   │   │   └── RefreshControl.tsx         # Data refresh controls
│   │   ├── Theme/        # Theme management
│   │   │   ├── ThemeConfig.tsx            # Theme configuration
│   │   │   └── ThemeToggle.tsx            # Dark/light mode toggle
│   │   ├── Options/      # Settings and options
│   │   ├── Hooks/        # Custom React hooks
│   │   ├── AppContent.tsx # Main app layout
│   │   └── AppHeader.tsx  # App header
│   ├── Context/          # React context providers
│   │   ├── ParkingContext.tsx             # Main app state
│   │   └── ThemeContext.tsx               # Theme state
│   ├── Services/         # API and data services
│   │   ├── parkingService.ts              # Parking data API
│   │   └── routeService.ts                # Navigation routing
│   ├── Types/           # TypeScript type definitions
│   │   ├── parking.ts                     # Parking data types
│   │   ├── location.ts                    # Location types
│   │   ├── app.ts                         # App types
│   │   └── opt.ts                         # Option types
│   ├── utils/           # Utility functions
│   │   ├── CacheManager.ts                # Data caching
│   │   ├── SpatialCacheManager.ts         # Geographic caching
│   │   ├── colorUtils.ts                  # Color utilities
│   │   ├── coordinateValidation.ts        # GPS validation
│   │   ├── debounceThrottle.ts           # Performance optimization
│   │   └── ErrorBoundary.tsx             # Error handling
│   ├── hooks/           # Custom hooks
│   │   ├── useViewportFilter.ts           # Map viewport filtering
│   │   └── useAutoPopup.ts               # Automatic popup management
│   ├── styles/          # CSS and styling
│   │   ├── animations.css                 # CSS animations
│   │   └── markerClusters.css            # Map cluster styling
│   ├── App.tsx          # Root component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md           # Project documentation
```

## API Integration

The application integrates with several APIs to provide comprehensive parking information:

### Tel Aviv GIS API
- **Endpoint**: `https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/`
- **Public Parking**: Layer 970 - Municipal parking lots
- **Private Parking**: Layer 555 - Private parking facilities
- **Data Format**: GeoJSON with Israeli TM Grid coordinates (EPSG:2039)
- **Update Frequency**: Real-time data with 5-minute refresh intervals

### Valhalla Routing API
- **Endpoint**: `https://valhalla1.openstreetmap.de/route`
- **Purpose**: Route calculation and navigation
- **Features**: Multiple transport modes, route optimization
- **Response**: Turn-by-turn directions and route geometry

## Performance Optimizations

### Caching Strategy
- **Memory Cache**: 5-minute TTL for API responses
- **Spatial Cache**: Geographic bounds-based caching
- **localStorage**: Offline data persistence
- **Cache Invalidation**: Smart refresh based on user interaction

### Rendering Optimizations
- **Viewport Filtering**: Only render visible map markers
- **Virtual Scrolling**: Efficient list rendering for large datasets
- **Marker Clustering**: Group nearby markers for better performance
- **Lazy Loading**: Component-based code splitting

### Network Optimizations
- **Request Debouncing**: Prevent excessive API calls
- **Rate Limiting**: Controlled API request frequency
- **CORS Proxy**: Development proxy for cross-origin requests
- **Error Recovery**: Graceful fallback to cached data

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature-name"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries, support, or contributions, please contact:

- **GitHub**: [@matanew1](https://github.com/matanew1)
- **Repository**: [ParkingParkAI](https://github.com/matanew1/ParkingParkAI)
- **Live Demo**: [Tel Aviv Parking Map](https://matanew1.github.io/ParkingParkAI)

---

**Made with ❤️ for Tel Aviv drivers** - Finding parking made easier!