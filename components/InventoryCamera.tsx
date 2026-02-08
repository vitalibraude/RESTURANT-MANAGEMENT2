import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Image, Package, Loader2, RotateCcw } from 'lucide-react';

interface DetectedItem {
  name: string;
  quantity: number;
  confidence: number;
}

const InventoryCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('לא ניתן לגשת למצלמה. אנא אשר הרשאות מצלמה.');
      console.error('Camera error:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 300);
  }, [stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      analyzeImage(imageData);
    }
  }, [stopCamera]);

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    setDetectedItems([]);
    setTotalItems(0);

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setError('מפתח API של Gemini לא הוגדר. אנא הגדר אותו בהגדרות API.');
      setIsAnalyzing(false);
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

עבור כל פריט שזוהה, ספק:
1. שם הפריט (בעברית)
2. כמות משוערת
3. רמת ביטחון (0-100)

ענה **אך ורק** בפורמט JSON הבא, ללא טקסט נוסף:
{
  "items": [
    {"name": "שם הפריט", "quantity": 5, "confidence": 85}
  ],
  "total_items": 15
}

אם לא זוהו פריטים, החזר:
{"items": [], "total_items": 0}`
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setDetectedItems(parsed.items || []);
        setTotalItems(parsed.total_items || parsed.items?.length || 0);
      } else {
        setError('לא ניתן לנתח את התשובה מה-API');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      if (err.message.includes('400')) {
        setError('שגיאה ב-API. ודא שמפתח ה-API תקין.');
      } else if (err.message.includes('403')) {
        setError('מפתח ה-API לא תקין או לא מורשה.');
      } else {
        setError(`שגיאה בניתוח התמונה: ${err.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setDetectedItems([]);
    setTotalItems(0);
    setError(null);
    startCamera();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-emerald-600" size={28} />
          הגדרות תיעוד מלאי
        </h1>
      </div>

      {/* Camera Area */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative w-full bg-gray-900 flex justify-center items-center" style={{ minHeight: '350px' }}>
          {!isStreaming && !capturedImage && (
            <div className="text-center text-gray-400 p-10">
              <Camera size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-1">המצלמה כבויה</p>
              <p className="text-sm">לחץ על "הפעל מצלמה" כדי להתחיל</p>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full object-contain"
            style={{ maxHeight: '500px', display: isStreaming ? 'block' : 'none' }}
          />

          {capturedImage && (
            <img src={capturedImage} alt="captured" className="w-full object-contain" style={{ maxHeight: '500px' }} />
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="text-lg">מנתח תמונה עם AI...</p>
              <p className="text-sm text-gray-300 mt-2">סופר פריטים במלאי</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex justify-center gap-3 flex-wrap bg-gray-50">
          {!isStreaming && !capturedImage && (
            <button onClick={startCamera} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-base flex items-center gap-2 hover:bg-emerald-700 transition-colors">
              <Camera size={20} />
              הפעל מצלמה
            </button>
          )}

          {isStreaming && (
            <>
              <button onClick={capturePhoto} className="px-8 py-3 bg-red-500 text-white border-4 border-white rounded-full font-bold text-lg flex items-center gap-2 shadow-lg hover:bg-red-600 transition-colors">
                <Image size={22} />
                צלם
              </button>
              <button onClick={switchCamera} className="px-5 py-3 bg-gray-600 text-white rounded-xl text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors">
                <RotateCcw size={18} />
                החלף מצלמה
              </button>
              <button onClick={stopCamera} className="px-5 py-3 bg-gray-600 text-white rounded-xl text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors">
                <X size={18} />
                כבה מצלמה
              </button>
            </>
          )}

          {capturedImage && !isAnalyzing && (
            <button onClick={resetCapture} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-base flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Camera size={20} />
              צלם שוב
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {detectedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Total Count */}
          <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 p-6 text-center">
            <div className="text-5xl font-bold text-white">{totalItems}</div>
            <div className="text-lg text-emerald-100 mt-1">סה"כ פריטים שזוהו</div>
          </div>

          {/* Items Table */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package size={20} />
              פירוט פריטים
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-3 text-right text-sm text-gray-500">#</th>
                    <th className="p-3 text-right text-sm text-gray-500">פריט</th>
                    <th className="p-3 text-center text-sm text-gray-500">כמות</th>
                    <th className="p-3 text-center text-sm text-gray-500">ביטחון</th>
                  </tr>
                </thead>
                <tbody>
                  {detectedItems.map((item, index) => (
                    <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="p-3 text-gray-400 text-sm">{index + 1}</td>
                      <td className="p-3 text-gray-800 font-medium">{item.name}</td>
                      <td className="p-3 text-center text-emerald-600 font-bold text-lg">{item.quantity}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.confidence >= 80
                            ? 'bg-green-100 text-green-700'
                            : item.confidence >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
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
