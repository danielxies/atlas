'use client';
import { useRouter } from 'next/navigation';

export default function Custom404() {
  const router = useRouter();

  const goHome = () => {
    router.push('/');
  };

  const goDocs = () => {
    router.push('/docs');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">oops</h1>
        <p className="text-lg mb-8">
          The page you are looking for does not exist.
          <br />
          Feel free to go{' '}
          <span className="underline cursor-pointer hover:text-indigo-500 transition-colors duration-300" onClick={goHome}>
            home
          </span>{' '}
          or view the{' '}
          <span className="underline cursor-pointer hover:text-indigo-500 transition-colors duration-300" onClick={goDocs}>
            docs that also dont exist
          </span>.
        </p>
      </div>
    </div>
  );
}
