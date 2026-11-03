const AlertToast = ({ message, success, yPosition = "bottom" }) => {
  return (
    <div
      className={`fixed ${yPosition === "top" ? `top-20` : `bottom-20`} left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-4 rounded-lg shadow-lg border-2 text-center
                  ${success === false ? `bg-red-200 border-red-600 px-4 py-3 text-red-600` : `bg-green-200 border-green-600 px-4 py-3 text-green-600`}`}
    >
      <span className="text-xs md:text-sm">{message}</span>
    </div>
  );
};

export default AlertToast;
