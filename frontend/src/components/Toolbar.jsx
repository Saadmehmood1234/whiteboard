import React, { useState } from 'react';
import { FaEraser, FaPalette, FaBrush, FaChevronDown } from 'react-icons/fa';

const Toolbar = ({ socket, color, setColor, width, setWidth, roomId }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colors = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl z-10 p-2 flex flex-col gap-3 w-48">
      <div className="relative">
        <button 
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FaPalette className="text-gray-600" />
            <span className="text-sm font-medium">Color</span>
          </div>
          <FaChevronDown className={`text-xs transition-transform ${showColorPicker ? 'transform rotate-180' : ''}`} />
        </button>
        
        {showColorPicker && (
          <div className="absolute left-0 mt-1 p-3 bg-white rounded-lg shadow-lg w-full">
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setShowColorPicker(false);
                  }}
                  className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono">{color.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
      <div className="px-3 py-2 bg-gray-100 rounded-md">
        <div className="flex items-center gap-2 mb-1">
          <FaBrush className="text-gray-600" />
          <span className="text-sm font-medium">Brush Size</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs w-8 text-center font-mono bg-gray-200 px-1 py-0.5 rounded">
            {width}px
          </span>
        </div>
      </div>
      <button
        onClick={clearCanvas}
        className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        <FaEraser />
        <span className="text-sm font-medium">Clear Canvas</span>
      </button>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Preview:</span>
          <div className="flex items-center gap-1">
            <span>Size</span>
            <div 
              className="rounded-full bg-black"
              style={{ 
                width: `${width}px`, 
                height: `${width}px`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;