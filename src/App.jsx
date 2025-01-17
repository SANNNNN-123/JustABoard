// App.jsx

import React from 'react';
import PegBoard from './components/PegBoard';

const App = () => {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <div className="flex-1">
        <PegBoard />
      </div>
    </main>
  );
};

export default App;