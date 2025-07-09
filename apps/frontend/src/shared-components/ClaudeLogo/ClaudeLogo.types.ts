import {SVGAttributes} from 'react';

export interface ClaudeLogoProps extends SVGAttributes<SVGElement> {
  size?: number | string;
  color?: string;
  animated?: boolean;
}
