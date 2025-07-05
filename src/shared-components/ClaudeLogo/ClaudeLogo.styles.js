import styled from '@emotion/styled';
import tw from 'twin.macro';

const sizeMap = {
  small: tw`w-4 h-4`,
  medium: tw`w-5 h-5`,
  large: tw`w-6 h-6`,
  xlarge: tw`w-8 h-8`,
};

export const StyledLogo = styled.img`
  ${({ size }) => sizeMap[size] || sizeMap.medium}
  ${tw`inline-block`}
`;