const AlertToast = ({ message, success }) => {
  return (
    <div
      className={`fixed bottom-20 left-[30%] sm:left-[35%] md:left-[40%] lg:left-[45%] z-50 flex items-center justify-center gap-4 rounded-lg shadow-lg ${success === false ? `bg-red-300 border border-red-700 px-4 py-3 text-red-700` : `bg-green-300 border border-green-700 px-4 py-3 text-green-700`}`}
    >
      <span className="text-xs md:text-sm">{message}</span>
    </div>
  );
};

export default AlertToast;
