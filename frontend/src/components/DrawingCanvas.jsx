import React, { useRef, useEffect } from "react";

const DrawingCanvas = ({ socket, roomId, color, width }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const handleDraw = ({ x0, y0, x1, y1, color, width }) => {
      drawLine(ctx, x0, y0, x1, y1, color, width);
    };

    const handleClearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('draw-move', handleDraw);
    socket.on('clear-canvas', handleClearCanvas);

    socket.on('load-drawing-data', (drawingData) => {
      drawingData.forEach(({ x0, y0, x1, y1, color, width }) => {
        drawLine(ctx, x0, y0, x1, y1, color, width);
      });
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      socket.off('draw-move', handleDraw);
      socket.off('clear-canvas', handleClearCanvas);
      socket.off('load-drawing-data');
    };
  }, [socket]);

  const drawLine = (ctx, x0, y0, x1, y1, color, width) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    
    const newPosition = { x: e.clientX, y: e.clientY };
    socket.emit('draw-move', {
      roomId,
      x0: lastPositionRef.current.x,
      y0: lastPositionRef.current.y,
      x1: newPosition.x,
      y1: newPosition.y,
      color,
      width
    });
    drawLine(
      canvasRef.current.getContext('2d'),
      lastPositionRef.current.x,
      lastPositionRef.current.y,
      newPosition.x,
      newPosition.y,
      color,
      width
    );

    lastPositionRef.current = newPosition;
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="absolute top-0 left-0"
    />
  );
};

export default DrawingCanvas;