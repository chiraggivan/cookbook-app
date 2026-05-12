const Textarea = ({ title, value, onChange, placeholder = "", rows = 4, ...props }) => {
  return (
    <div>
      {title && <label>{title}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        {...props}
      />
    </div>
  );
};

export default Textarea;
