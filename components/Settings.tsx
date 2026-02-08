import React, { useState } from 'react';
import { Settings as SettingsIcon, Camera, Key, Save, Eye, EyeOff } from 'lucide-react';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [cameraUrl, setCameraUrl] = useState('');
  const [cameras, setCameras] = useState<string[]>([]);
  const [showCameras, setShowCameras] = useState(false);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey);
      alert('מפתח API נשמר בהצלחה!');
    }
  };

  const handleAddCamera = () => {
    if (cameraUrl.trim()) {
      const newCameras = [...cameras, cameraUrl];
      setCameras(newCameras);
      localStorage.setItem('cameras', JSON.stringify(newCameras));
      setCameraUrl('');
      alert('מצלמה נוספה בהצלחה!');
    }
  };

  const handleRemoveCamera = (index: number) => {
    const newCameras = cameras.filter((_, i) => i !== index);
    setCameras(newCameras);
    localStorage.setItem('cameras', JSON.stringify(newCameras));
  };

  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    const savedCameras = localStorage.getItem('cameras');
    if (savedCameras) {
      setCameras(JSON.parse(savedCameras));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <SettingsIcon className="text-blue-600" size={28} />
          הגדרות מערכת
        </h1>

        {/* API Settings Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Key className="text-indigo-600" size={24} />
            הגדרות API
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                מפתח Gemini API
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  placeholder="הזן מפתח API"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveApiKey}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              שמור מפתח API
            </button>
          </div>
        </div>

        {/* Cameras Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Camera className="text-green-600" size={24} />
            מצלמות
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={handleAddCamera}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                הוסף מצלמה
              </button>
              <input
                type="text"
                value={cameraUrl}
                onChange={(e) => setCameraUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                placeholder="הזן כתובת URL של מצלמה"
                dir="ltr"
              />
            </div>

            {cameras.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => setShowCameras(!showCameras)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showCameras ? 'הסתר' : 'הצג'} מצלמות ({cameras.length})
                  </button>
                </div>

                {showCameras && (
                  <div className="space-y-2">
                    {cameras.map((cam, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <button
                          onClick={() => handleRemoveCamera(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          הסר
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 text-sm" dir="ltr">{cam}</span>
                          <Camera size={16} className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2 text-right">מידע</h3>
        <ul className="text-sm text-blue-700 space-y-1 text-right" dir="rtl">
          <li>• מפתח API נדרש לשימוש בשירותי Gemini AI</li>
          <li>• ניתן להוסיף מספר מצלמות לניטור המסעדה</li>
          <li>• כל ההגדרות נשמרות באופן מקומי בדפדפן</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
