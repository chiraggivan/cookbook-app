const Dropdown = ({ options, value, onChange, placeholder = "Select", ...props }) => {
  return (
    <select value={value} onChange={onChange} {...props}>
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
