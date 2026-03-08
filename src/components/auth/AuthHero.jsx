import React from 'react';
import { MapPin } from 'lucide-react';

const AuthHero = () => {
  return (
    <div className="flex-1 h-full bg-cover bg-center relative" 
         style={{ 
           backgroundImage: 'url("/images/Villtech.jpeg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
        <div className="max-w-4xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Villtech</h1>
          <p className="text-lg md:text-xl mb-1">Smart Village Portal</p>
          <p className="text-white/80 text-sm md:text-base">Empowering Villages Through Technology</p>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
