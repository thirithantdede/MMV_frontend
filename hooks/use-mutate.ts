import { toast } from "@/components/ui/use-toast";
import { usePostDataMutation } from "@/utils/query-api";
import { NavigateFunction, useNavigate } from "react-router-dom";

type MethodType = "GET" | "POST" | "PUT" | "DELETE";

type ReturnType = [
  (
    url: string,
    values?: any | undefined,
    method?: MethodType,
    isFormData?: boolean
  ) => Promise<any | void>,
  { isLoading: boolean }
];

type CallbackType = (value: any, navigate: NavigateFunction) => void;

type ParamsType = {
  callback?: CallbackType;
  navigateBack?: boolean;
  disableAlert?: boolean;
  disableInvalidate?: boolean;
};

const useMutate = (params: ParamsType = {}): ReturnType => {
  const {
    callback,
    navigateBack = false,
    disableAlert = true,
  } = params;

  const navigate = useNavigate();
  const [mutate, { isLoading, isError, error }] = usePostDataMutation();

  const onSubmit = async (
    url: string,
    values: any | undefined = undefined,
    method: MethodType = "POST"
  ) => {
    try {

      const result = await mutate({ url, method, body: values ?? {} }) as any;
      if (result.error || result.errors) {
        if (result.error.data) {
          toast({
            title: "❗️Error",
            description: result.error.data.message,
            variant: "destructive",
          });
        }

        if (result.error.error) {
          toast({
            title: "❗️Error",
            description: result.error.error,
            variant: "destructive",
          });
          return;
        }
        // handle request time out

        if (result.error && result.error.name) {
          toast({
            title: "❗️ Server Request timeout",
            variant: "destructive"
          });
        }
        return result;
      }

      if (isError) {
        console.log('server error', error);
      }

      if (result?.data?.message && !disableAlert) {
        toast({
          title: "Success",
          description: result?.data.message,
          variant: "success",
        });
      }

      if (callback) {
        return callback(result?.data, navigate);
      }

      if (navigateBack && method !== "DELETE") {
        return navigate(-1);
      }

      console.log(result);

      if(result.data){
        return result.data;
      }
      return result;

    } catch (err: any) {
      toast({
        title: "Unexpected Error",
        description: err?.data?.message || "Something went wrong",
        variant: "success",
      });

      return err;
    }

  };

  return [onSubmit, { isLoading }];
};

export type useMutateCallbackType = CallbackType;

export default useMutate;
