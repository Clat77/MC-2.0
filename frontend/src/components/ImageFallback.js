import React, { useState } from 'react';
import { Shield, User } from 'lucide-react';

export const ImageFallback = ({ 
  src, 
  alt, 
  fallbackIcon: FallbackIcon = Shield, 
  className = '',
  iconClassName = 'w-8 h-8 text-zinc-600'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800/50 ${className}`}>
        <FallbackIcon className={iconClassName} />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50">
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export const PlayerAvatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <ImageFallback
      src={src}
      alt={name}
      fallbackIcon={User}
      className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}
      iconClassName="w-1/2 h-1/2 text-zinc-600"
    />
  );
};

export const TeamLogo = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <ImageFallback
      src={src}
      alt={name}
      fallbackIcon={Shield}
      className={`${sizeClasses[size]} ${className}`}
      iconClassName="w-1/2 h-1/2 text-zinc-600"
    />
  );
};

export default ImageFallback;
