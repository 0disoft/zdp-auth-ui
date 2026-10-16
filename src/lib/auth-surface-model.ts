import { getAuthMessages, type ZdpAuthMessages } from './i18n';
import {
  createZdpAuthSurfaceModel as createSurfaceModel,
  type ZdpAuthSurfaceConfig as InjectedSurfaceConfig,
  type ZdpAuthSurfaceModel
} from './auth-surface-model-core';

export {
  zdpAuthSurfaceProviderIds,
  type ZdpAuthSurfaceLinks,
  type ZdpAuthSurfaceModel,
  type ZdpAuthSurfaceProviderFlags,
  type ZdpAuthSurfaceProviderId,
  type ZdpAuthSurfaceShellModel
} from './auth-surface-model-core';

/** Compatibility configuration; the /components entry requires messages. */
export interface ZdpAuthSurfaceConfig extends Omit<InjectedSurfaceConfig, 'messages'> {
  readonly messages?: ZdpAuthMessages;
}

export function createZdpAuthSurfaceModel(config: ZdpAuthSurfaceConfig): ZdpAuthSurfaceModel {
  return createSurfaceModel({ ...config, messages: config.messages ?? getAuthMessages(config.locale) });
}
