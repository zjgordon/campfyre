import React from 'react';
import Navigation from '../components/Navigation';

const Home: React.FC = () => {
  return (
    <div>
      <Navigation />
      <main>
        <h1>Welcome to Campfyre</h1>
        <p>Gather, play, and tell your story — anywhere.</p>
        <p>This is the home page of our collaborative development platform.</p>
      </main>
    </div>
  );
};

export default Home;
