import { NodeServer } from '@bitdev/node.node-server';

export default NodeServer.from({
  name: 'surprise-service',
  mainPath: import.meta.resolve('./surprise-service.app-root.js'),
});
