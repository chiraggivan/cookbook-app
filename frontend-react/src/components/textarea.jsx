const Textarea = ({ label, value, onChange, placeholder = "", rows = 4, ...props }) => {
  return (
    <label>
      {label && <div>{label}</div>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        {...props}
      />
    </label>
  );
};

export default Textarea;
