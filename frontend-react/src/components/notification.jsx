const Notification = ({ message, type = "info", onClose, ...props }) => {
  return (
    <div {...props}>
      <span>{message}</span>
      {onClose && <button onClick={onClose}>×</button>}
    </div>
  );
};

export default Notification;
