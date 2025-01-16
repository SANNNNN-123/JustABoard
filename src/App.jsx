import React from 'react';
import PegBoard from './components/PegBoard.jsx'
import ModelViewer from './components/ModelViewer.jsx'

const App = () => {
  return (
    <main className="flex flex-col w-full min-h-screen">
      {/* <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Pegboard Customizer</h1>
      </div> */}
      <div className="flex-1">
        <ModelViewer />
      </div>
    </main>
  );
};

export default App;