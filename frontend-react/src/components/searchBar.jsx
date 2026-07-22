const SearchBar = ({ label, type = "text", value, onChange, placeholder, error, ...props }) => {
  return (
    <div className="w-full">
      {label && <label>{label}</label>}

      <input
        className="min-w-md max-w-md rounded-md px-2 border-gray-bg-red-600 placeholder:text-gray-300"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default SearchBar;
