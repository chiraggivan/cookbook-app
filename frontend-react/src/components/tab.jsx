const Tab = ({ label, isActive, onClick, ...props }) => {
  return (
    <button onClick={onClick} {...props}>
      {label}
    </button>
  );
};

export default Tab;
