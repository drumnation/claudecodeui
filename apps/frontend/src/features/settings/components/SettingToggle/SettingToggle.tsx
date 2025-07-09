import React from 'react';
import {
  PermissionContainer,
  PermissionLabel,
  PermissionCheckbox,
  PermissionInfo,
  PermissionTitle,
  PermissionDescription,
} from './SettingToggle.styles';
import type {SettingToggleProps} from './SettingToggle.types';

export const SettingToggle: React.FC<SettingToggleProps> = ({
  checked,
  onChange,
  title,
  description,
}) => {
  return (
    <PermissionContainer>
      <PermissionLabel>
        <PermissionCheckbox
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <PermissionInfo>
          <PermissionTitle>{title}</PermissionTitle>
          <PermissionDescription>{description}</PermissionDescription>
        </PermissionInfo>
      </PermissionLabel>
    </PermissionContainer>
  );
};
