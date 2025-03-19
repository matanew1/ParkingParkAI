import { MapPin } from 'lucide-react';
import ParkingMap from './components/ParkingMap';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">
                Tel Aviv Parking Map
              </h1>
              <p className="text-sm text-gray-500">
                Find available parking spots in the city
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <ParkingMap />
      </main>
    </div>
  );
}

export default App;
