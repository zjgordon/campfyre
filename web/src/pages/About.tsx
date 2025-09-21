import React from 'react';
import Navigation from '../components/Navigation';

const About: React.FC = () => {
  return (
    <div>
      <Navigation />
      <main>
        <h1>About Campfyre</h1>
        <p>
          Campfyre is a collaborative development platform designed to bring
          teams together.
        </p>
        <p>
          We believe in the power of storytelling and collaboration to create
          amazing software.
        </p>
      </main>
    </div>
  );
};

export default About;
