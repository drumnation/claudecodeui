import React from 'react';
import { ClaudeLogo } from '@/shared-components/ClaudeLogo/ClaudeLogo';

export default {
  title: 'Shared Components/ClaudeLogo',
  component: ClaudeLogo,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'xlarge'],
    },
  },
};

const Template = (args) => <ClaudeLogo {...args} />;

export const Default = Template.bind({});
Default.args = {
  size: 'medium',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
};

export const ExtraLarge = Template.bind({});
ExtraLarge.args = {
  size: 'xlarge',
};

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  size: 'medium',
  className: 'opacity-50 hover:opacity-100 transition-opacity',
};

export const AllSizes = () => (
  <div className="flex items-center gap-4">
    <ClaudeLogo size="small" />
    <ClaudeLogo size="medium" />
    <ClaudeLogo size="large" />
    <ClaudeLogo size="xlarge" />
  </div>
);