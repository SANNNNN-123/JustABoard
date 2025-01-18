// App.jsx

import React from 'react';
import ModelTest from './components/ModelTest';
import Pegboard from './components/Pegboard';

const App = () => {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <div className="flex-1">
        <ModelTest />
      </div>
    </main>
  );
};

export default App;