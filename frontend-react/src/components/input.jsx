const Input = ({ label, type = "text", value, onChange, placeholder, error, ...props }) => {
  return (
    <div>
      {label && <label>{label}</label>}

      <input type={type} value={value} onChange={onChange} placeholder={placeholder} {...props} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Input;
