import { Platform } from '@bitdev/platforms.platform';

const SurpriseService = import.meta.resolve('@dvzffse16e/grey-fx.surprise-service');
const GreyFxApp = import.meta.resolve('@dvzffse16e/grey-fx.grey-fx-app');
const PlatformGateway = import.meta.resolve('@bitdev/platforms.backend.gateway-server');

/**
 * GREY FX platform — composes the Christmas Digital Surprise web app
 * with the surprise service behind an API gateway.
 */
export const GreyFxPlatform = Platform.from({
  name: 'grey-fx-platform',

  frontends: {
    main: GreyFxApp,
    mainPortRange: [3000, 3100],
  },

  backends: {
    main: PlatformGateway,
    services: [SurpriseService],
  },
});

export default GreyFxPlatform;
