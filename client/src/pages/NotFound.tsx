import { Link } from 'react-router';
import { Home, ArrowLeft, SearchX } from 'lucide-react';
import { Button } from '@/components/common';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <SearchX className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Error 404
        </p>

        <h1 className="mb-4 text-4xl font-bold text-gray-900">Page not found</h1>

        <p className="mb-8 text-gray-600">
          Sorry, we couldn't find the page you're looking for. It may have been moved, deleted, or
          the URL might be incorrect.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/videos">
            <Button leftIcon={<Home size={18} />}>Back to Videos</Button>
          </Link>

          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
