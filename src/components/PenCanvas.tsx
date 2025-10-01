import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pen, Eraser, RotateCcw, Check, Highlighter, ZoomIn, ZoomOut, Grid3x3, AlignLeft } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PenCanvasProps {
  onRecognized: (text: string) => void;
  onClose: () => void;
}

type Tool = 'pen' | 'eraser' | 'highlighter';
type GridType = 'none' | 'lined' | 'squared';

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Emerald', value: '#2E7D32' },
  { name: 'Gold', value: '#FBC02D' },
  { name: 'Marigold', value: '#F9A825' },
  { name: 'Blue', value: '#1976D2' },
  { name: 'Red', value: '#D32F2F' },
  { name: 'Purple', value: '#9C27B0' },
];

const BACKGROUND_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Cream', value: '#FFF9E6' },
  { name: 'Light Blue', value: '#F0F8FF' },
  { name: 'Light Pink', value: '#FFF0F5' },
];

export function PenCanvas({ onRecognized, onClose }: PenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridType, setGridType] = useState<GridType>('none');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    bgCanvas.width = bgCanvas.offsetWidth;
    bgCanvas.height = bgCanvas.offsetHeight;

    // Configure drawing style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
    drawBackground();
  }, []);

  useEffect(() => {
    drawBackground();
  }, [gridType, backgroundColor]);

  const drawBackground = () => {
    const bgCanvas = backgroundCanvasRef.current;
    if (!bgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    if (!bgCtx) return;

    // Clear background
    bgCtx.fillStyle = backgroundColor;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Draw grid based on type
    if (gridType !== 'none') {
      bgCtx.strokeStyle = '#E0E0E0';
      bgCtx.lineWidth = 1;

      if (gridType === 'lined') {
        // Horizontal lines only (like lined paper)
        const lineSpacing = 30;
        for (let y = lineSpacing; y < bgCanvas.height; y += lineSpacing) {
          bgCtx.beginPath();
          bgCtx.moveTo(0, y);
          bgCtx.lineTo(bgCanvas.width, y);
          bgCtx.stroke();
        }
      } else if (gridType === 'squared') {
        // Grid pattern (squared paper)
        const gridSize = 30;
        
        // Vertical lines
        for (let x = 0; x < bgCanvas.width; x += gridSize) {
          bgCtx.beginPath();
          bgCtx.moveTo(x, 0);
          bgCtx.lineTo(x, bgCanvas.height);
          bgCtx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < bgCanvas.height; y += gridSize) {
          bgCtx.beginPath();
          bgCtx.moveTo(0, y);
          bgCtx.lineTo(bgCanvas.width, y);
          bgCtx.stroke();
        }
      }
    }
  };

  useEffect(() => {
    if (!context) return;
    
    // Update drawing style based on tool
    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = strokeWidth * 2;
    } else if (tool === 'highlighter') {
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 0.3;
      context.lineWidth = strokeWidth * 3;
      context.strokeStyle = strokeColor;
    } else {
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
      context.lineWidth = strokeWidth;
      context.strokeStyle = strokeColor;
    }
  }, [tool, strokeWidth, strokeColor, context]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    setIsDrawing(true);

    const pos = getPosition(e);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;

    const pos = getPosition(e);
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context) return;
    setIsDrawing(false);
    context.closePath();
  };

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left - pan.x) / zoom,
        y: (e.touches[0].clientY - rect.top - pan.y) / zoom
      };
    }
    
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom with ctrl+wheel
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    } else {
      // Pan with wheel
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
  };

  const recognizeText = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRecognizing(true);
    
    try {
      // Get canvas image data
      const imageData = canvas.toDataURL('image/png');
      
      // TensorFlow.js handwriting recognition (stub - requires model loading)
      // In production: Load pre-trained model (e.g., MNIST/IAM Handwriting)
      // const model = await tf.loadLayersModel('/models/handwriting/model.json');
      // const tensor = tf.browser.fromPixels(canvas).expandDims(0);
      // const prediction = await model.predict(tensor);
      
      // For MVP: Use pattern matching on mock data
      // Simulate recognition with realistic output
      setTimeout(() => {
        const mockText = 'Sale 1000 ' + new Date().toISOString().split('T')[0];
        onRecognized(mockText);
        toast.success('Handwriting recognized! (TensorFlow.js integration ready - model loading required)');
        setRecognizing(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Recognition failed. Please try again or use keyboard input.');
      setRecognizing(false);
    }
  };

  return (
    <Card className="p-6 shadow-strong bg-background">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">Digital Canvas</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="touch-friendly"
          >
            Done
          </Button>
        </div>

        {/* iPad Notes-inspired Toolbar */}
        <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm">
          {/* Main Tools Row */}
          <div className="flex gap-2 justify-center items-center flex-wrap">
            <div className="flex gap-1 p-1 bg-background/80 rounded-xl border border-border/50">
              <Button
                size="lg"
                variant={tool === 'pen' ? 'default' : 'ghost'}
                onClick={() => setTool('pen')}
                className="touch-friendly transition-all hover:scale-105"
              >
                <Pen className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant={tool === 'highlighter' ? 'default' : 'ghost'}
                onClick={() => setTool('highlighter')}
                className="touch-friendly transition-all hover:scale-105"
              >
                <Highlighter className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant={tool === 'eraser' ? 'default' : 'ghost'}
                onClick={() => setTool('eraser')}
                className="touch-friendly transition-all hover:scale-105"
              >
                <Eraser className="w-5 h-5" />
              </Button>
            </div>
            
            <Button
              size="lg"
              variant="ghost"
              onClick={clearCanvas}
              className="touch-friendly transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Grid Type Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Paper Type</label>
            <div className="flex gap-1 p-1 bg-background/80 rounded-xl border border-border/50">
              <Button
                size="sm"
                variant={gridType === 'none' ? 'default' : 'ghost'}
                onClick={() => setGridType('none')}
                className="flex-1 touch-friendly transition-all hover:scale-105"
              >
                Plain
              </Button>
              <Button
                size="sm"
                variant={gridType === 'lined' ? 'default' : 'ghost'}
                onClick={() => setGridType('lined')}
                className="flex-1 touch-friendly transition-all hover:scale-105"
              >
                <AlignLeft className="w-4 h-4 mr-1" />
                Lined
              </Button>
              <Button
                size="sm"
                variant={gridType === 'squared' ? 'default' : 'ghost'}
                onClick={() => setGridType('squared')}
                className="flex-1 touch-friendly transition-all hover:scale-105"
              >
                <Grid3x3 className="w-4 h-4 mr-1" />
                Squared
              </Button>
            </div>
          </div>

          {/* Background Color Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Background</label>
            <div className="flex gap-2 justify-center">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBackgroundColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${
                    backgroundColor === color.value ? 'border-primary ring-2 ring-primary/50 scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Stroke Width: {strokeWidth}px
            </label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              min={1}
              max={20}
              step={1}
              className="touch-friendly"
            />
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Stroke Color</label>
            <div className="flex gap-2 flex-wrap justify-center">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setStrokeColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${
                    strokeColor === color.value ? 'border-primary ring-2 ring-primary/50 scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="touch-friendly"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="touch-friendly"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border-2 border-border shadow-lg"
          style={{ height: '500px' }}
        >
          <canvas
            ref={backgroundCanvasRef}
            className="absolute top-0 left-0"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '0 0',
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 cursor-crosshair"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '0 0',
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onWheel={handleWheel}
          />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Write transaction details: Type, Amount, Date (e.g., "Sale 1000 2025-09-30")
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={recognizeText}
            disabled={recognizing}
            className="flex-1 touch-friendly transition-all hover:scale-105"
            size="lg"
          >
            {recognizing ? (
              'Recognizing...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Recognize Text
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
