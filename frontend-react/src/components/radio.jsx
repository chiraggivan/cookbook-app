const Radio = ({ label, name, value, checked, onChange, disabled = false, ...props }) => {
  return (
    <label>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default Radio;
