import { Leaf } from 'lucide-react';
import React from 'react';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Leaf size={32} />
          <h1 className="text-2xl font-bold">ZeaWatch</h1>
        </div>
        {/* Add navigation or other header elements here if needed */}
      </div>
    </header>
  );
};

export default Header;
