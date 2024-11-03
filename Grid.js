import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { RotateCw } from 'lucide-react';
import './grid.css';

const Grid = ({ width, height, selectedFurniture, furniturePositions, onFurnitureAdd, onFurnitureMove }) => {
  const [rows, setRows] = useState(Math.floor(height / 50));
  const [columns, setColumns] = useState(Math.floor(width / 50));

  useEffect(() => {
    const newRows = Math.floor(height / 50);
    const newColumns = Math.floor(width / 50);
    
    setRows(newRows);
    setColumns(newColumns);
  }, [width, height]);

  const handleCellClick = (startRow, startCol) => {
    if (!selectedFurniture) return;

    const { model_name, model_size, model_picture } = selectedFurniture;
    const [furnitureWidth, furnitureHeight] = model_size;

    if (startRow + furnitureHeight > rows || startCol + furnitureWidth > columns) {
      alert("This item can't be placed here as it exceeds grid bounds.");
      return;
    }

    if (isAreaOccupied(startRow, startCol, furnitureWidth, furnitureHeight)) {
      alert("Some of these cells are already occupied!");
      return;
    }

    const newFurniture = {
      id: Date.now(),
      model_name,
      model_picture,
      row: startRow,
      col: startCol,
      width: furnitureWidth,
      height: furnitureHeight,
      rotation: 0, // Add initial rotation
    };

    onFurnitureAdd(newFurniture);
  };

  const isAreaOccupied = (startRow, startCol, width, height) => {
    return furniturePositions.some(furniture => {
      const furnitureEndRow = furniture.row + (furniture.rotation % 180 === 0 ? furniture.height : furniture.width);
      const furnitureEndCol = furniture.col + (furniture.rotation % 180 === 0 ? furniture.width : furniture.height);
      const newFurnitureEndRow = startRow + height;
      const newFurnitureEndCol = startCol + width;

      return (
        startRow < furnitureEndRow &&
        newFurnitureEndRow > furniture.row &&
        startCol < furnitureEndCol &&
        newFurnitureEndCol > furniture.col
      );
    });
  };

  const handleDragStop = (furnitureId, e, data) => {
    const newRow = Math.round(data.y / 50);
    const newCol = Math.round(data.x / 50);
    const furniture = furniturePositions.find(f => f.id === furnitureId);

    const rotatedWidth = furniture.rotation % 180 === 0 ? furniture.width : furniture.height;
    const rotatedHeight = furniture.rotation % 180 === 0 ? furniture.height : furniture.width;

    if (
      newRow < 0 ||
      newCol < 0 ||
      newRow + rotatedHeight > rows ||
      newCol + rotatedWidth > columns ||
      isAreaOccupied(newRow, newCol, rotatedWidth, rotatedHeight)
    ) {
      return; // Prevent the move if it's invalid
    }

    onFurnitureMove(furnitureId, { row: newRow, col: newCol });
  };

  const handleRotate = (furnitureId) => {
    const furniture = furniturePositions.find(f => f.id === furnitureId);
    const newRotation = (furniture.rotation + 90) % 360;

    const rotatedWidth = newRotation % 180 === 0 ? furniture.width : furniture.height;
    const rotatedHeight = newRotation % 180 === 0 ? furniture.height : furniture.width;

    if (
      furniture.row + rotatedHeight > rows ||
      furniture.col + rotatedWidth > columns ||
      isAreaOccupied(furniture.row, furniture.col, rotatedWidth, rotatedHeight)
    ) {
      alert("Can't rotate here due to space constraints.");
      return;
    }

    onFurnitureMove(furnitureId, { rotation: newRotation });
  };

  return (
    <div 
      className="grid-container"
      style={{ 
        width: `${columns * 50}px`, 
        height: `${rows * 50}px`,
      }}
    >
      <div 
        className="grid"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 50px)`,
          gridTemplateRows: `repeat(${rows}, 50px)`,
        }}
      >
        {Array.from({ length: rows * columns }).map((_, index) => {
          const rowIndex = Math.floor(index / columns);
          const colIndex = index % columns;
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="grid-cell"
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          );
        })}
      </div>
      {furniturePositions.map((furniture) => (
        <Draggable
          key={furniture.id}
          bounds="parent"
          grid={[50, 50]}
          position={{ x: furniture.col * 50, y: furniture.row * 50 }}
          onStop={(e, data) => handleDragStop(furniture.id, e, data)}
        >
          <div
            className="furniture-item"
            style={{
              width: furniture.width * 50,
              height: furniture.height * 50,
              transform: `rotate(${furniture.rotation}deg)`,
              backgroundImage: `url(${furniture.model_picture})`,
              backgroundSize: 'cover',
              position: 'absolute',
              zIndex: 10,
              cursor: 'move',
            }}
          >
            <button
              className="rotate-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRotate(furniture.id);
              }}
            >
              <RotateCw size={16} />
            </button>
          </div>
        </Draggable>
      ))}
    </div>
  );
};

export default Grid;