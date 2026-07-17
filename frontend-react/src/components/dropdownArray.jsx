const DropdownArray = ({
  title,
  options,
  value,
  onChange,
  placeholder = "Select",
  error,
  ...props
}) => {
  return (
    <div>
      {title && <label>{title}</label>}
      <select className="" value={value} onChange={onChange} {...props}>
        <option className="" value="">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option className="" key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm font-semibold px-2">{error} </p>}
    </div>
  );
};

export default DropdownArray;
