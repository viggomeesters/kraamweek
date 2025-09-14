'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onAvatarChange?: (avatarData: string) => void;
}

export default function Avatar({ src, name, size = 'md', editable = false, onAvatarChange }: AvatarProps) {
  const [isUploading, setIsUploading] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-12 h-12 text-base';
      case 'lg':
        return 'w-16 h-16 text-lg';
      case 'xl':
        return 'w-20 h-20 text-xl';
      default:
        return 'w-12 h-12 text-base';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientClasses = (name: string) => {
    // Generate a consistent gradient based on the name
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onAvatarChange) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Selecteer een geldig afbeeldingsbestand');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Afbeelding is te groot. Maximaal 2MB toegestaan.');
      return;
    }

    setIsUploading(true);

    try {
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image(); // Use window.Image to avoid conflict with Next.js Image

      img.onload = () => {
        // Calculate new dimensions (max 200x200)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        onAvatarChange(compressedData);
        setIsUploading(false);
      };

      img.onerror = () => {
        alert('Fout bij het laden van de afbeelding');
        setIsUploading(false);
      };

      // Read the file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing avatar:', error);
      alert('Er is een fout opgetreden bij het verwerken van de afbeelding');
      setIsUploading(false);
    }

    // Clear the input
    event.target.value = '';
  };

  const sizeClasses = getSizeClasses();
  const initials = getInitials(name);
  const gradientClasses = getGradientClasses(name);

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses} rounded-full overflow-hidden flex items-center justify-center font-semibold text-white ${src ? '' : `bg-gradient-to-br ${gradientClasses}`}`}>
        {src ? (
          <Image
            src={src}
            alt={`Avatar van ${name}`}
            width={200}
            height={200}
            className="w-full h-full object-cover"
            priority={false}
            unoptimized={true} // Since we're using base64 data URLs
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      
      {editable && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer text-white text-xs text-center p-1"
          >
            {isUploading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
            ) : (
              <>
                📷
                <br />
                Wijzig
              </>
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}