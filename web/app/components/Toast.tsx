import { ActionMessage } from "../types";

type ToastProps = {
  message: ActionMessage;
};

export default function Toast({ message }: ToastProps) {
  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
        message.type === "ok"
          ? "bg-emerald-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {message.text}
    </div>
  );
}
