import React from 'react';

const PremiumButton = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  as: Component = 'button',
  ...props
}) => {
  const variantClass =
    variant === 'outline'
      ? 'btn-outline-premium'
      : variant === 'secondary'
        ? 'btn-premium btn-premium-secondary'
        : 'btn-premium';

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={`${variantClass} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
};

export default PremiumButton;
