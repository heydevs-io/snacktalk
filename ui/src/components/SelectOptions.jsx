import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from './Dropdown';

const SelectOptions = ({ options, value, onChange }) => {
  const text = value && options.find((opt) => opt.id === value).text;

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
    </Dropdown>
  );
};

SelectOptions.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

export default SelectOptions;
