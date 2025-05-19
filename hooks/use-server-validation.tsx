const useServerValidation = () => {

  const handleServerErrors = (errors: any, setError: any) => {
    if (typeof errors != "object") {
      return;
    }

    (errors.data && errors.data.errors) && Object.keys(errors.data.errors).forEach((key) => {
      setError(key, {
        type: "manual",
        message: errors.data.errors[key][0],
      });
    });
  };

  return { handleServerErrors };
};

export default useServerValidation;
