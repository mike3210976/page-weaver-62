const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large coral circle */}
      <div 
        className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full shape-coral opacity-60 animate-float"
        style={{ top: '10%', right: '10%' }}
      />
      
      {/* Teal square */}
      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 rounded-2xl shape-teal opacity-70 animate-float-delayed rotate-12"
        style={{ top: '60%', right: '15%' }}
      />
      
      {/* Yellow triangle-ish shape */}
      <div 
        className="absolute w-0 h-0 animate-wiggle opacity-80"
        style={{ 
          top: '25%', 
          left: '8%',
          borderLeft: '40px solid transparent',
          borderRight: '40px solid transparent',
          borderBottom: '70px solid hsl(var(--yellow))',
        }}
      />
      
      {/* Lavender pill */}
      <div 
        className="absolute w-16 h-32 md:w-20 md:h-40 rounded-full shape-lavender opacity-50 animate-bounce-soft -rotate-45"
        style={{ bottom: '20%', left: '12%' }}
      />
      
      {/* Mint circle */}
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 rounded-full shape-mint opacity-60 animate-float"
        style={{ top: '70%', left: '45%' }}
      />
      
      {/* Small coral dot */}
      <div 
        className="absolute w-8 h-8 rounded-full shape-coral opacity-70 animate-bounce-soft"
        style={{ top: '45%', right: '35%' }}
      />
      
      {/* Yellow ring */}
      <div 
        className="absolute w-20 h-20 md:w-32 md:h-32 rounded-full border-8 border-accent opacity-40 animate-spin-slow"
        style={{ bottom: '30%', right: '25%' }}
      />
      
      {/* Teal small square */}
      <div 
        className="absolute w-10 h-10 rounded-lg shape-teal opacity-50 animate-wiggle rotate-45"
        style={{ top: '15%', left: '25%' }}
      />
    </div>
  );
};

export default FloatingShapes;
