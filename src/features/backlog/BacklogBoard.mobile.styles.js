import styled from '@emotion/styled';

// Mobile board container with safe area support
export const MobileBoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(255 255 255);
  color: rgb(0 0 0);
  position: relative;
  
  /* Safe area insets for iOS */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  
  .dark & {
    background-color: rgb(17 24 39);
    color: rgb(255 255 255);
  }
`;

// Simplified mobile header
export const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(229 231 235);
  background-color: rgb(249 250 251);
  flex-shrink: 0;
  min-height: 56px; /* Standard mobile header height */
  
  .dark & {
    border-bottom-color: rgb(55 65 81);
    background-color: rgb(31 41 55);
  }
`;

// Mobile header left section with hamburger menu
export const MobileHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// Hamburger menu button
export const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: rgb(75 85 99);
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  position: relative;
  z-index: 10;
  
  /* Touch-friendly on mobile */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  
  /* Better visual feedback */
  transition: all 0.2s ease;
  
  &:hover {
    background: rgb(229 231 235);
    transform: scale(1.05);
  }
  
  &:active {
    background: rgb(209 213 219);
    transform: scale(0.95);
  }
  
  &:focus {
    outline: 2px solid rgb(59 130 246);
    outline-offset: 2px;
  }
  
  /* Make sure it's above other elements */
  &:focus-visible {
    outline: 2px solid rgb(59 130 246);
    outline-offset: 2px;
  }
  
  .dark & {
    color: rgb(156 163 175);
    
    &:hover {
      background: rgb(55 65 81);
    }
    
    &:active {
      background: rgb(75 85 99);
    }
  }
  
  /* Ensure the icon is centered and clickable */
  svg {
    pointer-events: none;
    display: block;
  }
`;

// Mobile project title
export const MobileTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: rgb(17 24 39);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  .dark & {
    color: rgb(255 255 255);
  }
`;

// Floating action button for adding tasks
export const FloatingActionButton = styled.button`
  background: rgb(59 130 246);
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgb(37 99 235);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Collapsible metrics panel
export const MobileMetricsPanel = styled.div`
  background: rgb(249 250 251);
  border-bottom: 1px solid rgb(229 231 235);
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${props => props.isCollapsed ? '0' : '200px'};
  
  .dark & {
    background: rgb(31 41 55);
    border-bottom-color: rgb(55 65 81);
  }
`;

// Metrics toggle button
export const MetricsToggle = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgb(75 85 99);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  min-height: 44px;
  
  &:hover {
    background: rgb(229 231 235);
  }
  
  .dark & {
    color: rgb(156 163 175);
    
    &:hover {
      background: rgb(55 65 81);
    }
  }
`;

// Mobile metrics content
export const MobileMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  font-size: 0.875rem;
`;

// Individual metric item for mobile
export const MobileMetricItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: rgb(255 255 255);
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
  
  .dark & {
    background: rgb(17 24 39);
    border-color: rgb(55 65 81);
  }
`;

// Mobile metric value
export const MobileMetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || 'rgb(17 24 39)'};
  margin-bottom: 0.25rem;
  
  .dark & {
    color: ${props => props.color || 'rgb(255 255 255)'};
  }
`;

// Mobile metric label
export const MobileMetricLabel = styled.div`
  font-size: 0.75rem;
  color: rgb(107 114 128);
  font-weight: 500;
  
  .dark & {
    color: rgb(156 163 175);
  }
`;

// Mobile content area
export const MobileContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Mobile task columns container
export const MobileColumnsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
`;

// Mobile column
export const MobileColumn = styled.div`
  background: rgb(249 250 251);
  border: 1px solid rgb(229 231 235);
  border-radius: 0.75rem;
  overflow: hidden;
  
  .dark & {
    background: rgb(31 41 55);
    border-color: rgb(55 65 81);
  }
`;

// Mobile column header
export const MobileColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgb(255 255 255);
  border-bottom: 1px solid rgb(229 231 235);
  
  .dark & {
    background: rgb(17 24 39);
    border-bottom-color: rgb(55 65 81);
  }
`;

// Mobile column title
export const MobileColumnTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(17 24 39);
  
  .dark & {
    color: rgb(255 255 255);
  }
`;

// Mobile column count badge
export const MobileColumnCount = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(107 114 128);
  background: rgb(229 231 235);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  
  .dark & {
    color: rgb(156 163 175);
    background: rgb(55 65 81);
  }
`;

// Mobile column content
export const MobileColumnContent = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 60px;
`;

// Mobile empty column state
export const MobileEmptyColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: rgb(107 114 128);
  font-size: 0.875rem;
  text-align: center;
  border: 2px dashed rgb(229 231 235);
  border-radius: 0.5rem;
  margin: 0.5rem;
  
  .dark & {
    color: rgb(156 163 175);
    border-color: rgb(55 65 81);
  }
`;

// Bottom sheet overlay
export const BottomSheetOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

// Bottom sheet container
export const BottomSheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgb(255 255 255);
  border-radius: 1rem 1rem 0 0;
  padding: 1rem;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 51;
  max-height: 70vh;
  overflow-y: auto;
  
  /* Safe area for iOS */
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  
  .dark & {
    background: rgb(17 24 39);
  }
`;

// Bottom sheet handle
export const BottomSheetHandle = styled.div`
  width: 40px;
  height: 4px;
  background: rgb(209 213 219);
  border-radius: 2px;
  margin: 0 auto 1rem auto;
  
  .dark & {
    background: rgb(75 85 99);
  }
`;

// Bottom sheet title
export const BottomSheetTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-align: center;
  color: rgb(17 24 39);
  
  .dark & {
    color: rgb(255 255 255);
  }
`;

// Mobile filter button
export const MobileFilterButton = styled.button`
  background: none;
  border: none;
  color: rgb(75 85 99);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  
  &:hover {
    background: rgb(229 231 235);
  }
  
  &:active {
    background: rgb(209 213 219);
  }
  
  .dark & {
    color: rgb(156 163 175);
    
    &:hover {
      background: rgb(55 65 81);
    }
    
    &:active {
      background: rgb(75 85 99);
    }
  }
`;

// Status picker options
export const StatusOption = styled.button`
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid rgb(229 231 235);
  text-align: left;
  font-size: 1rem;
  color: rgb(17 24 39);
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &:hover {
    background: rgb(249 250 251);
  }
  
  &:active {
    background: rgb(229 231 235);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .dark & {
    color: rgb(255 255 255);
    border-bottom-color: rgb(55 65 81);
    
    &:hover {
      background: rgb(31 41 55);
    }
    
    &:active {
      background: rgb(55 65 81);
    }
  }
`;

// Mobile loading overlay
export const MobileLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
  
  .dark & {
    background: rgba(17, 24, 39, 0.95);
  }
  
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

// Mobile error message
export const MobileErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239 68 68);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  margin: 1rem;
  font-size: 0.875rem;
`;