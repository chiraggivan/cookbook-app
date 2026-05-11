const Modal = ({ isOpen, onClose, children, ...props }) => {
  if (!isOpen) return null;

  return (
    <div>
      <div onClick={onClose}></div>
      <div {...props}>{children}</div>
    </div>
  );
};

export default Modal;
