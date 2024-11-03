import React, { useState } from 'react';
import Grid from './Grid';
import FurnitureDropdown from './FurnitureDropdown';
import models from './models.json';
import './App.css';

function App() {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [roomWidth, setRoomWidth] = useState(500);
  const [roomHeight, setRoomHeight] = useState(500);
  const [furniturePositions, setFurniturePositions] = useState([]);
  
  const handleFurnitureSelect = (modelName) => {
    const furnitureData = models[modelName];
    if (furnitureData) {
      setSelectedFurniture({ model_name: modelName, ...furnitureData });
    }
  };

  const handleRoomDimensionChange = (dimension, value) => {
    if (dimension === 'width') {
      setRoomWidth(value);
    } else if (dimension === 'height') {
      setRoomHeight(value);
    }
  };

  const handleFurnitureAdd = (newFurniture) => {
    const updatedModels = { ...models };
    const { model_name, row, col } = newFurniture;

    updatedModels[model_name].placedPositions = { row, col };

    console.log(`Placed ${model_name} at row: ${row}, col: ${col}`);
    console.log(updatedModels);

    setFurniturePositions([...furniturePositions, newFurniture]);
  };

  const handleFurnitureMove = (id, newPosition) => {
    const updatedPositions = furniturePositions.map((furniture) =>
      furniture.id === id ? { ...furniture, ...newPosition } : furniture
    );

    setFurniturePositions(updatedPositions);

    const movedFurniture = updatedPositions.find(furniture => furniture.id === id);
    const { model_name, row, col, rotation } = movedFurniture;

    models[model_name].placedPositions = { row, col, rotation };

    console.log(`Moved/Rotated ${model_name} to row: ${row}, col: ${col}, rotation: ${rotation}`);
    console.log(models);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Furniture Planner</h2>
        <FurnitureDropdown models={models} onSelect={handleFurnitureSelect} />
      </div>
      <div className="main-content">
        <Grid 
          width={roomWidth} 
          height={roomHeight} 
          selectedFurniture={selectedFurniture}
          furniturePositions={furniturePositions}
          onFurnitureAdd={handleFurnitureAdd}
          onFurnitureMove={handleFurnitureMove}
        />
      </div>
      <div className="properties-panel">
        <h2>Properties</h2>
        <div className="room-dimensions">
          <p>Room Dimensions</p>
          <label>
            Width:
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => handleRoomDimensionChange('width', e.target.value)}
            />
            cm
          </label>
          <label>
            Height:
            <input
              type="number"
              value={roomHeight}
              onChange={(e) => handleRoomDimensionChange('height', e.target.value)}
            />
            cm
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;