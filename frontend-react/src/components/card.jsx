const Card = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export default Card;
