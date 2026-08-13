const Toggle = ({ title, checked, onChange, onText = "On", offText = "Off", ...props }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {title && <span>{title}</span>}

      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />

        {/* Track */}
        <div
          className="
            w-12 h-6
            rounded-full
            bg-gray-300
            peer-checked:bg-app-primary
            transition-colors duration-300
          "
        />

        {/* Sliding circle */}
        <div
          className="
            absolute top-0.5 left-0.5
            w-5 h-5
            bg-white rounded-full shadow
            transition-transform duration-300
            peer-checked:translate-x-6
          "
        />
      </div>

      {/* <span>{checked ? onText : offText}</span> */}
    </label>
  );
};

export default Toggle;
