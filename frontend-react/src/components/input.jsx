const Input = ({ label, type = "text", value, onChange, placeholder, error, ...props }) => {
  return (
    <div className="w-full">
      {label && <label>{label}</label>}

      <input type={type} value={value} onChange={onChange} placeholder={placeholder} {...props} />
      {error && <p className="text-red-500 text-sm font-semibold pl-1">{error}</p>}
    </div>
  );
};

export default Input;
