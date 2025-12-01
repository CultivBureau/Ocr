import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  centered?: boolean;
  className?: string;
  underline?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  variant = 'primary',
  centered = true,
  className = '',
  underline = false,
}) => {
  const variantStyles = {
    primary: 'text-[#A4C639] bg-gradient-to-r from-green-50 to-lime-50',
    secondary: 'text-gray-900 bg-gray-100',
    accent: 'text-white bg-gradient-to-r from-[#A4C639] to-[#8FB02E]',
  };

  const underlineClass = underline ? 'underline decoration-2 underline-offset-4' : '';

  return (
    <div
      className={`py-6 px-8 ${variantStyles[variant]} ${className}`}
    >
      <h2
        className={`text-2xl font-bold ${underlineClass} ${
          centered ? 'text-center' : ''
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-2 text-sm opacity-90 ${
            centered ? 'text-center' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Header;
