import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router';
import { Form } from '../../components/common/Form';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorHandler';
import { registerSchema, type RegisterFormValues } from '@/schema/auth.schema';
import { useToast } from '@/components/common/toast/useToast';
import { SelectInput } from '@/components/common';

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();
  const toast = useToast();

  const methods = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { name, email, role, password } = values;

      await register({ name, email, role, password });

      toast.success('Account created successfully. Please sign in.');

      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Register to start uploading and managing videos."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </>
      }
    >
      <Form methods={methods} onSubmit={onSubmit} className="space-y-5">
        <Input<RegisterFormValues>
          name="name"
          label="Full name"
          type="text"
          placeholder="Enter your name"
          autoComplete="name"
        />

        <Input<RegisterFormValues>
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />

        <SelectInput<RegisterFormValues>
          name="role"
          label="Account role"
          options={[{ label: 'User', value: 'user' }]}
        />

        <Input<RegisterFormValues>
          name="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <Input<RegisterFormValues>
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth loading={methods.formState.isSubmitting}>
          Create Account
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default Register;
