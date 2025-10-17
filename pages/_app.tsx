import type { AppProps } from 'next/app';
import CursorTrail from '@/components/CursorTrail';
import '@/app/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <CursorTrail />
      <Component {...pageProps} />
    </>
  );
};

export default App;
