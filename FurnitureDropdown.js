// FurnitureDropdown.js
import React, { useState } from 'react';
import './FurnitureDropdown.css';

const FurnitureDropdown = ({ models, onSelect }) => {
  const [searchText, setSearchText] = useState('');

  const filteredModels = Object.keys(models).filter((modelName) =>
    modelName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="furniture-dropdown">
      <input
        type="text"
        placeholder="Search furniture..."
        value={searchText}
        onChange={handleSearchChange}
      />
      <div className="furniture-list">
        {filteredModels.map((modelName, index) => (
          <div
            key={index}
            className="furniture-item"
            onClick={() => onSelect(modelName)}
          >
            <img
              src={models[modelName].model_picture}
              alt={modelName}
              className="furniture-image"
            />
            <p>{modelName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FurnitureDropdown;