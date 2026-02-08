import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Image, Package, Loader2, RotateCcw, Video, VideoOff } from 'lucide-react';

interface DetectedItem {
  name: string;
  quantity: number;
  confidence: number;
}

interface CameraSlot {
  id: number;
  label: string;
  isStreaming: boolean;
  capturedImage: string | null;
  isAnalyzing: boolean;
  detectedItems: DetectedItem[];
  totalItems: number;
  error: string | null;
  selectedDeviceId: string | null;
  stream: MediaStream | null;
}

const CAMERA_COUNT = 6;

const InventoryCamera: React.FC = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(CAMERA_COUNT).fill(null));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<CameraSlot[]>(
    Array.from({ length: CAMERA_COUNT }, (_, i) => ({
      id: i,
      label: `מצלמה ${i + 1}`,
      isStreaming: false,
      capturedImage: null,
      isAnalyzing: false,
      detectedItems: [],
      totalItems: 0,
      error: null,
      selectedDeviceId: null,
      stream: null,
    }))
  );

  const camerasRef = useRef(cameras);
  camerasRef.current = cameras;

  const updateCamera = useCallback((index: number, updates: Partial<CameraSlot>) => {
    setCameras(prev => prev.map((cam, i) => i === index ? { ...cam, ...updates } : cam));
  }, []);

  const startCameraSlot = useCallback(async (index: number, deviceId: string) => {
    try {
      updateCamera(index, { error: null });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
      });
      const videoEl = videoRefs.current[index];
      if (videoEl) {
        videoEl.srcObject = stream;
      }
      updateCamera(index, {
        isStreaming: true,
        stream,
        selectedDeviceId: deviceId,
        capturedImage: null,
        detectedItems: [],
        totalItems: 0
      });
    } catch (err) {
      console.error(`Camera ${index} error:`, err);
      updateCamera(index, { error: 'לא ניתן להפעיל מצלמה זו. ייתכן שהיא בשימוש.' });
    }
  }, [updateCamera]);

  const stopCameraSlot = useCallback((index: number) => {
    const cam = camerasRef.current[index];
    if (cam?.stream) {
      cam.stream.getTracks().forEach(t => t.stop());
    }
    const videoEl = videoRefs.current[index];
    if (videoEl) {
      videoEl.srcObject = null;
    }
    updateCamera(index, { isStreaming: false, stream: null });
  }, [updateCamera]);

  // Enumerate devices and auto-start first camera
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission to get device labels
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(t => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setAvailableDevices(videoDevices);

        // Auto-start first camera with first device
        if (videoDevices.length > 0) {
          updateCamera(0, { selectedDeviceId: videoDevices[0].deviceId });
          setTimeout(() => startCameraSlot(0, videoDevices[0].deviceId), 500);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getDevices();

    return () => {
      // Cleanup all streams on unmount
      camerasRef.current.forEach((cam, i) => {
        if (cam.stream) {
          cam.stream.getTracks().forEach(t => t.stop());
        }
      });
    };
  }, []);

  const analyzeImage = useCallback(async (index: number, imageData: string, retryCount = 0) => {
    updateCamera(index, { isAnalyzing: true, error: null, detectedItems: [], totalItems: 0 });

    const apiKey = localStorage.getItem('gemini_api_key') || 'AIzaSyCmjgmLdl61QkLhFgv7B4ENHhDS2nD6M9Y';
    // Always use the provided demo key if none is set
    if (!apiKey) {
      updateCamera(index, { error: 'מפתח API לא הוגדר. הגדר בהגדרות API.', isAnalyzing: false });
      return;
    }

    try {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `אתה מערכת ספירת מלאי חכמה למסעדה. נתח את התמונה וזהה את כל הפריטים/מוצרים שנראים בה.
עבור כל פריט: שם (בעברית), כמות, ביטחון (0-100).
ענה אך ורק בפורמט JSON:
{"items": [{"name": "פריט", "quantity": 5, "confidence": 85}], "total_items": 15}
אם אין פריטים: {"items": [], "total_items": 0}`
                },
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
              ]
            }]
          })
        }
      );

      // Handle rate limit with retry
      if (response.status === 429) {
        if (retryCount < 3) {
          const waitTime = (retryCount + 1) * 3000;
          updateCamera(index, { error: `ממתין ${(waitTime / 1000)} שניות (עומס API)...` });
          await new Promise(r => setTimeout(r, waitTime));
          return analyzeImage(index, imageData, retryCount + 1);
        } else {
          throw new Error('עומס על ה-API. נסה שוב בעוד דקה.');
        }
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        updateCamera(index, {
          detectedItems: parsed.items || [],
          totalItems: parsed.total_items || parsed.items?.length || 0,
          isAnalyzing: false,
          error: null
        });
      } else {
        updateCamera(index, { error: 'לא ניתן לנתח תשובה', isAnalyzing: false });
      }
    } catch (err: any) {
      console.error(`Analysis error cam ${index}:`, err);
      updateCamera(index, { error: err.message || 'שגיאה בניתוח', isAnalyzing: false });
    }
  }, [updateCamera]);

  const captureSlot = useCallback((index: number) => {
    const videoEl = videoRefs.current[index];
    if (!videoEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoEl, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      stopCameraSlot(index);
      updateCamera(index, { capturedImage: imageData });
      analyzeImage(index, imageData);
    }
  }, [stopCameraSlot, updateCamera, analyzeImage]);

  const resetSlot = useCallback((index: number) => {
    const cam = camerasRef.current[index];
    updateCamera(index, { capturedImage: null, detectedItems: [], totalItems: 0, error: null });
    if (cam.selectedDeviceId) {
      startCameraSlot(index, cam.selectedDeviceId);
    }
  }, [updateCamera, startCameraSlot]);

  const handleDeviceSelect = useCallback((index: number, deviceId: string) => {
    stopCameraSlot(index);
    updateCamera(index, { selectedDeviceId: deviceId, capturedImage: null, detectedItems: [], totalItems: 0, error: null });
    if (deviceId) {
      startCameraSlot(index, deviceId);
    }
  }, [stopCameraSlot, updateCamera, startCameraSlot]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-emerald-600" size={28} />
          הגדרות תיעוד מלאי
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Video size={16} />
          <span>{availableDevices.length} מצלמות זמינות במערכת</span>
        </div>
      </div>

      {/* 6 Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((cam, index) => (
          <div
            key={cam.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
              cam.isStreaming ? 'border-emerald-400' : 'border-transparent hover:border-gray-200'
            }`}
          >
            {/* Camera Header */}
            <div className={`px-3 py-2 flex justify-between items-center text-sm ${
              cam.isStreaming ? 'bg-emerald-600 text-white' : cam.capturedImage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              <div className="flex items-center gap-2">
                {cam.isStreaming ? <Video size={14} /> : <VideoOff size={14} />}
                <span className="font-semibold">{cam.label}</span>
                {index === 0 && !cam.isStreaming && !cam.capturedImage && (
                  <span className="text-xs opacity-70">(ראשית)</span>
                )}
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${
                cam.isStreaming ? 'bg-red-400 animate-pulse' : cam.capturedImage ? 'bg-blue-300' : 'bg-gray-400'
              }`} />
            </div>

            {/* Video / Image */}
            <div className="relative bg-gray-900 flex justify-center items-center" style={{ minHeight: '180px' }}>
              {!cam.isStreaming && !cam.capturedImage && (
                <div className="text-center text-gray-500 p-4">
                  <Camera size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">
                    {index === 0 ? 'נדלקת אוטומטית...' : 'בחר מצלמה מהרשימה'}
                  </p>
                </div>
              )}

              <video
                ref={el => { videoRefs.current[index] = el; }}
                autoPlay
                playsInline
                muted
                className="w-full object-cover"
                style={{ height: '180px', display: cam.isStreaming ? 'block' : 'none' }}
              />

              {cam.capturedImage && (
                <img src={cam.capturedImage} alt="captured" className="w-full object-cover" style={{ height: '180px' }} />
              )}

              {cam.isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white">
                  <Loader2 size={28} className="animate-spin mb-2" />
                  <p className="text-xs">מנתח עם AI...</p>
                </div>
              )}

              {/* Total items badge */}
              {cam.totalItems > 0 && !cam.isAnalyzing && (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  {cam.totalItems} פריטים
                </div>
              )}
            </div>

            {/* Device Selector */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <select
                className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                value={cam.selectedDeviceId || ''}
                onChange={(e) => handleDeviceSelect(index, e.target.value)}
              >
                <option value="">-- בחר מצלמה --</option>
                {availableDevices.map((device, di) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `מצלמה ${di + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Controls */}
            <div className="px-3 py-2 flex justify-center gap-2 flex-wrap">
              {cam.isStreaming && (
                <>
                  <button
                    onClick={() => captureSlot(index)}
                    className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-600 transition-colors shadow"
                  >
                    <Image size={14} />
                    צלם
                  </button>
                  <button
                    onClick={() => stopCameraSlot(index)}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-gray-600 transition-colors"
                  >
                    <X size={14} />
                    כבה
                  </button>
                </>
              )}

              {cam.capturedImage && !cam.isAnalyzing && (
                <button
                  onClick={() => resetSlot(index)}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-600 transition-colors"
                >
                  <RotateCcw size={14} />
                  צלם שוב
                </button>
              )}

              {!cam.isStreaming && !cam.capturedImage && cam.selectedDeviceId && (
                <button
                  onClick={() => startCameraSlot(index, cam.selectedDeviceId!)}
                  className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                >
                  <Camera size={14} />
                  הפעל
                </button>
              )}
            </div>

            {/* Error */}
            {cam.error && (
              <div className="px-3 py-2 bg-red-50 text-red-600 text-xs text-center border-t border-red-100">
                ⚠️ {cam.error}
              </div>
            )}

            {/* Detected Items */}
            {cam.detectedItems.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-100 max-h-40 overflow-y-auto">
                <div className="text-xs font-bold text-gray-700 mb-1">פריטים שנמצאו:</div>
                {cam.detectedItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      item.confidence >= 80 ? 'text-green-600' : item.confidence >= 50 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {item.confidence}%
                    </span>
                    <span className="text-gray-700">
                      <span className="font-bold text-emerald-600">{item.quantity}×</span>{' '}
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {cameras.some(c => c.detectedItems.length > 0) && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 p-4 text-center">
            <div className="text-4xl font-bold text-white">
              {cameras.reduce((sum, c) => sum + c.totalItems, 0)}
            </div>
            <div className="text-base text-emerald-100">סה"כ פריטים מכל המצלמות</div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package size={20} />
              סיכום כל המצלמות
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-2 text-right text-sm text-gray-500">מצלמה</th>
                    <th className="p-2 text-right text-sm text-gray-500">פריט</th>
                    <th className="p-2 text-center text-sm text-gray-500">כמות</th>
                    <th className="p-2 text-center text-sm text-gray-500">ביטחון</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras.flatMap((cam) =>
                    cam.detectedItems.map((item, i) => (
                      <tr key={`${cam.id}-${i}`} className="border-b border-gray-100">
                        <td className="p-2 text-gray-500 text-sm">{cam.label}</td>
                        <td className="p-2 text-gray-800 font-medium text-sm">{item.name}</td>
                        <td className="p-2 text-center text-emerald-600 font-bold">{item.quantity}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.confidence >= 80 ? 'bg-green-100 text-green-700'
                            : item.confidence >= 50 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>{item.confidence}%</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default InventoryCamera;
