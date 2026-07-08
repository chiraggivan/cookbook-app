import { Alert } from "flowbite-react";

export default function Component({ message }) {
  return (
    <Alert color="info">
      <span>Message will come here : {message}</span>
    </Alert>
  );
}
