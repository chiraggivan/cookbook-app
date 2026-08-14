const Dropdown = ({
  title,
  options,
  value,
  optionValueText,
  optionText,
  onChange,
  placeholder = "Select",
  error,
  ...props
}) => {
  return (
    <div>
      {title && <label>{title}</label>}
      <select value={value} onChange={onChange} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option[optionText]}>
            {option[optionText]}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm font-semibold px-2">{error} </p>}
    </div>
  );
};

export default Dropdown;
