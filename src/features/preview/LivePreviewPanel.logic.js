export const getStatusColor = (serverStatus) => {
  switch (serverStatus) {
    case 'running': return 'text-green-500';
    case 'starting': return 'text-yellow-500';
    case 'stopping': return 'text-orange-500';
    case 'stopped': return 'text-gray-500';
    case 'error': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const getStatusText = (serverStatus) => {
  switch (serverStatus) {
    case 'running': return 'Running';
    case 'starting': return 'Starting...';
    case 'stopping': return 'Stopping...';
    case 'stopped': return 'Stopped';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
};

export const isCurrentProjectServer = () => {
  return window.location.hostname === 'localhost' && 
         window.location.port === '8766';
};