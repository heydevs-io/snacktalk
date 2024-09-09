import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from './Dropdown';

const SelectOptions = ({ name, options, value, onChange }) => {
  const text = value && options.filter((opt) => opt.id === value)[0].text;

  return (
    <Dropdown
      target={
        <button type="button" className="select-bar-dp-target">
          {text ?? 'Select'}
        </button>
      }
    >
      <div className="dropdown-list">
        {options.map((option) => (
          <div className="dropdown-item" key={option.id} onClick={() => onChange?.(option.id)}>
            {option.text}
          </div>
        ))}
      </div>
    </Dropdown >
  );
};

SelectOptions.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

export default SelectOptions;
