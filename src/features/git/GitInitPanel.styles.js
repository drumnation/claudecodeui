import styled from '@emotion/styled';
import tw from 'twin.macro';

export const InitPanelContainer = styled.div`
  ${tw`flex flex-col p-5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 my-4`}
`;

export const InitPanelHeader = styled.div`
  ${tw`flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100`}
`;

export const HeaderText = styled.h3`
  ${tw`text-lg font-semibold m-0 text-gray-900 dark:text-gray-100`}
`;

export const InitPanelContent = styled.div`
  ${tw`flex flex-col gap-4`}
`;

export const InfoText = styled.p`
  ${tw`text-gray-600 dark:text-gray-300 leading-relaxed m-0`}
`;

export const ErrorMessage = styled.div`
  ${tw`flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm`}
`;

export const SuccessMessage = styled.div`
  ${tw`flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400`}
`;

export const SuccessTitle = styled.div`
  ${tw`font-semibold mb-1`}
`;

export const SuccessDetails = styled.div`
  ${tw`text-sm text-green-700 dark:text-green-300`}
  
  div {
    ${tw`my-0.5`}
  }
`;

export const InitButton = styled.button`
  ${tw`flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white border-none rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none active:translate-y-0`}
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const BenefitsList = styled.div`
  ${tw`mt-2`}
`;

export const BenefitItem = styled.div`
  ${tw`text-gray-600 dark:text-gray-300 text-sm leading-snug my-1`}
`;