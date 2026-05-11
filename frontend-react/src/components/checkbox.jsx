const Checkbox = ({ label, checked, onChange, disabled = false, ...props }) => {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} {...props} />
      {label && <span>{label}</span>}
    </label>
  );
};

export default Checkbox;
