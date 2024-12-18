"use server";

import {
  ExtractVariables,
  InsertionSuccess,
  SubmitFormState,
  fetchApi,
  mutate,
} from "@/actions/utils";
import { signOut } from "@/auth";
import {
  conformPasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validate";
import { cookies } from "next/headers";
import {
  ForgetPassword,
  ResetPassword,
  TSaveProfilePicture,
  UpdateUser,
  UserLogin,
  UserRegister,
  UserUpdate,
  UserVerified,
} from "./types";

export const login = async (
  prevState: SubmitFormState<UserLogin>,
  data: ExtractVariables<UserLogin>,
): Promise<SubmitFormState<UserLogin>> => {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      data: null,
      error: [],
      message: null,
      isError: true,
      isSuccess: false,
      statusCode: null,
    };
  }

  return await mutate(async () => {
    const user = await fetchApi<InsertionSuccess<UserLogin>>({
      endPoint: "/authentication/password-login",
      method: "POST",
      body: { ...parsed.data, currentDate: Date.now() },
      cache: "no-cache",
    });

    const isUserVerified = user.body.result.verified;

    if (!isUserVerified) {
      return await fetchApi<{
        variables: {
          email: string;
          currentTime: number;
        };
      }>({
        endPoint: "/authentication/verify-user/",
        method: "POST",
        cache: "no-cache",
        body: {
          email: user.body.result.email,
          currentTime: Date.now(),
        },
      });
    }
    return user;
  });
};

export const register = async (
  prevState: SubmitFormState<UserRegister>,
  data: ExtractVariables<UserRegister>,
): Promise<SubmitFormState<UserRegister>> => {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      data: null,
      error: [],
      message: null,
      isError: true,
      isSuccess: false,
      statusCode: null,
    };
  }

  return await mutate<UserRegister>(async () => {
    const { email, password, full_name, isTermsAccepted } = parsed.data;
    const user = await fetchApi<InsertionSuccess<UserRegister>>({
      endPoint: "/user",
      method: "POST",
      body: {
        email,
        full_name,
        isTermsAccepted,
        password,
        currentDate: Date.now(),
      },
      cache: "no-cache",
    });
    const body = user.body.result;
    const isUserVerified = body.verified;

    if (!isUserVerified) {
      const user = await fetchApi<{
        variables: {
          email: string;
          currentTime: number;
        };
      }>({
        endPoint: "/authentication/verify-user/",
        method: "POST",
        cache: "no-cache",
        body: {
          email: data.email,
          currentTime: Date.now(),
        },
      });

      // @ts-ignore
      user.body.result.password = parsed.data.password;

      return user;
    }

    return user;
  });
};

export const resetPassword = async (
  prevState: SubmitFormState<ResetPassword>,
  data: ExtractVariables<ResetPassword>,
): Promise<SubmitFormState<ResetPassword>> => {
  const parsed = conformPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      data: null,
      error: [],
      message: "Invalid form data",
      isError: true,
      isSuccess: false,
      statusCode: 500,
    };
  }
  return await mutate<ResetPassword>(async () => {
    return await fetchApi<InsertionSuccess<ResetPassword>>({
      endPoint: "/authentication/recovery-password",
      method: "PATCH",
      cache: "no-cache",
      body: {
        email: data.email,
        user_id: data.user_id,
        password: data.password,
        currentDate: Date.now(),
      },
    });
  });
};

export const forgetPassword = async (
  prevState: SubmitFormState<ForgetPassword>,
  data: ExtractVariables<ForgetPassword>,
): Promise<SubmitFormState<ForgetPassword>> => {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      data: null,
      error: [],
      message: null,
      isError: true,
      isSuccess: false,
      statusCode: 500,
    };
  }

  return await mutate<ForgetPassword>(async () => {
    const isUserExit = await fetchApi<InsertionSuccess<ForgetPassword>>({
      endPoint: "/authentication/verify-user",
      method: "POST",
      cache: "no-cache",
      body: data,
    });
    return isUserExit;
  });
};

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("user");
  await signOut();
};

export const verifyEmail = async (
  prevState: SubmitFormState<UserVerified>,
  data: ExtractVariables<UserVerified>,
) => {
  return await mutate<UserVerified>(async () => {
    return await fetchApi<{
      variables: {
        otp: string;
        email: string;
        currentTime: number;
      };
    }>({
      endPoint: "/authentication/verify-otp",
      method: "POST",
      body: {
        otp: data.otp,
        email: data.email,
        currentTime: Date.now(),
      },
      cache: "no-cache",
    });
  });
};

export const updateUser = async (
  prevState: SubmitFormState<UserUpdate>,
  data: ExtractVariables<UserUpdate>,
) => {
  return await mutate<UserUpdate>(async () => {
    return await fetchApi<UserUpdate>({
      endPoint: `/user/update/${data.user_id}`,
      method: "PATCH",
      body: data,
      cache: "no-cache",
    });
  });
};

export const updateUserProfile = async (
  userData: Record<string, unknown>,
): Promise<SubmitFormState<UserRegister>> => {
  const reqBody = {
    ...(userData as ExtractVariables<UserRegister>),
    currentDate: Date.now(),
  };

  return await mutate<UserRegister>(async () => {
    const updatedUser = await fetchApi<InsertionSuccess<UserRegister>>({
      endPoint: "/authentication/oauth-login",
      method: "POST",
      body: reqBody,
      cache: "no-cache",
    });

    return updatedUser;
  });
};

export const updatePassword = async (
  prevState: SubmitFormState<UpdateUser>,
  data: ExtractVariables<UpdateUser>,
) => {
  return await mutate<UpdateUser>(async () => {
    return await fetchApi<UpdateUser>({
      endPoint: `/authentication/update-password`,
      method: "PATCH",
      body: {
        user_id: data.user_id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    });
  });
};

export const updateImage = async (
  data: ExtractVariables<TSaveProfilePicture>,
) => {
  const response = await mutate<TSaveProfilePicture>(async () => {
    return await fetchApi<TSaveProfilePicture>({
      endPoint: "/bucket/upload",
      method: "POST",
      body: data,
    });
  });

  return response;
};
