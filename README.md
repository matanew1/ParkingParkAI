# ParkingParkAI - Tel Aviv Smart Parking Map 🅿️

An intelligent parking management system for Tel Aviv that provides live parking availability, interactive maps, and seamless navigation integration. Built with modern web technologies for optimal performance and user experience across all devices.

## Installation

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
- `npm run lint` - Run ESLint code analysis

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
- **Favorite Parking Spots**: Bookmark frequently used parking locations for quick access

### 🔍 **Search & Filter**
- **Real-Time Search**: Instant search through parking spots by name, address, or status
- **Virtualized List**: High-performance rendering of large parking datasets
- **Status-Based Filtering**: Filter parking spots by availability status
- **Smart Debouncing**: Optimized search with reduced API calls
- **Favorites Management**: Organize and manage bookmarked parking spots with custom nicknames

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
- **Favorites Storage**: Persistent bookmarking with local storage and export/import capabilities

### 🔔 **Smart Notifications** ⭐ *NEW*
- **Real-Time Status Alerts**: Get notified instantly when parking spots change from closed/full to available
- **Favorite Spot Monitoring**: Priority notifications for your bookmarked parking locations
- **Customizable Settings**: Control notification types, timing, and behavior
- **Quiet Hours**: Disable notifications during specified time periods
- **Smart Filtering**: Only receive notifications for meaningful status improvements
- **Offline Support**: Notifications work even when the app is closed (browser dependent)

## Upcoming Features 🚀

###  **Analytics & Insights**
- **Parking History**: Track your parking patterns and favorite locations
- **Cost Analytics**: Monitor parking expenses with detailed spending reports
- **Usage Statistics**: View personal parking statistics and trends
- **Predictive Analytics**: AI-powered predictions for optimal parking times

### 🎯 **Advanced Search & Filtering**
- **Multi-Criteria Search**: Filter by price range, distance, availability, and amenities
- **Time-Based Filtering**: Find parking available for specific time periods
- **Accessibility Options**: Filter for disabled-accessible parking spots
- **EV Charging Stations**: Locate parking with electric vehicle charging capabilities

### 🚗 **Smart Parking Assistant**
- **Parking Reservation**: Pre-book parking spots in advance (where supported)
- **Smart Parking Timer**: Automatic timer with extension options
- **Payment Integration**: In-app payment for parking fees
- **Digital Parking Receipts**: Store and manage parking receipts digitally

### 👥 **Social & Community Features**
- **Crowd-Sourced Updates**: User-reported parking availability and issues
- **Community Reviews**: Rate and review parking locations
- **Parking Tips**: Share local parking knowledge and tips
- **Group Parking**: Coordinate parking for events or group activities

### 🌐 **Enhanced Integration**
- **Calendar Integration**: Sync with calendar events for automatic parking suggestions
- **Google Maps Integration**: Alternative routing and navigation options
- **Public Transport Integration**: Combined parking and public transport journey planning
- **Weather-Aware Suggestions**: Parking recommendations based on weather conditions

### 🔒 **Security & Safety**
- **Parking Security Ratings**: Community-rated safety scores for parking areas
- **Emergency Contacts**: Quick access to security and emergency services
- **Incident Reporting**: Report security issues or parking violations
- **Safe Walking Routes**: Suggested safe walking paths from parking to destination

### 📱 **Enhanced Mobile Experience**
- **Offline Mode**: Full functionality without internet connection
- **Widget Support**: Quick parking status on device home screen
- **Voice Commands**: Voice-activated parking search and navigation
- **Apple CarPlay/Android Auto**: In-car integration for seamless experience

### 🏢 **Business & Enterprise Features**
- **Corporate Accounts**: Bulk parking management for businesses
- **Employee Parking**: Dedicated features for workplace parking management
- **Parking Validation**: Digital validation system for businesses
- **Fleet Management**: Multi-vehicle parking coordination

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
2. **Enable notifications** when prompted for real-time parking alerts
3. Allow location permissions when prompted for the best experience
4. Browse the interactive map to view real-time parking availability
5. Use the search functionality to find specific parking locations
6. Click on parking markers to view detailed information and pricing
7. Navigate to parking spots using the integrated Waze navigation

### Key Features Guide

#### **Notifications Setup** ⭐ *NEW*
- **Enable Notifications**: Click the notification bell icon in the header to access settings
- **Permission Required**: Grant browser notification permission for real-time alerts
- **Customize Types**: Choose which types of parking alerts you want to receive
- **Quiet Hours**: Set specific times when notifications should be disabled
- **Favorite Priority**: Notifications for favorite spots are automatically high priority
- **Status Monitoring**: Get alerted when parking changes from unavailable to available

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
- **Favorites tab**: Quick access to your bookmarked parking spots

#### **Favorites Management**
- **Bookmark spots**: Click the star icon to add parking spots to favorites
- **Custom nicknames**: Give memorable names to your favorite spots (e.g., "Near office", "Shopping center")
- **Organized view**: View all favorites in a dedicated tab with quick navigation
- **Persistent storage**: Favorites are saved locally and persist across sessions

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

### Notification & Background Services ⭐ *NEW*
- **Web Notifications API** - Browser-native notification system
- **Service Worker** - Background processing and offline notifications
- **Push API Ready** - Infrastructure for future push notification support
- **Local Storage Integration** - Persistent notification preferences and history
- **Smart Status Monitoring** - Intelligent parking status change detection

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
│   ├── waze-icon.svg      # Waze navigation icon
│   └── sw.js              # Service worker for notifications ⭐ NEW
├── src/
│   ├── components/        # React components
│   │   ├── Map/          # Map-related components
│   │   │   ├── OptimizedParkingMap.tsx    # Main map component
│   │   │   ├── OptimizedMarker.tsx        # Individual parking markers
│   │   │   ├── LocationMarker.tsx         # User location marker
│   │   │   └── utils/                     # Map utilities
│   │   ├── Sidebar/      # Sidebar components
│   │   │   ├── index.tsx                  # Main sidebar with tabs
│   │   │   ├── VirtualizedParkingList.tsx # Optimized parking list
│   │   │   ├── ParkingSearch.tsx          # Search functionality
│   │   │   └── RefreshControl.tsx         # Data refresh controls
│   │   ├── Favorites/    # Favorites management
│   │   │   ├── FavoritesList.tsx          # Favorites list component
│   │   │   ├── FavoriteToggleButton.tsx   # Star toggle button
│   │   │   └── index.ts                   # Favorites exports
│   │   ├── Notifications/ # Notification system ⭐ NEW
│   │   │   ├── NotificationPanel.tsx      # Notification center panel
│   │   │   ├── NotificationSettings.tsx   # Notification preferences
│   │   │   ├── NotificationBadge.tsx      # Header notification badge
│   │   │   └── index.ts                   # Notification exports
│   │   ├── Theme/        # Theme management
│   │   │   ├── ThemeConfig.tsx            # Theme configuration
│   │   │   └── ThemeToggle.tsx            # Dark/light mode toggle
│   │   ├── Options/      # Settings and options
│   │   ├── Hooks/        # Custom React hooks
│   │   ├── AppContent.tsx # Main app layout
│   │   └── AppHeader.tsx  # App header with favorites badge
│   ├── Context/          # React context providers
│   │   ├── ParkingContext.tsx             # Main app state
│   │   ├── ThemeContext.tsx               # Theme state
│   │   ├── FavoritesContext.tsx           # Favorites state management
│   │   └── NotificationContext.tsx        # Notification system state ⭐ NEW
│   ├── Services/         # API and data services
│   │   ├── parkingService.ts              # Parking data API
│   │   ├── routeService.ts                # Navigation routing
│   │   ├── favoritesService.ts            # Favorites management service
│   │   └── notificationService.ts         # Notification system service ⭐ NEW
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
│   │   ├── useAutoPopup.ts               # Automatic popup management
│   │   └── useParkingNotificationIntegration.ts # Notification integration ⭐ NEW
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

## Potential Integrations & Partnerships 🤝

### Municipal Integration
- **Tel Aviv Municipality**: Direct API partnership for enhanced data access
- **Traffic Management Systems**: Integration with city traffic control systems
- **Smart City Initiatives**: Participation in Tel Aviv's smart city projects
- **Digital Government Services**: Integration with city's digital service platform

### Transportation Partners
- **Public Transit**: Integration with buses, trains, and bike-sharing systems
- **Ride-Sharing**: Partnership with Uber, Lyft, and local ride-sharing services
- **Car Rental**: Integration with car rental companies for seamless parking
- **Taxi Services**: Direct booking integration for combined parking-taxi solutions

### Payment & Financial Services
- **Mobile Payment**: Integration with PayPal, Apple Pay, Google Pay
- **Banking Partners**: Direct integration with Israeli banks for parking payments
- **Corporate Expense**: Integration with expense management platforms
- **Parking Operators**: Direct billing partnerships with parking lot operators

### Technology Partners
- **Mapping Services**: Enhanced integration with Google Maps, Apple Maps
- **IoT Sensors**: Partnership with parking sensor manufacturers
- **AI/ML Platforms**: Advanced analytics and prediction capabilities
- **Cloud Services**: Enterprise-grade infrastructure partnerships

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