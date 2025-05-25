"use client"

import { toast } from "@/components/ui/use-toast";
import { usePostDataMutation } from "@/utils/query-api";
import { useRouter } from "next/navigation"; // ✅ NEXT.JS navigation

type MethodType = "GET" | "POST" | "PUT" | "DELETE";

type ReturnType = [
  (
    url: string,
    values?: any | undefined,
    method?: MethodType,
    isFormData?: boolean
  ) => Promise<any | void>,
  { isLoading: boolean, isError: boolean, error: any }
];

type CallbackType = (value: any, router: any) => void;

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

  const router = useRouter(); // ✅ Next.js router
  const [mutate, { isLoading, isError, error }] = usePostDataMutation();

  const onSubmit = async (
    url: string,
    values: any | undefined = undefined,
    method: MethodType = "POST"
  ) => {
    try {
      const result = await mutate({ url, method, body: values ?? {} }) as any;

      console.log(result);
      if (result.error || result.errors) {
        if (result.error?.data?.message) {
          toast({
            title: "❗️Error",
            description: result.error.data.message,
            variant: "destructive",
          });
        } else if (result.error?.error) {
          toast({
            title: "❗️Error",
            description: result.error.error,
            variant: "destructive",
          });
        } else if (result.error?.name) {
          toast({
            title: "❗️ Server Request timeout",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            variant: "destructive",
            description: result.error.data.message,
          })
        }
        return result;
      }

      if (isError) {
        console.log('server error', error);
      }

      if (result?.data?.message && !disableAlert) {
        toast({
          title: "Success",
          description: result.data.message,
          variant: "success",
        });
      }

      if (callback) {
        console.log(callback);
        return callback(result.data, router);
      }

      if (navigateBack && method !== "DELETE") {
        router.back(); // ✅ Next.js navigation
      }

      return result.data || result;
    } catch (err: any) {
      toast({
        title: "Unexpected Error",
        description: err?.data?.message || "Something went wrong",
        variant: "destructive",
      });

      return err;
    }
  };

  return [onSubmit, { isLoading,isError, error }];
};

export type useMutateCallbackType = CallbackType;

export default useMutate;
