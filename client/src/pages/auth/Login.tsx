import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";

// import { useAuth } from "@/hooks/useAuth";
import { Button, Form, Input } from "@/components/common";
import { loginSchema, type LoginFormValues } from "@/schema/auth.schema";
import { yupResolver } from '@hookform/resolvers/yup';

// import type { LoginCredentials } from "@/types/auth.types";

const Login = () => {
  // const navigate = useNavigate();
  // const location = useLocation();

  // const { login, user, isLoading } = useAuth();

  // const [serverError, setServerError] = useState("");

  const methods = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched"
  });

  const from =
    (location.state as { from?: { pathname: string } } | null)
      ?.from?.pathname ?? "/videos";

  const onSubmit = async (credentials: LoginCredentials) => {
    // setServerError("");

    // try {
    //   await login({
    //     email: credentials.email.trim(),
    //     password: credentials.password,
    //   });

    //   navigate(from, { replace: true });
    // } catch (error) {
    //   const message = isAxiosError<{ message?: string }>(error)
    //     ? error.response?.data?.message
    //     : undefined;

    //   setServerError(
    //     message || "Invalid email or password. Please try again."
    //   );
    // }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <p className="text-sm text-gray-500">Checking session...</p>
  //     </div>
  //   );
  // }

  // if (user) {
  //   return <Navigate to={from} replace />;
  // }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            S
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your videos.
          </p>
        </div>

        {/* Login form */}
        <Form methods={methods} onSubmit={onSubmit} className="space-y-4">
          <Input<LoginFormValues>
            name="email"
            label="Email address"
            placeholder="you@example.com"
          />

          <Input<LoginFormValues>
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
          />

          <div className="flex justify-center">
            <Button type="submit" className="flex justify-center">Login</Button>
          </div>
        </Form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Secure video management platform
        </p>
      </div>
    </div>
  );
};

export default Login;
