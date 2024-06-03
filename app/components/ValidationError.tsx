const ValidationError = ({
  errorMessage,
}: {
  errorMessage: string | undefined;
}) => {
  return <p className="mt-2 text-red-500">{errorMessage}</p>;
};

export default ValidationError;
