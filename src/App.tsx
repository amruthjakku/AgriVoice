import { useState } from 'react';
import { Sprout, BarChart3, Home } from 'lucide-react';
import { VoiceWidget } from './components/VoiceWidget';
import { AdminDashboard } from './components/AdminDashboard';

type View = 'home' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AgriVoice</h1>
                <p className="text-xs text-gray-500">Voice-First Farm Advisor</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  currentView === 'home'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Voice Assistant</span>
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  currentView === 'dashboard'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {currentView === 'home' ? (
          <div className="py-12 px-4">
            <div className="max-w-7xl mx-auto mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                Ask farming questions in your language
              </h2>
              <p className="text-gray-600 text-lg">
                Get instant voice answers on crops, pests, weather, irrigation, and more
              </p>
            </div>
            <VoiceWidget />

            <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Sprout className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Crop Advisory</h3>
                <p className="text-sm text-gray-600">
                  Get expert advice on planting, fertilizers, and crop management
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Pest Control</h3>
                <p className="text-sm text-gray-600">
                  Identify pests and diseases, get treatment recommendations
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Weather & Market</h3>
                <p className="text-sm text-gray-600">
                  Weather forecasts, market prices, and best selling times
                </p>
              </div>
            </div>
          </div>
        ) : (
          <AdminDashboard />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>AgriVoice MVP - Voice-first farm advisor supporting Hindi, Telugu, and English</p>
            <p className="mt-1">Built for farmers and agricultural extension services</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
