import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { FlipHorizontal } from 'lucide-react';
import './grid.css';

const Grid = ({ width, height, selectedFurniture, furniturePositions, onFurnitureAdd, onFurnitureMove, showGrid }) => {
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
      flipped: false,
    };

    onFurnitureAdd(newFurniture);
  };

  const isAreaOccupied = (startRow, startCol, width, height, excludeId = null) => {
    return furniturePositions.some(furniture => {
      if (furniture.id === excludeId) return false;

      const furnitureEndRow = furniture.row + furniture.height;
      const furnitureEndCol = furniture.col + furniture.width;
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

    if (
      newRow < 0 ||
      newCol < 0 ||
      newRow + furniture.height > rows ||
      newCol + furniture.width > columns ||
      isAreaOccupied(newRow, newCol, furniture.width, furniture.height, furnitureId)
    ) {
      return; // Prevent the move if it's invalid
    }

    onFurnitureMove(furnitureId, { row: newRow, col: newCol });
  };

  const handleFlip = (furnitureId) => {
    const furniture = furniturePositions.find(f => f.id === furnitureId);
    const newFlipped = !furniture.flipped;

    onFurnitureMove(furnitureId, { flipped: newFlipped });
  };

  return (
    <div 
      className="grid-container"
      style={{ 
        width: `${columns * 50}px`, 
        height: `${rows * 50}px`,
      }}
    >
      {showGrid && (
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
      )}
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
              position: 'absolute',
              zIndex: 10,
              cursor: 'move',
            }}
          >
            <img
              src={furniture.model_picture}
              alt={furniture.model_name}
              className="furniture-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: furniture.flipped ? 'scaleX(-1)' : 'none',
              }}
            />
            <button
              className="flip-button"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip(furniture.id);
              }}
            >
              <FlipHorizontal size={16} />
            </button>
          </div>
        </Draggable>
      ))}
    </div>
  );
};

export default Grid;
