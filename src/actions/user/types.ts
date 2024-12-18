import {
  loginSchema,
  otpSchema,
  registerSchema,
  userDetailsSchema,
} from "@/lib/validate";
import { z } from "zod";
export type Role = "admin" | "user";

export type User<T> = {
  id: string;
  email: string;
  full_name: string;
  profession: string;
  country: string;
  verified: boolean;
  role: Role;
  image?: string;
  accessToken: string | null;
  variables: T;
};

export type UserLogin = User<
  z.infer<typeof loginSchema> & {
    currentDate: number;
  }
>;

export type UserRegister = User<
  z.infer<typeof registerSchema> & {
    currentDate: number;
  }
> & { password?: string };

export type UserUpdate = User<
  z.infer<typeof userDetailsSchema> & { user_id?: string }
>;

export type UserVerified = {
  variables: z.infer<typeof otpSchema> & { email: string };
};

export type ForgetPassword = User<{ email: string; currentTime: number }>;
export type ResetPassword = {
  variables: {
    password: string;
    user_id: string;
    confirmPassword?: string;
    email?: string;
    currentDate?: number;
  };
};

export type UpdateUser = {
  variables: {
    user_id: string;
    currentPassword: string;
    newPassword: string;
  };
};

export type TSaveProfilePicture = {
  variables: FormData;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: string;
  contentType: string | null;
  contentDisposition: string | null;
  contentEncoding: string | null;
  storageClass: string;
  serverSideEncryption: string | null;
  location: string;
  etag: string;
};
