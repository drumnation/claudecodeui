import React from 'react';
import { Input } from '@/shared-components/Input/Input';
import { useInput } from '@/shared-components/Input/Input.hook';
import { validateEmail, validateRequired, composeValidators, validateMinLength } from '@/shared-components/Input/Input.logic';

export default {
  title: 'Shared Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The type of input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
};

export const Default = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Number = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Disabled = {
  args: {
    placeholder: 'This input is disabled',
    disabled: true,
    value: 'Disabled input',
  },
};

export const WithValue = {
  args: {
    value: 'This input has a value',
  },
};

export const Search = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const File = {
  args: {
    type: 'file',
  },
};

// Interactive example with validation
export const WithValidation = () => {
  const emailInput = useInput({
    validate: validateEmail,
  });

  return (
    <div style={{ width: '300px' }}>
      <Input
        type="email"
        placeholder="Enter email..."
        value={emailInput.value}
        onChange={emailInput.handleChange}
        onBlur={emailInput.handleBlur}
        ref={emailInput.inputRef}
        aria-invalid={!!emailInput.error}
        aria-describedby={emailInput.error ? 'email-error' : undefined}
      />
      {emailInput.error && emailInput.touched && (
        <p id="email-error" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          {emailInput.error}
        </p>
      )}
    </div>
  );
};

// Example with multiple validators
export const WithMultipleValidators = () => {
  const nameInput = useInput({
    validate: composeValidators(
      validateRequired,
      validateMinLength(3)
    ),
  });

  return (
    <div style={{ width: '300px' }}>
      <Input
        placeholder="Enter your name..."
        value={nameInput.value}
        onChange={nameInput.handleChange}
        onBlur={nameInput.handleBlur}
        ref={nameInput.inputRef}
        aria-invalid={!!nameInput.error}
        aria-describedby={nameInput.error ? 'name-error' : undefined}
      />
      {nameInput.error && nameInput.touched && (
        <p id="name-error" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          {nameInput.error}
        </p>
      )}
      <button 
        onClick={() => nameInput.reset()} 
        style={{ marginTop: '8px', padding: '4px 8px', fontSize: '12px' }}
      >
        Reset
      </button>
    </div>
  );
};

// Controlled vs Uncontrolled example
export const ControlledVsUncontrolled = () => {
  const [controlledValue, setControlledValue] = React.useState('');

  return (
    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '300px' }}>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Controlled Input</h4>
        <Input
          value={controlledValue}
          onChange={(e) => setControlledValue(e.target.value)}
          placeholder="Controlled input..."
        />
        <p style={{ fontSize: '12px', marginTop: '4px' }}>Value: {controlledValue}</p>
      </div>
      
      <div>
        <h4 style={{ marginBottom: '8px' }}>Uncontrolled Input</h4>
        <Input
          defaultValue="Initial value"
          placeholder="Uncontrolled input..."
        />
      </div>
    </div>
  );
};

// Form example
export const InForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Form submitted:', Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input
        name="username"
        placeholder="Username"
        required
      />
      <Input
        name="email"
        type="email"
        placeholder="Email"
        required
      />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit" style={{ padding: '8px 16px', marginTop: '8px' }}>
        Submit
      </button>
    </form>
  );
};