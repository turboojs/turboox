import { loadScript } from '../utils/load';

interface AppMeta {
  name: string;
  meta: object;
  preload: {
    range: number,
  };
  config: object;
}

export let appMetaData: AppMeta;

export interface AppParams {
  name: string;
  meta?: object;
  preload: {
    range: number,
  };
  getConfig: () => Promise<object>;
  plugins: () => string[] | string[];
}

/**
 * Create application.
 */
export const createApp = ({
  name,
  meta,
  preload,
  getConfig,
  plugins,
}: AppParams) => {
  if (appMetaData) {
    throw new Error('Cannot create multiple app.');
  }
  appMetaData = {
    name,
    meta: meta || {},
    preload: preload || { range: 2 },
    config: {},
  };
  const pluginCollection: string[] = [];
  if (typeof plugins === 'function') {
    pluginCollection.push(...plugins());
  } else {
    pluginCollection.push(...(plugins as string[]));
  }
  getConfig().then((config) => {
    appMetaData.config = config;
    pluginCollection.forEach((pluginKey) => {
      loadScript(pluginKey);
    });
  });
};
