import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={twMerge(
                            clsx(
                                "w-full rounded-lg border px-4 py-2.5 outline-none transition-all text-black placeholder-gray-400",
                                "focus:ring-1 focus:ring-primary",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                icon && "pl-10",
                                error && "border-status-error focus:border-status-error focus:ring-status-error"
                            ),
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-xs text-status-error animate-pulse">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
