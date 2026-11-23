import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';
import Work from '../components/Work';
// 37 kB of icon paths sits below the fold; it must never delay the hero.
const Stack = lazy(() => import('../components/Stack'));

const Home = () => {
  return (
    <>
      <Hero />
      <Work />
      <Suspense fallback={<div style={{ minHeight: '180px' }} />}>
        <Stack />
      </Suspense>
    </>
  );
};

export default Home;