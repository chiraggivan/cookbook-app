const UndoToast = ({ onUndo, onClose, message }) => {
  return (
    <div className="fixed bottom-5 left-2.5 z-50 flex items-center gap-4 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
      <span className="text-xs md:text-sm">{message}</span>

      <button
        onClick={onUndo}
        className="text-xs md:text-sm font-semibold text-blue-400 hover:text-blue-300"
      >
        Undo
      </button>

      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
};

export default UndoToast;
