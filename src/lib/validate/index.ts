import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must be less than 32 characters long" })
    .trim() // Remove leading and trailing whitespace
    .refine((value) => /[a-z]/i.test(value), {
      message: "Password must contain at least one letter",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least one digit",
    })
    .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\`~]/.test(value), {
      message: "Password must contain at least one special character",
    }),
});

export const registerSchema = z.object({
  full_name: z
    .string({
      required_error: "This field has to be filled.",
    })
    .min(3, { message: "This field has to be filled." }),
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must be less than 32 characters long" })
    .trim() // Remove leading and trailing whitespace
    .refine((value) => /[a-z]/i.test(value), {
      message: "Password must contain at least one letter",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least one digit",
    })
    .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\`~]/.test(value), {
      message: "Password must contain at least one special character",
    }),
  isTermsAccepted: z.boolean().refine((value) => value, {
    message: "You must agree to the terms and conditions",
  }),
});

export const conformPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(32, { message: "Password must be less than 32 characters long" })
      .trim() // Remove leading and trailing whitespace
      .refine((value) => /[a-z]/i.test(value), {
        message: "Password must contain at least one letter",
      })
      .refine((value) => /\d/.test(value), {
        message: "Password must contain at least one digit",
      })
      .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\`~]/.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
});

export const otpSchema = z.object({
  otp: z.string().refine((value) => String(value).length === 4, {
    message: "OTP must be exactly 4 digits.",
  }),
});

const MAX_FILE_SIZE = 5000 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const orgSchema = z.object({
  org_name: z.string().min(1, { message: "Name is required" }).trim(),
  org_image: z.string().optional(),
  email: z.string().min(1, { message: "Email is required" }).email(),
});

export const updateOrgSchema = z.object({
  org_name: z.string().min(1, { message: "Name is required" }).trim(),
  org_image: z.string().optional(),
});

export const projectSchema = z.object({
  provider: z.enum(["Github", "Gitlab"], {
    required_error: "Please select a provider.",
  }),
  repository: z
    .string({
      required_error: "Please select a repository.",
    })
    .min(1, { message: "Please select a repository." }),
  branch: z
    .string({
      required_error: "Please select a branch.",
    })
    .min(1, { message: "Please select a branch." }),
  project_name: z
    .string({
      required_error: "project  is required",
    })
    .min(1, { message: "project  is required" }),
  project_image: z.string().optional(),
});

export const createSchema = z.object({
  file: z.string().min(1, { message: "Please select a file" }),
  name: z.string().min(1, { message: "Please enter a name" }),
  fileType: z.enum(["json", "md", "toml"], {
    required_error: "Please select a type",
  }),
  fmType: z.enum(["toml", "yaml", "json"], {
    required_error: "Please select a type",
  }),
  template: z.array(z.any()),
});

export const createFileSchema = z.object({
  name: z
    .string({
      required_error: "Please enter a name",
    })
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" }),
  title: z.string().optional(),
});

export const configFormSchema = z.object({
  content_root: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .refine((data) => data.value, {
      message: "select your content folder.",
    }),
  media_root: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .refine((data) => data.value, {
      message: "select your media folder.",
    }),
  themeConfigurations: z.array(
    z.string({
      required_error: "Please select a theme",
    }),
  ),
  showCommitModal: z.boolean(),
  arrangement: z.any(),
});

export const userDetailsSchema = z.object({
  full_name: z.string().min(1, { message: "Name is required" }).trim(),
  country: z.string().optional(),
  profession: z.string().optional(),
  image: z.string().optional(),
  email: z.string().optional(),
});

export const addNewTeamMemberSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  role: z.enum(["admin", "editor"], {
    required_error: "Please select a role.",
  }),
});

export const updatePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must be less than 32 characters long" })
    .trim() // Remove leading and trailing whitespace
    .refine((value) => /[a-z]/i.test(value), {
      message: "Password must contain at least one letter",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least one digit",
    })
    .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\`~]/.test(value), {
      message: "Password must contain at least one special character",
    }),
  currentPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must be less than 32 characters long" })
    .trim() // Remove leading and trailing whitespace
    .refine((value) => /[a-z]/i.test(value), {
      message: "Password must contain at least one letter",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least one digit",
    })
    .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\`~]/.test(value), {
      message: "Password must contain at least one special character",
    }),
});

export const saveProfilePictureSchema = z.object({
  image: z.custom<FileList>(
    (fileList) => {
      if (typeof FileList !== "undefined" && fileList instanceof FileList) {
        return (
          fileList.length > 0 &&
          fileList.item(0)?.size! <= MAX_FILE_SIZE &&
          ACCEPTED_IMAGE_TYPES.includes(fileList.item(0)?.type!)
        );
      }
      return false;
    },
    {
      message:
        "Supported image types: JPEG, JPG, PNG, WebP. Maximum file size allowed is 200 KB.",
    },
  ),
});
