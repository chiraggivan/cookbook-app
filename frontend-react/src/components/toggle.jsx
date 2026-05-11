const Toggle = ({ title, checked, onChange, onText = "On", offText = "Off", ...props }) => {
  return (
    <label>
      <span>{title && <div>{title}</div>}</span>
      <span>
        <input type="checkbox" checked={checked} onChange={onChange} {...props} />
        <span>{checked ? onText : offText}</span>
      </span>
    </label>
  );
};

export default Toggle;
