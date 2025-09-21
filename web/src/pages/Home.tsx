import React from 'react';
import Navigation from '../components/Navigation';
import MUIComponents from '../components/MUIComponents';

const Home: React.FC = () => {
  return (
    <div>
      <Navigation />
      <main>
        <MUIComponents />
      </main>
    </div>
  );
};

export default Home;
