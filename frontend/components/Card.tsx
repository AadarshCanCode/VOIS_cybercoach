import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline' | 'cyber';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    hover = false,
    ...props
}) => {
    const baseStyles = 'rounded-xl overflow-hidden';

    const variants = {
        default: 'bg-card text-card-foreground shadow-sm border border-border/50',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10 shadow-xl',
        outline: 'border-2 border-border bg-transparent',
        cyber: 'bg-gray-900/80 backdrop-blur-xl border border-cyber-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]',
    };

    const hoverStyles = hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50' : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
    <div className={`p-6 ${className}`} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
    <p className={`text-sm text-muted-foreground mt-2 ${className}`} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
    <div className={`p-6 pt-0 ${className}`} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
);
