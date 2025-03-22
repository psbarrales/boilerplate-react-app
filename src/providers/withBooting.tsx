import React, { ReactNode } from "react";
import { composeProviders } from "@providers/composeProvider";
import { WithAnalyticsProvider } from "@providers/withAnalyticsProvider";
import { WithAppProvider } from "@providers/withAppProvider";
import { WithErrorTrackingProvider } from "@providers/withErrorTrackingProvider";
import { WithPreferencesStorageProvider } from "@providers/withPreferencesStorageProvider";
import { WithPushNotificationsProvider } from "@providers/withPushNotificationProvider";
import { WithRemoteConfigProvider } from "@providers/withRemoteConfigProvider";
import { WithReactQueryProvider } from "./withReactQueryProvider";
// import { withServiceWorkerProvider } from "./withServiceWorkerProvider";

export const WithBooting = (children: ReactNode) => {
    const BootedProviders = React.useMemo(
        () => composeProviders(
            // withServiceWorkerProvider,
            WithAppProvider,
            WithRemoteConfigProvider,
            WithAnalyticsProvider,
            WithErrorTrackingProvider,
            WithPushNotificationsProvider,
            WithPreferencesStorageProvider,
            WithReactQueryProvider
        ),
        []
    );

    return <BootedProviders>{children}</BootedProviders>
};
