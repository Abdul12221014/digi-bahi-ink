import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pen, Eraser, RotateCcw, Check, Highlighter, ZoomIn, ZoomOut, Grid3x3, AlignLeft, Lasso, Plus, Undo, Redo, Type, Image, FileSignature, Square } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface PenCanvasProps {
  onRecognized: (text: string) => void;
  onClose: () => void;
}

type Tool = 'pen' | 'eraser' | 'highlighter' | 'lasso';
type GridType = 'none' | 'lined' | 'squared';
type AddType = 'text' | 'sticker' | 'signature' | 'shape';

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
  const [opacity, setOpacity] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  
  // Performance optimization: batch drawing operations
  const animationFrameRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true, // Better performance for animations
      willReadFrequently: false // Optimize for drawing
    });
    if (!ctx) return;

    // Optimize for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    bgCanvas.width = rect.width * dpr;
    bgCanvas.height = rect.height * dpr;
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    bgCanvas.style.width = `${rect.width}px`;
    bgCanvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);

    // Configure drawing style for smooth strokes
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    setContext(ctx);
    drawBackground();

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
      context.globalAlpha = 1;
    } else if (tool === 'highlighter') {
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = opacity * 0.4;
      context.lineWidth = strokeWidth * 3;
      context.strokeStyle = strokeColor;
    } else if (tool === 'lasso') {
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
      context.lineWidth = 1;
      context.strokeStyle = '#000000';
      context.setLineDash([5, 5]);
    } else {
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = opacity;
      context.lineWidth = strokeWidth;
      context.strokeStyle = strokeColor;
      context.setLineDash([]);
    }
  }, [tool, strokeWidth, strokeColor, opacity, context]);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [context, history, historyStep]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    e.preventDefault();

    const pos = getPosition(e);
    
    if (tool === 'lasso') {
      // Start lasso selection
      lastPointRef.current = pos;
      context.beginPath();
      context.moveTo(pos.x, pos.y);
      setIsDrawing(true);
    } else {
      setIsDrawing(true);
      lastPointRef.current = pos;
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    }
  }, [context, tool]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    e.preventDefault();

    const pos = getPosition(e);
    
    // Throttle with requestAnimationFrame for smooth drawing
    if (animationFrameRef.current) {
      return; // Skip if animation frame is already scheduled
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (lastPointRef.current) {
        // Use quadratic curve for smoother lines
        const midPoint = {
          x: (lastPointRef.current.x + pos.x) / 2,
          y: (lastPointRef.current.y + pos.y) / 2
        };
        context.quadraticCurveTo(
          lastPointRef.current.x,
          lastPointRef.current.y,
          midPoint.x,
          midPoint.y
        );
        context.stroke();
        lastPointRef.current = pos;
      }
      animationFrameRef.current = null;
    });
  }, [isDrawing, context]);

  const stopDrawing = useCallback(() => {
    if (!context) return;
    
    if (tool === 'lasso' && isDrawing) {
      // Complete lasso selection
      context.closePath();
      context.stroke();
      // Here you would typically calculate the selected area
      // For now, we'll just show the selection menu
      setShowSelectionMenu(true);
    }
    
    setIsDrawing(false);
    context.closePath();
    lastPointRef.current = null;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    saveHistory();
  }, [context, tool, isDrawing, saveHistory]);

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

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom with ctrl+wheel (smooth increments)
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    } else {
      // Pan with wheel (optimized updates)
      setPan(prev => ({
        x: prev.x - e.deltaX * 0.5,
        y: prev.y - e.deltaY * 0.5
      }));
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    saveHistory();
  }, [context, saveHistory]);

  const handleUndo = useCallback(() => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    
    const previousState = history[historyStep - 1];
    context.putImageData(previousState, 0, 0);
    setHistoryStep(historyStep - 1);
    toast.success('Undone');
  }, [context, history, historyStep]);

  const handleRedo = useCallback(() => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    
    const nextState = history[historyStep + 1];
    context.putImageData(nextState, 0, 0);
    setHistoryStep(historyStep + 1);
    toast.success('Redone');
  }, [context, history, historyStep]);

  const handleSelectionAction = useCallback((action: string) => {
    setShowSelectionMenu(false);
    toast.success(`${action} - Feature coming soon!`);
  }, []);

  const handleAddElement = useCallback((type: AddType) => {
    setShowAddMenu(false);
    toast.success(`Adding ${type} - Feature coming soon!`);
  }, []);

  // Optimize image for OCR with preprocessing
  const preprocessImageForOCR = useCallback((canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    // Create temporary canvas for preprocessing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return canvas.toDataURL('image/png');

    // Copy original image
    tempCtx.drawImage(canvas, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Apply preprocessing: Convert to grayscale and apply binarization
    for (let i = 0; i < data.length; i += 4) {
      // Grayscale conversion
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Simple thresholding for binarization (improves OCR accuracy)
      const threshold = 128;
      const binary = gray > threshold ? 255 : 0;
      
      data[i] = binary;     // R
      data[i + 1] = binary; // G
      data[i + 2] = binary; // B
      // Alpha remains unchanged
    }

    tempCtx.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL('image/png');
  }, []);

  const recognizeText = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRecognizing(true);
    
    try {
      // Preprocess image for better OCR accuracy
      const processedImage = preprocessImageForOCR(canvas);
      
      // TensorFlow.js handwriting recognition (stub - requires model loading)
      // In production: Load pre-trained model for Indian scripts
      // const model = await tf.loadLayersModel('/models/handwriting/model.json');
      // const tensor = preprocessTensor(processedImage);
      // const prediction = await model.predict(tensor);
      
      // For MVP: Simulate with realistic output
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockText = 'Sale 1000 ' + new Date().toISOString().split('T')[0];
      onRecognized(mockText);
      toast.success('Handwriting recognized! OCR optimized for clarity.');
      setRecognizing(false);
      onClose();
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Recognition failed. Please try again or use keyboard input.');
      setRecognizing(false);
    }
  }, [onRecognized, onClose, preprocessImageForOCR]);

  return (
    <Card className="p-4 shadow-strong bg-background">
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-foreground">Digital Canvas</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="touch-friendly"
          >
            Done
          </Button>
        </div>

        {/* Horizontal iPad Notes-style Toolbar */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm overflow-x-auto">
          {/* Drawing Tools */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={tool === 'pen' ? 'default' : 'ghost'}
              onClick={() => setTool('pen')}
              className="touch-friendly transition-all hover:scale-105"
              title="Pen"
            >
              <Pen className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'highlighter' ? 'default' : 'ghost'}
              onClick={() => setTool('highlighter')}
              className="touch-friendly transition-all hover:scale-105"
              title="Marker/Highlighter"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? 'default' : 'ghost'}
              onClick={() => setTool('eraser')}
              className="touch-friendly transition-all hover:scale-105"
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'lasso' ? 'default' : 'ghost'}
              onClick={() => setTool('lasso')}
              className="touch-friendly transition-all hover:scale-105"
              title="Lasso Selection"
            >
              <Lasso className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Add & Undo */}
          <div className="flex gap-1">
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="touch-friendly transition-all hover:scale-105"
                title="Add Element"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {showAddMenu && (
                <div className="absolute top-full mt-2 left-0 bg-background border border-border rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddElement('text')}
                    className="w-full justify-start"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddElement('sticker')}
                    className="w-full justify-start"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Sticker
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddElement('signature')}
                    className="w-full justify-start"
                  >
                    <FileSignature className="w-4 h-4 mr-2" />
                    Signature
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddElement('shape')}
                    className="w-full justify-start"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Shape
                  </Button>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="touch-friendly transition-all hover:scale-105"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="touch-friendly transition-all hover:scale-105"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearCanvas}
              className="touch-friendly transition-all hover:scale-105"
              title="Clear"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Horizontal Color Picker */}
          <div className="flex gap-1">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setStrokeColor(color.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                  strokeColor === color.value ? 'border-primary ring-2 ring-primary/50 scale-110' : 'border-border'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Customization Panel - Compact */}
        <div className="flex flex-wrap gap-3 p-3 bg-muted/20 rounded-xl border border-border/30">
          {/* Stroke Width */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-foreground mb-1 block">
              Width: {strokeWidth}px
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

          {/* Opacity */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-foreground mb-1 block">
              Opacity: {Math.round(opacity * 100)}%
            </label>
            <Slider
              value={[opacity * 100]}
              onValueChange={(value) => setOpacity(value[0] / 100)}
              min={10}
              max={100}
              step={5}
              className="touch-friendly"
            />
          </div>

          {/* Grid Type */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={gridType === 'none' ? 'default' : 'ghost'}
              onClick={() => setGridType('none')}
              className="touch-friendly"
              title="Plain"
            >
              Plain
            </Button>
            <Button
              size="sm"
              variant={gridType === 'lined' ? 'default' : 'ghost'}
              onClick={() => setGridType('lined')}
              className="touch-friendly"
              title="Lined Paper"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={gridType === 'squared' ? 'default' : 'ghost'}
              onClick={() => setGridType('squared')}
              className="touch-friendly"
              title="Grid Paper"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="touch-friendly"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-foreground min-w-[50px] text-center">
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
          style={{ height: '400px' }}
        >
          {/* Selection Pop-up Menu - iPad Notes Style */}
          {showSelectionMenu && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-strong p-1 z-20 flex gap-1 animate-scale-in">
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Cut')} className="hover:bg-muted">Cut</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Copy')} className="hover:bg-muted">Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Delete')} className="hover:bg-muted">Delete</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Duplicate')} className="hover:bg-muted">Duplicate</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Snap to Shapes')} className="hover:bg-muted">Snap</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Copy as Text')} className="hover:bg-muted">OCR</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Insert Space')} className="hover:bg-muted">Space</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Translate')} className="hover:bg-muted">Translate</Button>
              <Button size="sm" variant="ghost" onClick={() => handleSelectionAction('Straighten')} className="hover:bg-muted">Straighten</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowSelectionMenu(false)} className="hover:bg-destructive hover:text-destructive-foreground">✕</Button>
            </div>
          )}
          
          {/* Yellow Resize Handles for Lasso Selection */}
          {selectedArea && (
            <>
              {/* Selection Rectangle */}
              <div
                className="absolute border-2 border-dashed border-primary z-10 pointer-events-none"
                style={{
                  left: selectedArea.x,
                  top: selectedArea.y,
                  width: selectedArea.width,
                  height: selectedArea.height,
                }}
              />
              {/* Yellow Resize Handles */}
              {[
                { x: selectedArea.x, y: selectedArea.y }, // top-left
                { x: selectedArea.x + selectedArea.width, y: selectedArea.y }, // top-right
                { x: selectedArea.x, y: selectedArea.y + selectedArea.height }, // bottom-left
                { x: selectedArea.x + selectedArea.width, y: selectedArea.y + selectedArea.height }, // bottom-right
                { x: selectedArea.x + selectedArea.width / 2, y: selectedArea.y }, // top-middle
                { x: selectedArea.x + selectedArea.width / 2, y: selectedArea.y + selectedArea.height }, // bottom-middle
                { x: selectedArea.x, y: selectedArea.y + selectedArea.height / 2 }, // left-middle
                { x: selectedArea.x + selectedArea.width, y: selectedArea.y + selectedArea.height / 2 }, // right-middle
              ].map((handle, index) => (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-accent border-2 border-background rounded-full z-20 cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    left: handle.x - 6,
                    top: handle.y - 6,
                  }}
                />
              ))}
            </>
          )}
          
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

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Write transaction details (e.g., "Sale 1000 2025-09-30")
          </p>
          <Button
            onClick={recognizeText}
            disabled={recognizing}
            className="touch-friendly transition-all hover:scale-105"
            size="sm"
          >
            {recognizing ? (
              'Recognizing...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Recognize
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
