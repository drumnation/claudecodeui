import * as React from "react";
import { useLogger } from "@kit/logger/react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", onChange, onFocus, onBlur, value, error, label, ...props }, ref) => {
    const logger = useLogger({ scope: 'Input' });
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      logger.debug('Input focused', { 
        type, 
        hasValue: !!value,
        label: label || 'unlabeled'
      });
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      logger.debug('Input blurred', { 
        type, 
        hasValue: !!value,
        label: label || 'unlabeled'
      });
      onBlur?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      logger.debug('Input value changed', { 
        type, 
        valueLength: newValue.length,
        label: label || 'unlabeled',
        isEmpty: !newValue
      });
      onChange?.(event);
    };

    const inputClasses = cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-destructive focus-visible:ring-destructive",
      className,
    );

    React.useEffect(() => {
      if (error) {
        logger.warn('Input validation error', { 
          error, 
          type, 
          label: label || 'unlabeled'
        });
      }
    }, [error, type, label, logger]);

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };