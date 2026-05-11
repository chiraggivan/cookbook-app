const Table = ({ children, ...props }) => {
  return <table {...props}>{children}</table>;
};

export default Table;
