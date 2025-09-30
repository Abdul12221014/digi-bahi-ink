import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pen, Eraser, RotateCcw, Check } from 'lucide-react';

interface PenCanvasProps {
  onRecognized: (text: string) => void;
  onClose: () => void;
}

export function PenCanvas({ onRecognized, onClose }: PenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [recognizing, setRecognizing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Configure drawing style
    ctx.strokeStyle = '#2d7a4a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
  }, []);

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
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const recognizeText = async () => {
    setRecognizing(true);
    
    // Simulate OCR recognition (in production, use TensorFlow.js or ML.js)
    setTimeout(() => {
      const mockText = 'Sale 1000 ' + new Date().toISOString().split('T')[0];
      onRecognized(mockText);
      toast.success('Handwriting recognized! (Demo mode)');
      setRecognizing(false);
      onClose();
    }, 1500);
  };

  return (
    <Card className="p-6 shadow-strong">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-ledger-header">Write Entry Details</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearCanvas}
              className="touch-friendly"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-64 border-2 border-primary/20 rounded-lg pen-canvas bg-ledger-bg"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <p className="text-sm text-muted-foreground text-center">
          Write transaction details: Type, Amount, Date (e.g., "Sale 1000 2025-09-30")
        </p>

        <div className="flex gap-3">
          <Button
            onClick={recognizeText}
            disabled={recognizing}
            className="flex-1 gradient-hero touch-friendly"
            size="lg"
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
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 touch-friendly"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
