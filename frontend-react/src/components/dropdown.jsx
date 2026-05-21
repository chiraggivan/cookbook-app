const Dropdown = ({ title, options, value, onChange, placeholder = "Select", error, ...props }) => {
  return (
    <div>
      {title && <label>{title}</label>}
      <select value={value} onChange={onChange} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.unit_id}>
            {option.unit_name}
          </option>
        ))}
      </select>
      {error && <p style={{ color: "red" }}>{error} </p>}
    </div>
  );
};

export default Dropdown;
