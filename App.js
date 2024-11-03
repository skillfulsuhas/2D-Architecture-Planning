import React, { useState, useEffect } from 'react';
import Grid from './Grid';
import FurnitureDropdown from './FurnitureDropdown';
import Tutorial from './Tutorial';
import Toolbar from './Toolbar';
import models from './models.json';
import './App.css';

export default function App() {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [roomWidth, setRoomWidth] = useState(900);
  const [roomHeight, setRoomHeight] = useState(900);
  const [furniturePositions, setFurniturePositions] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [unit, setUnit] = useState('cm');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const tutorialShown = localStorage.getItem('tutorialShown');
    if (tutorialShown) {
      setShowTutorial(false);
    }
  }, []);

  const handleFurnitureSelect = (modelName) => {
    const furnitureData = models[modelName];
    if (furnitureData) {
      setSelectedFurniture({
        model_name: modelName,
        ...furnitureData
      });
    }
  };

  const handleRoomDimensionChange = (dimension, value) => {
    if (dimension === 'width') {
      setRoomWidth(value);
    } else if (dimension === 'height') {
      setRoomHeight(value);
    }
    addToHistory();
  };

  const handleFurnitureAdd = (newFurniture) => {
    const updatedModels = { ...models };
    const { model_name, row, col } = newFurniture;
    updatedModels[model_name].placedPositions = {
      row: row + 1,
      col: col + 1
    };
    setFurniturePositions([...furniturePositions, newFurniture]);
    addToHistory();
  };

  const handleFurnitureMove = (id, newPosition) => {
    const updatedPositions = furniturePositions.map((furniture) =>
      furniture.id === id ? { ...furniture, ...newPosition } : furniture
    );
    setFurniturePositions(updatedPositions);

    const movedFurniture = updatedPositions.find(furniture => furniture.id === id);
    const { model_name, row, col, flipped } = movedFurniture;
    models[model_name].placedPositions = {
      row: row + 1,
      col: col + 1,
      flipped
    };
    addToHistory();
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialShown', 'true');
  };

  const addToHistory = () => {
    const newState = {
      furniturePositions,
      roomWidth,
      roomHeight
    };
    setHistory([...history.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(historyIndex + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setFurniturePositions(previousState.furniturePositions);
      setRoomWidth(previousState.roomWidth);
      setRoomHeight(previousState.roomHeight);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setFurniturePositions(nextState.furniturePositions);
      setRoomWidth(nextState.roomWidth);
      setRoomHeight(nextState.roomHeight);
    }
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const toggleUnit = () => {
    setUnit(unit === 'cm' ? 'inches' : 'cm');
  };

  const saveLayout = () => {
    const layout = {
      furniturePositions,
      roomWidth,
      roomHeight
    };
    localStorage.setItem('savedLayout', JSON.stringify(layout));
    alert('Layout saved successfully!');
  };

  const loadLayout = () => {
    const savedLayout = localStorage.getItem('savedLayout');
    if (savedLayout) {
      const layout = JSON.parse(savedLayout);
      setFurniturePositions(layout.furniturePositions);
      setRoomWidth(layout.roomWidth);
      setRoomHeight(layout.roomHeight);
      addToHistory();
    } else {
      alert('No saved layout found.');
    }
  };

  const exportLayout = () => {
    const layout = {
      furniturePositions,
      roomWidth,
      roomHeight
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "furniture_layout.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="app-wrapper">
      {showTutorial && <Tutorial onClose={closeTutorial} />}
      <Toolbar
        onUndo={undo}
        onRedo={redo}
        onSave={saveLayout}
        onLoad={loadLayout}
        onExport={exportLayout}
        onToggleGrid={toggleGrid}
        onToggleUnit={toggleUnit}
        showGrid={showGrid}
        unit={unit}
      />
      <div className="app-container">
        <aside className="sidebar">
          <h2 className="sidebar-title">Furniture Planner</h2>
          <FurnitureDropdown models={models} onSelect={handleFurnitureSelect} />
        </aside>
        
        <main className="main-content">
          <Grid
            width={roomWidth}
            height={roomHeight}
            selectedFurniture={selectedFurniture}
            furniturePositions={furniturePositions}
            onFurnitureAdd={handleFurnitureAdd}
            onFurnitureMove={handleFurnitureMove}
            showGrid={showGrid}
          />
        </main>
        
        <aside className="properties-panel">
          <h2 className="panel-title">Properties</h2>
          <div className="room-dimensions">
            <h3 className="dimensions-title">Room Dimensions</h3>
            <div className="dimension-input">
              <label htmlFor="width">Width:</label>
              <div className="input-group">
                <input
                  id="width"
                  type="number"
                  value={unit === 'cm' ? roomWidth : Math.round(roomWidth / 2.54)}
                  onChange={(e) => handleRoomDimensionChange('width', unit === 'cm' ? parseInt(e.target.value) : Math.round(parseInt(e.target.value) * 2.54))}
                  min="200"
                  max="2000"
                />
                <span className="unit">{unit}</span>
              </div>
            </div>
            <div className="dimension-input">
              <label htmlFor="height">Height:</label>
              <div className="input-group">
                <input
                  id="height"
                  type="number"
                  value={unit === 'cm' ? roomHeight : Math.round(roomHeight / 2.54)}
                  onChange={(e) => handleRoomDimensionChange('height', unit === 'cm' ? parseInt(e.target.value) : Math.round(parseInt(e.target.value) * 2.54))}
                  min="200"
                  max="2000"
                />
                <span className="unit">{unit}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}