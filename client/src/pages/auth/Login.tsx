import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useLocation, useNavigate } from 'react-router';
import { Form } from '../../components/common/Form';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorHandler';
import { useToast } from '@/components/common/toast/useToast';
import { loginSchema, type LoginFormValues } from '@/schema/auth.schema';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();
  const toast = useToast();

  const methods = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);

      toast.success('Logged in successfully.');

      const from = location.state?.from;

      navigate(
        from?.pathname ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : '/videos',
        { replace: true },
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your video platform."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </>
      }
    >
      <Form methods={methods} onSubmit={onSubmit} className="space-y-5">
        <Input<LoginFormValues>
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input<LoginFormValues>
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <Button type="submit" fullWidth loading={methods.formState.isSubmitting}>
          Sign In
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default Login;
