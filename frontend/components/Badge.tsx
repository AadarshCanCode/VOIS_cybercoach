import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'cyber';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    className = '',
    variant = 'default',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    const variants = {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500/15 text-green-500 hover:bg-green-500/25',
        warning: 'border-transparent bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25',
        cyber: 'border-cyber-500/50 bg-cyber-500/10 text-cyber-400 shadow-[0_0_10px_rgba(14,165,233,0.2)]',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};
