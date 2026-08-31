export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="mt-1.5 text-sm text-red-500" role="alert">
      {messages[0]}
    </p>
  );
}
