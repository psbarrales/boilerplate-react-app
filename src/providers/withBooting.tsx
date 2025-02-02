import React, { ReactNode } from "react";
import { composeProviders } from "@providers/composeProvider";
import { withAnalyticsProvider } from "@providers/withAnalyticsProvider";
import { withAppProvider } from "@providers/withAppProvider";
import { withErrorTrackingProvider } from "@providers/withErrorTrackingProvider";
import { withPreferencesStorageProvider } from "@providers/withPreferencesStorageProvider";
import { withPushNotificationsProvider } from "@providers/withPushNotificationProvider";
import { withRemoteConfigProvider } from "@providers/withRemoteConfigProvider";
import { withServiceWorkerProvider } from "./withServiceWorkerProvider";

export const withBooting = (children: ReactNode) => {
    const BootedProviders = React.useMemo(
        () => composeProviders(
            withServiceWorkerProvider,
            withAppProvider,
            withRemoteConfigProvider,
            withAnalyticsProvider,
            withErrorTrackingProvider,
            withPushNotificationsProvider,
            withPreferencesStorageProvider,
        ),
        []
    );

    // Renderizar la aplicación envuelta en todos los providers
    return <BootedProviders>{children}</BootedProviders>;
};
