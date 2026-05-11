const Select = ({ options, value, onChange, ...props }) => {
  return (
    <select value={value} onChange={onChange} {...props}>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
