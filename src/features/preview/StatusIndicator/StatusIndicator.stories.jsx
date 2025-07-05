import { StatusIndicator } from '@/features/preview/StatusIndicator/StatusIndicator';

export default {
  title: 'Features/Preview/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    serverStatus: {
      control: { type: 'select' },
      options: ['stopped', 'starting', 'running', 'stopping', 'error']
    }
  }
};

export const Stopped = {
  args: {
    serverStatus: 'stopped'
  }
};

export const Starting = {
  args: {
    serverStatus: 'starting'
  }
};

export const Running = {
  args: {
    serverStatus: 'running'
  }
};

export const Stopping = {
  args: {
    serverStatus: 'stopping'
  }
};

export const Error = {
  args: {
    serverStatus: 'error'
  }
};

export const AllStates = () => {
  const states = ['stopped', 'starting', 'running', 'stopping', 'error'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {states.map(status => (
        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ width: '80px', textAlign: 'right' }}>{status}:</span>
          <StatusIndicator serverStatus={status} />
        </div>
      ))}
    </div>
  );
};